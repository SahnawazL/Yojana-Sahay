/**
 * Yojana Sahay — Independent Civic Scheme Discovery Platform
 *
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * This file is part of Yojana Sahay — an independent civic technology
 * platform built to help citizens of India discover and access
 * government welfare schemes they are legally entitled to.
 *
 * See the LICENSE file in the project root for full license terms.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue, memo, Suspense } from "react";
import {
  INDIA_STATES,
  SCHEME_DB,
  CATEGORIES,
  getSchemesForCategory,
} from "./schemesData.js";
import schemesMeta from "./schemes-meta.json";
import { auth, db } from "./firebase.js";
import { RecaptchaVerifier, signInWithPhoneNumber, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc, arrayUnion, increment } from "firebase/firestore";
import AIChat from "./AIChat.jsx";
import { generateResultsBrief } from "./groqClient.js";
import AILockedScreen from "./AILockedScreen.jsx";
const AdminDashboard = React.lazy(() => import("./AdminDashboard.jsx"));
import ReportIssueSheet from "./ReportIssueSheet.jsx";
import UserReportsTab from "./UserReportsTab.jsx";
const AboutTab = React.lazy(() => import("./AboutTab.jsx"));
const Helpline  = React.lazy(() => import("./Helpline.jsx"));
import appLogo from "./logo.webp";
import SchemeNewsTicker from "./SchemeNewsTicker.jsx";
import { useOfflineStatus } from "./useOfflineStatus.js";
import { idbSet, idbDelete, idbGet, OFFLINE_KEYS, migrateLocalStorageToIDB } from "./offlineStorage.js";
const HomeFAQSection = React.lazy(() => import("./HomeFAQSection.jsx"));

// ─── ENRICH SCHEME_DB WITH VERIFICATION METADATA ─────────────────────────────
// Merges lastDate, lastVerified, linkAlive, isActive, httpStatus, confidence
// from schemes-meta.json into SCHEME_DB in-place (runs once at module init).
// After each verification run the JSON is committed to GitHub → Vercel redeploys
// → next page load picks up the fresh data automatically.
(function mergeSchemesMeta() {
  for (const [id, meta] of Object.entries(schemesMeta)) {
    const scheme = SCHEME_DB.find(s => s.id === id);
    if (scheme) Object.assign(scheme, meta);
  }
}());


// ─── PREMIUM LOADER ────────────────────────────────────────────────────────────
// Shown as Suspense fallback while lazy chunks (AboutTab, Helpline) download.
// Full-screen dark overlay with crystal gem + 3-dot animations.
function PremiumLoader() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${4 + Math.random() * 6}s`,
    delay: `${Math.random() * 8}s`,
    drift: `${Math.random() * 60 - 30}px`,
  }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0d0d14",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes pl-bg-breathe { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @keyframes pl-orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,20px) scale(1.1)} 66%{transform:translate(-10px,40px) scale(0.95)} }
        @keyframes pl-orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,-30px) scale(1.15)} }
        @keyframes pl-orb3 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-40px) scale(1.1)} }
        @keyframes pl-ring { to{transform:rotate(360deg)} }
        @keyframes pl-core-pulse {
          0%,100%{transform:scale(1);box-shadow:0 0 24px rgba(139,92,246,0.7),0 0 50px rgba(139,92,246,0.35),0 0 100px rgba(139,92,246,0.18),inset 0 1px 0 rgba(255,255,255,0.45)}
          50%{transform:scale(1.06);box-shadow:0 0 36px rgba(139,92,246,1),0 0 72px rgba(139,92,246,0.55),0 0 140px rgba(139,92,246,0.28),inset 0 1px 0 rgba(255,255,255,0.55)}
        }
        @keyframes pl-spark { 0%,100%{opacity:0.2;transform:scale(0.6) translateX(-50%)} 50%{opacity:1;transform:scale(1.6) translateX(-50%)} }
        @keyframes pl-spark-y { 0%,100%{opacity:0.2;transform:scale(0.6) translateY(-50%)} 50%{opacity:1;transform:scale(1.6) translateY(-50%)} }
        @keyframes pl-label-dot { 0%,80%,100%{opacity:0.2;transform:scale(0.7)} 40%{opacity:1;transform:scale(1.5);box-shadow:0 0 5px rgba(167,139,250,0.8)} }
        @keyframes pl-fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pl-fade-cycle { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes pl-dot-bounce { 0%,80%,100%{transform:scale(0.75) translateY(0);opacity:0.4} 40%{transform:scale(1.25) translateY(-8px);opacity:1} }
        @keyframes pl-progress { 0%{left:-50%;width:40%} 100%{left:110%;width:40%} }
        @keyframes pl-particle { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:0.5} 100%{transform:translateY(-640px) translateX(var(--pl-drift));opacity:0} }
      `}</style>

      {/* Ambient background */}
      <div style={{
        position:"absolute",inset:0,
        backgroundImage:"radial-gradient(ellipse 80% 50% at 50% -10%,rgba(120,80,255,0.18) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 100%,rgba(60,180,255,0.10) 0%,transparent 55%),radial-gradient(ellipse 50% 60% at -10% 60%,rgba(180,100,255,0.08) 0%,transparent 50%)",
        animation:"pl-bg-breathe 6s ease-in-out infinite",
      }}/>

      {/* Floating orbs */}
      <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",filter:"blur(40px)",background:"radial-gradient(circle,rgba(139,92,246,0.35) 0%,transparent 70%)",top:-60,left:-40,animation:"pl-orb1 8s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:160,height:160,borderRadius:"50%",filter:"blur(40px)",background:"radial-gradient(circle,rgba(59,130,246,0.25) 0%,transparent 70%)",bottom:-40,right:-30,animation:"pl-orb2 10s ease-in-out infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:120,height:120,borderRadius:"50%",filter:"blur(40px)",background:"radial-gradient(circle,rgba(168,85,247,0.20) 0%,transparent 70%)",top:"50%",right:-20,animation:"pl-orb3 7s ease-in-out infinite",pointerEvents:"none"}}/>

      {/* Corner accents */}
      {[["top","left","borderTop","borderLeft"],["top","right","borderTop","borderRight"],["bottom","left","borderBottom","borderLeft"],["bottom","right","borderBottom","borderRight"]].map(([v,h,b1,b2],i)=>(
        <div key={i} style={{position:"absolute",width:24,height:24,opacity:0.25,[v]:24,[h]:24,[b1]:"1px solid #a78bfa",[b2]:"1px solid #a78bfa"}}/>
      ))}

      {/* Floating particles */}
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute",width:2,height:2,borderRadius:"50%",
          background:"rgba(167,139,250,0.6)",
          left:p.left,bottom:-4,opacity:0,
          "--pl-drift":p.drift,
          animation:`pl-particle ${p.duration} linear ${p.delay} infinite`,
        }}/>
      ))}

      {/* ── Central content ── */}
      <div style={{position:"relative",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center"}}>

        {/* Loading • • • */}
        <div style={{
          display:"flex",alignItems:"center",gap:4,
          fontSize:9,fontWeight:600,letterSpacing:4,textTransform:"uppercase",
          color:"rgba(167,139,250,0.6)",marginBottom:14,fontFamily:"Georgia,serif",
        }}>
          <span>Loading</span>
          <div style={{display:"flex",alignItems:"center",gap:3,marginLeft:2}}>
            {[0,1,2].map(i=>(
              <span key={i} style={{
                display:"inline-block",width:3,height:3,borderRadius:"50%",
                background:"rgba(167,139,250,0.9)",
                animation:`pl-label-dot 1.4s ease-in-out ${i*0.22}s infinite`,
              }}/>
            ))}
          </div>
        </div>

        {/* Crystal gem — 148px */}
        <div style={{position:"relative",width:148,height:148,marginBottom:40}}>
          {/* Outer ring */}
          <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",background:"linear-gradient(#0d0d14,#0d0d14) padding-box,conic-gradient(from 0deg,transparent 0%,#8b5cf6 30%,#3b82f6 50%,transparent 55%,transparent 100%) border-box",animation:"pl-ring 3s linear infinite"}}/>
          {/* Mid ring */}
          <div style={{position:"absolute",inset:14,borderRadius:"50%",border:"1.5px solid transparent",background:"linear-gradient(#0d0d14,#0d0d14) padding-box,conic-gradient(from 180deg,transparent 0%,#a78bfa 25%,#60a5fa 40%,transparent 45%,transparent 100%) border-box",animation:"pl-ring 2s linear infinite reverse"}}/>
          {/* Inner ring */}
          <div style={{position:"absolute",inset:28,borderRadius:"50%",border:"1px solid transparent",background:"linear-gradient(#0d0d14,#0d0d14) padding-box,conic-gradient(from 90deg,transparent 0%,#c4b5fd 20%,transparent 25%,transparent 100%) border-box",animation:"pl-ring 1.2s linear infinite"}}/>
          {/* Core */}
          <div style={{position:"absolute",inset:42,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%,rgba(196,181,253,0.9) 0%,rgba(139,92,246,0.7) 35%,rgba(88,28,220,0.9) 70%,rgba(30,10,80,1) 100%)",animation:"pl-core-pulse 2.4s ease-in-out infinite"}}/>
          {/* Sparkles */}
          <div style={{position:"absolute",width:4,height:4,borderRadius:"50%",background:"#e9d5ff",boxShadow:"0 0 8px #a78bfa",top:3,left:"50%",animation:"pl-spark 2s ease-in-out 0s infinite"}}/>
          <div style={{position:"absolute",width:4,height:4,borderRadius:"50%",background:"#e9d5ff",boxShadow:"0 0 8px #a78bfa",top:"50%",right:3,animation:"pl-spark-y 2s ease-in-out 0.5s infinite"}}/>
          <div style={{position:"absolute",width:4,height:4,borderRadius:"50%",background:"#e9d5ff",boxShadow:"0 0 8px #a78bfa",bottom:3,left:"50%",animation:"pl-spark 2s ease-in-out 1s infinite"}}/>
          <div style={{position:"absolute",width:4,height:4,borderRadius:"50%",background:"#e9d5ff",boxShadow:"0 0 8px #a78bfa",top:"50%",left:3,animation:"pl-spark-y 2s ease-in-out 1.5s infinite"}}/>
        </div>

        {/* App name */}
        <div style={{fontSize:22,fontWeight:300,color:"rgba(255,255,255,0.92)",letterSpacing:1,marginBottom:6,fontFamily:"Georgia,serif",animation:"pl-fade-up 0.8s ease both"}}>
          Yojana Sahay
        </div>
        {/* Subtitle */}
        <div style={{fontSize:11,color:"rgba(167,139,250,0.55)",letterSpacing:0.5,fontFamily:"Georgia,serif",marginBottom:36,animation:"pl-fade-cycle 4s ease-in-out 1s infinite"}}>
          Preparing your experience
        </div>

        {/* 3 bouncing dots */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28}}>
          {[
            {color:"#a78bfa",shadow:"rgba(167,139,250,0.7)",delay:"0s"},
            {color:"#8b5cf6",shadow:"rgba(139,92,246,0.6)", delay:"0.18s"},
            {color:"#6d28d9",shadow:"rgba(109,40,217,0.5)", delay:"0.36s"},
          ].map((d,i)=>(
            <div key={i} style={{
              width:7,height:7,borderRadius:"50%",
              background:d.color,
              boxShadow:`0 0 10px ${d.shadow}`,
              animation:`pl-dot-bounce 1.4s ease-in-out ${d.delay} infinite`,
            }}/>
          ))}
        </div>

        {/* Shimmer progress bar */}
        <div style={{width:160,height:1.5,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,bottom:0,width:"40%",background:"linear-gradient(90deg,transparent,#8b5cf6,#a78bfa,transparent)",borderRadius:99,animation:"pl-progress 1.8s ease-in-out infinite"}}/>
        </div>
      </div>
    </div>
  );
}

// ─── OFFLINE BANNER ────────────────────────────────────────────────────────────
// Shown as a slim fixed strip at the top when navigator.onLine is false.
// Reassures the user that scheme data is still available (it's statically
// bundled) while noting that AI and profile sync need internet.
function OfflineBanner({ lang, dark }) {
  const isHindi = lang === "hi";
  const bf = fontFamily(lang);
  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, zIndex:9998,
      background: dark ? "rgba(28,14,0,0.97)" : "rgba(255,247,237,0.97)",
      borderBottom:`1px solid ${dark?"rgba(133,77,14,0.5)":"rgba(253,186,116,0.8)"}`,
      backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)",
      padding:"7px 16px",
      display:"flex", alignItems:"center", gap:10,
      animation:"offlineBannerIn 0.28s cubic-bezier(0.22,1,0.36,1) both",
    }}>
      {/* Wi-Fi off SVG icon */}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke={dark?"#FCD34D":"#92400E"} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
        <path d="M10.71 5.05A16 16 0 0122.56 9"/>
        <path d="M1.42 9a15.91 15.91 0 014.7-2.88"/>
        <path d="M8.53 16.11a6 6 0 016.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:12, fontWeight:700, color:dark?"#FCD34D":"#92400E", fontFamily:bf, lineHeight:1.3}}>
          {isHindi ? "आप ऑफलाइन हैं" : "You're Offline"}
        </div>
        <div style={{fontSize:10.5, color:dark?"rgba(253,211,77,0.65)":"#B45309", fontFamily:bf, marginTop:1.5, lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
          {isHindi
            ? "योजना डेटा उपलब्ध है · AI सुविधाओं के लिए इंटरनेट चाहिए"
            : "Scheme data available · AI features need internet"}
        </div>
      </div>
      {/* Pulsing dot */}
      <div style={{width:7, height:7, borderRadius:"50%", flexShrink:0,
        background:dark?"#FCD34D":"#D97706",
        boxShadow:`0 0 8px ${dark?"rgba(253,211,77,0.7)":"rgba(217,119,6,0.5)"}`,
        animation:"badgePulse 1.8s ease-in-out infinite",
      }}/>
    </div>
  );
}

// ─── COUNT-UP HOOK ─────────────────────────────────────────────────────────────
function useCountUp(targets, trigger, duration=1400){
  const [counts,setCounts]=useState(targets.map(()=>0));
  const raf=useRef(null);
  // Refs keep the latest targets/duration accessible inside the effect
  // without making them deps — avoids re-triggering on every array reference change.
  const targetsRef=useRef(targets);
  const durationRef=useRef(duration);
  useEffect(()=>{ targetsRef.current=targets; },[targets]);
  useEffect(()=>{ durationRef.current=duration; },[duration]);

  useEffect(()=>{
    const t=targetsRef.current;
    const d=durationRef.current;
    if(!trigger){setCounts(t.map(()=>0));return;}
    const start=performance.now();
    const step=(now)=>{
      const p=Math.min((now-start)/d,1);
      const ease=1-Math.pow(1-p,3); // cubic ease-out
      setCounts(t.map(v=>Math.floor(ease*v)));
      if(p<1) raf.current=requestAnimationFrame(step);
    };
    raf.current=requestAnimationFrame(step);
    return()=>{if(raf.current)cancelAnimationFrame(raf.current);};
  },[trigger]); // trigger is the only true re-run signal; targets/duration read via refs
  return counts;
}
// ─── HAPTIC FEEDBACK ───────────────────────────────────────────────────────────
// navigator.vibrate works on Android Chrome. iOS ignores it silently.
// Patterns: "light"=30ms, default=50ms, "medium"=80ms, "double"=[50,60,50]
const haptic = (pattern = 50) => { try { navigator.vibrate?.(pattern); } catch {} };

// ─── URL HELPERS ───────────────────────────────────────────────────────────────
// Prevents double https:// if the stored URL already includes a protocol
const safeApplyUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};
// Opens a Google search for the scheme so offline/CSC schemes are still actionable
const googleSearchScheme = (name) => {
  window.open(`https://www.google.com/search?q=${encodeURIComponent(name+" scheme apply")}`, "_blank");
};

// ─── STAT TARGETS are now computed live inside YojanaSahay() ──────────────────
// Scheme count  → SCHEME_DB.length (real, instant)
// States        → 28 (static)
// Indians Helped → appStats/usage → checkerTotal (real Firestore read)

// ─── LAST VERIFIED DATE — Freshness Badge ──────────────────────────────────────
// Walks SCHEME_DB (already merged with schemesMeta at module init) and finds the
// most recent lastVerified timestamp to display as a trust signal on the home screen.
// Returns null if no scheme has been verified yet — badge is safely hidden.
const LAST_VERIFIED_DATE = (() => {
  let latest = 0;
  for (const s of SCHEME_DB) {
    if (s.lastVerified) {
      const t = new Date(s.lastVerified).getTime();
      if (!isNaN(t) && t > latest) latest = t;
    }
  }
  return latest > 0 ? new Date(latest) : null;
})();
// "15 Jun 2026" — matches the date format used across SchemeCard components
const LAST_VERIFIED_LABEL = LAST_VERIFIED_DATE
  ? LAST_VERIFIED_DATE.toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"})
  : null;

// ─── VERIFICATION STATS — for smart trust banner across scheme lists ────────────
// Runs once at module init using the already-merged SCHEME_DB.
const VERIFICATION_STATS = (()=>{
  let verified=0, live=0;
  for(const s of SCHEME_DB){
    if(s.lastVerified!=null) verified++;
    if(s.linkAlive===true) live++;
  }
  const total=SCHEME_DB.length;
  // pctLive: % of verified schemes whose link is confirmed live
  const pctLive=verified>0?Math.round((live/verified)*100):0;
  return { total, verified, live, pctLive };
})();

const STORAGE_KEY      = "yojana_eligibility_answers";
const BRIEF_CACHE_KEY  = "yojana_brief_cache";
// Stable serialisation for answer fingerprinting — sorted keys avoid false misses
const answerFingerprint = (ans) =>
  JSON.stringify(Object.keys(ans).sort().reduce((o,k)=>{o[k]=ans[k];return o;},{}));

// ─── REVEAL SCREEN ICONS (stable — module level) ───────────────────────────────
// Positions are % within the 300×260 icon-orbit container; anim = CSS keyframe name
const REVEAL_ICONS = [
  {icon:"🌾", x:"18%", y:"18%", anim:"fly-from-tl", delay:"0s"   },
  {icon:"💰", x:"70%", y:"18%", anim:"fly-from-tr", delay:"0.07s"},
  {icon:"🏠", x:"10%", y:"50%", anim:"fly-from-l",  delay:"0.14s"},
  {icon:"📚", x:"80%", y:"50%", anim:"fly-from-r",  delay:"0.04s"},
  {icon:"👴", x:"18%", y:"72%", anim:"fly-from-bl", delay:"0.11s"},
  {icon:"🏥", x:"68%", y:"72%", anim:"fly-from-br", delay:"0.18s"},
  {icon:"💊", x:"44%", y:"12%", anim:"fly-from-t",  delay:"0.02s"},
  {icon:"🚜", x:"44%", y:"80%", anim:"fly-from-b",  delay:"0.15s"},
];
// ─── CATEGORY SVG ICONS (replaces emojis for a premium, professional look) ────
const CATEGORY_ICONS = {
  farmer: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V8"/><path d="M8 8C8 5 10 3 12 3s4 2 4 5c0 2-4 6-4 6S8 10 8 8z"/>
      <path d="M6 17a4 4 0 014-4"/><path d="M18 17a4 4 0 00-4-4"/>
    </svg>
  ),
  student: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  women: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 00-16 0"/>
    </svg>
  ),
  senior: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="5" r="3"/>
      <path d="M7 22v-5l-2-4a4 4 0 014-4h4a4 4 0 014 4l-2 4v5"/><path d="M16 17l3 5"/>
    </svg>
  ),
  business: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    </svg>
  ),
  housing: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21v-6h6v6"/>
    </svg>
  ),
  health: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  insurance: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  pension: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  free: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5" rx="1"/><path d="M12 22V7"/>
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  skill: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  child: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="5" r="3"/><path d="M3 21a6 6 0 0112 0"/>
      <circle cx="18" cy="8" r="2"/><path d="M14 21a4 4 0 018 0"/>
    </svg>
  ),
  labour: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  food: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1"/>
      <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  rural: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20l6-11 5 8 3-4 4 7H3z"/>
    </svg>
  ),
  disability: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="4" r="2"/>
      <path d="M10 3L8 14l4-2 2 6"/>
      <path d="M14 19c0 2-1.8 3-4 3a4 4 0 010-8h4"/>
    </svg>
  ),
  solar: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  maternity: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
};
// filterKey aliases — handle any naming variant in schemesData.js
CATEGORY_ICONS.skillYouth   = CATEGORY_ICONS.skill;
CATEGORY_ICONS.childGirl    = CATEGORY_ICONS.child;
CATEGORY_ICONS.freeBenefits = CATEGORY_ICONS.free;
// Fallback star icon for any unknown future category
CATEGORY_ICONS.default = (c) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ─── TAB ORDER (stable reference — defined once at module level) ───────────────
const TABS = ["home","search","schemes","ai","profile"];
const fontFamily = (lang) => lang==="hi"
  ? "'Noto Sans Devanagari',sans-serif"
  : "'Noto Sans',sans-serif";

// ─── INDIA FLAG COLORS ─────────────────────────────────────────────────────────
const SAFFRON    = "#FF9933";
const IND_GREEN  = "#138808";
const ASHOKA_BLUE= "#06038D";
const NAVY_BLUE  = "#003580";

// ─── THEME TOKENS ──────────────────────────────────────────────────────────────
const THEME={
  light:{
    appBg:"#f5f5f0",card:"#fff",card2:"#f8f9fa",
    text:"#1a1a1a",textMid:"#555",textSub:"#888",textLight:"#aaa",
    border:"#f0f0f0",border2:"#e8e8e8",border3:"#e0e0e0",
    inputBg:"#fff",searchBg:"#f5f5f0",pillBg:"#f5f5f0",
    optionBg:"#fff",optionActive:"#FFF7ED",divider:"#f3f3f3",
    navBg:"#fff",navBorder:"#f0f0f0",handle:"#e0e0e0",handle2:"#e4e4e4",
  },
  dark:{
    appBg:"#111111",card:"#1c1c1e",card2:"#252527",
    text:"#f0f0f0",textMid:"#aaa",textSub:"#888",textLight:"#555",
    border:"#2c2c2e",border2:"#3a3a3c",border3:"#3a3a3c",
    inputBg:"#2c2c2e",searchBg:"#2c2c2e",pillBg:"#2c2c2e",
    optionBg:"#2c2c2e",optionActive:"#2d1800",divider:"#2c2c2e",
    navBg:"#1c1c1e",navBorder:"#2c2c2e",handle:"#3a3a3c",handle2:"#3a3a3c",
  }
};

// ─── ASHOKA CHAKRA SVG (24-spoke wheel) ────────────────────────────────────────
// Stable index array — never changes, no reason to recreate it per render
const SPOKE_INDICES=Array.from({length:24},(_,i)=>i);
// Cache of precomputed spoke coords keyed by size (sizes used: 18, 22, 24 …)
const _spokeCoordsCache=new Map();
function getSpokeCoords(size){
  if(_spokeCoordsCache.has(size))return _spokeCoordsCache.get(size);
  const cx=size/2,cy=size/2,r=size/2-1,innerR=r*0.28;
  const coords=SPOKE_INDICES.map(i=>{
    const a=(i*360/24)*Math.PI/180;
    return{i,x1:cx+innerR*Math.cos(a),y1:cy+innerR*Math.sin(a),x2:cx+r*0.78*Math.cos(a),y2:cy+r*0.78*Math.sin(a)};
  });
  _spokeCoordsCache.set(size,coords);
  return coords;
}
function AshokaChakra({size=18,color=ASHOKA_BLUE,spinning=false}){
  const cx=size/2,cy=size/2,r=size/2-1,innerR=r*0.28;
  const spokeCoords=getSpokeCoords(size);
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{flexShrink:0,animation:spinning?"chakra-spin 3s linear infinite":"none"}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size*0.055}/>
      <circle cx={cx} cy={cy} r={innerR} fill={color}/>
      {spokeCoords.map(({i,x1,y1,x2,y2})=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={size*0.042}/>
      ))}
    </svg>
  );
}

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────────
// Precomputed spoke lines for the fixed 220×220 decorative watermark chakra
// (cx=110, cy=110, r=100, ir=28 — never changes)
const WATERMARK_SPOKES=(()=>{
  const cx=110,cy=110,r=100,ir=28;
  return SPOKE_INDICES.map(i=>{
    const a=(i*360/24)*Math.PI/180;
    return{i,x1:cx+ir*Math.cos(a),y1:cy+ir*Math.sin(a),x2:cx+r*0.78*Math.cos(a),y2:cy+r*0.78*Math.sin(a)};
  });
})();
const T = {
  en: {
    appName:"Yojana Sahay", appSub:"Scheme Discovery Platform",
    greeting:(n)=> n ? `Namaste, ${n} 🙏` : "Namaste, Citizen 🙏",
    headline:"Find Your Schemes", subheadline:"Discover benefits you truly deserve",
    searchPlaceholder:"Search schemes...", searchBtn:"Search",
    stats:[{number:"—",label:"Schemes"},{number:"28",label:"States"},{number:"—",label:"Indians Helped"}],
    aiBannerTitle:"Ask AI Assistant", aiBannerSub:"Ask anything about any scheme in Hindi or English",
    categoriesTitle:"Categories", categoriesSub:"Browse by Category", seeAll:"See All →",
    ctaTitle:"Check Eligibility",
    ctaSub:(hp)=> hp ? "Results ready from your profile · Tap to view" : "Answer 7–11 smart questions · AI guidance on your results",
    ctaBtn:(hp)=> hp ? "View My Schemes →" : "Start Now →",
    schemesTitle:"Popular Schemes", schemesSub:"Top government benefits",
    matchedTitle:"Matched for You", matchedSub:(n)=>`${n} scheme${n!==1?"s":""} you qualify for`,
    noProfileTitle:"Get Personalised Schemes", noProfileSub:"Complete your profile once — we'll show schemes tailored just for you.",
    setupProfileBtn:"Set Up Profile",

    navHome:"Home", navSearch:"Search", navSchemes:"Schemes", navAI:"AI Help", navProfile:"Profile",
    checkerTitle:"Eligibility Check", checkerSub:"Check complete · Ask AI about your results",
    stepOf:(c,t)=>`Step ${c} of ${t}`,
    nextBtn:"Next →", backBtn:"← Back", checkBtn:"Find My Schemes 🎯",
    matchSub:(n)=>`You qualify for ${n} scheme${n!==1?"s":""}`,
    estimateTitle:"What These Numbers Mean",
    estimateShort:"This is an estimate, not a guaranteed payout — tap to understand how it works",
    estimateLess:"Show less",
    estimatePoints:[
      "These are schemes you may be eligible for based on your answers — being shown here is not the same as automatic approval.",
      "The ₹ amount shown is the combined MAXIMUM benefit only if you successfully apply to and get approved for every matched scheme — not a guaranteed payout.",
      "Each scheme has its own application process and is verified separately by its respective government department.",
      "Keep your documents accurate and ready — incomplete or incorrect documents are the most common reason eligible applicants get rejected.",
    ],
    centralLabel:"🇮🇳 Central", stateLabel:(s)=>`📍 ${s}`,
    noMatchTitle:"No exact matches", noMatchSub:"Try a different state or change your answers",
    retakeBtn:"Retake", doneBtn:"Done", fixAnswerBtn:"← Fix my answer",
    applyLabel:"How to Apply", docsLabel:"Documents Needed", totalBenefit:"Total annual benefit",
    nearMissTitle:"You're Almost Eligible 🎯",
    nearMissSub:"These schemes are just out of reach. Here's what's missing:",
    nearMissMissing:"Missing:",
    nearMissCriteria:{
      who_farmer:"Must be a Farmer",
      who_student:"Must be a Student",
      who_women:"Must be a Woman / Homemaker",
      who_senior:"Must be a Senior Citizen",
      who_business:"Must be a Business Owner",
      income_lower:"Income must be lower",
      income_below1:"Income below ₹1 Lakh",
      income_1to3:"Income below ₹3 Lakh",
      income_below3:"Income below ₹3 Lakh",
      income_below6:"Income below ₹6 Lakh",
      house_no:"Should not own a pucca house",
      house_kutcha:"Need kutcha/no house",
      area_rural:"Must live in rural area",
      area_urban:"Must live in urban/semi-urban area",
      age_above60:"Age must be 60+",
      age_below18:"Age must be below 18",
      age_18to35:"Age must be 18–35",
      state_match:"Not available in your state",
      caste_reserved:"Must be SC / ST / OBC / EWS category",
    },
    searchStatePh:"Search your state...",
    centralSchemes:"Central Government Schemes", stateSchemes:"State Government Schemes",
    profileTitle:"My Profile", setupTitle:"Set Up Profile", setupSub:"Fill once · Used everywhere",
    editBtn:"Edit", matchedBtn:"My Matched Schemes", saveBtn:"Save Profile ✓", skipBtn:"Skip",
    profileStats:["Schemes matched","Docs saved","Guided"],
    // Category filter sheet
    catSchemes:"Schemes", backHome:"← Back", allSchemes:"All Schemes",
    noSchemesFound:"No schemes found for this category.",
    steps:[
      {title:"Personal Details",sub:"Tell us about yourself",icon:"👤"},
      {title:"Your Location",sub:"Where do you live?",icon:"📍"},
      {title:"Family & Income",sub:"Your household details",icon:"👨‍👩‍👧"},
      {title:"Occupation",sub:"What do you do?",icon:"💼"},
      {title:"Documents",sub:"Basic document info",icon:"📄"},
    ],
    fields:{
      name:"Full Name", namePh:"Enter your full name",
      gender:"Gender", genders:[{v:"male",l:"Male 👨"},{v:"female",l:"Female 👩"},{v:"other",l:"Other 🧑"}],
      age:"Age Group", ages:[{v:"below18",l:"Below 18"},{v:"18to35",l:"18–35 yrs"},{v:"35to60",l:"35–60 yrs"},{v:"above60",l:"Above 60"}],
      state:"State / UT", selectState:"Select your state",
      area:"Area Type", areas:[{v:"rural",l:"Rural / Village 🏡"},{v:"urban",l:"Urban / City 🏙️"},{v:"semi",l:"Semi-urban 🏘️"}],
      family:"Family Size", families:[{v:"1to2",l:"1–2 members"},{v:"3to4",l:"3–4 members"},{v:"5to6",l:"5–6 members"},{v:"7plus",l:"7 or more"}],
      income:"Annual Household Income", incomes:[{v:"below1",l:"Below ₹1 Lakh"},{v:"1to3",l:"₹1–3 Lakh"},{v:"3to6",l:"₹3–6 Lakh"},{v:"above6",l:"Above ₹6 Lakh"}],
      caste:"Category", castes:[{v:"general",l:"General"},{v:"obc",l:"OBC"},{v:"sc",l:"SC"},{v:"st",l:"ST"},{v:"ews",l:"EWS"}],
      occupation:"Occupation", occupations:[{v:"farmer",l:"Farmer 🌾"},{v:"student",l:"Student 📚"},{v:"women",l:"Homemaker 👩"},{v:"senior",l:"Senior Citizen 👴"},{v:"business",l:"Business 💼"},{v:"general",l:"Salaried 🧑"}],
      house:"Do you own a pucca house?", houses:[{v:"yes",l:"Yes — I have a house"},{v:"no",l:"No — I need housing"},{v:"kutcha",l:"Kutcha / Temporary"}],
      aadhaar:"Aadhaar (last 4 digits)", aadhaarPh:"e.g. 4521",
      bank:"Bank Account Number", bankPh:"Enter account number",
      phone:"Mobile Number", phonePh:"10-digit number",
    },
    questions:[
      {id:"who",   q:"Who are you?",               icon:"👤", hint:"Select what best describes you",
        options:[{value:"farmer",label:"Farmer 🌾"},{value:"student",label:"Student 📚"},{value:"women",label:"Woman 👩"},{value:"senior",label:"Senior Citizen 👴"},{value:"business",label:"Business Owner 💼"},{value:"general",label:"General Citizen 🧑"}]},
      {id:"income",q:"Annual household income?",   icon:"💰", hint:"Total family income per year",
        options:[{value:"below1",label:"Below ₹1 Lakh"},{value:"1to3",label:"₹1–3 Lakh"},{value:"3to6",label:"₹3–6 Lakh"},{value:"above6",label:"Above ₹6 Lakh"}]},
      {id:"state", q:"Which state do you live in?",icon:"🗺️", hint:"Central + your state schemes will be shown", type:"state"},
      {id:"house", q:"Do you own a pucca house?",  icon:"🏠", hint:"Pucca = permanent brick/concrete house",
        options:[{value:"no",label:"No — I need housing"},{value:"yes",label:"Yes — I have a house"},{value:"kutcha",label:"Kutcha / Temporary"}]},
      {id:"caste", q:"Your social category?",      icon:"🪪", hint:"Used to match SC/ST/OBC reserved schemes",
        options:[{value:"general",label:"General"},{value:"obc",label:"OBC"},{value:"sc",label:"SC (Scheduled Caste)"},{value:"st",label:"ST (Scheduled Tribe)"},{value:"ews",label:"EWS"}]},
      {id:"age",   q:"What is your age?",          icon:"🎂", hint:"Age of the main applicant",
        options:[{value:"below18",label:"Below 18"},{value:"18to35",label:"18–35 years"},{value:"35to60",label:"35–60 years"},{value:"above60",label:"Above 60 years"}]},
      {id:"area",  q:"Your area type?",            icon:"📍", hint:"Your residential area",
        options:[{value:"rural",label:"Rural / Village 🏡"},{value:"urban",label:"Urban / City 🏙️"},{value:"semi",label:"Semi-urban / Town 🏘️"}]},
    ],
    // ── Adaptive / conditional bonus questions ──────────────────────────────
    // Injected into the live queue based on earlier answers
    adaptiveQuestions:{
      landHolding:{
        id:"landHolding", q:"How much farm land do you own?", icon:"🌾",
        hint:"Kisan schemes are gated by land size",
        options:[
          {value:"below1",label:"Below 1 Acre"},
          {value:"1to2",  label:"1–2 Acres"},
          {value:"2to5",  label:"2–5 Acres"},
          {value:"5plus", label:"5+ Acres"},
        ],
      },
      educationLevel:{
        id:"educationLevel", q:"What is your current education level?", icon:"📚",
        hint:"Scholarship eligibility differs by class",
        options:[
          {value:"class1to8",  label:"Class 1–8 (Primary / Middle)"},
          {value:"class9to12", label:"Class 9–12 (Secondary)"},
          {value:"undergrad",  label:"Undergraduate (Degree / Diploma)"},
          {value:"postgrad",   label:"Postgraduate (Masters / PhD)"},
        ],
      },
      rationCard:{
        id:"rationCard", q:"What type of ration card do you have?", icon:"🪪",
        hint:"BPL / AAY card unlocks major welfare schemes",
        options:[
          {value:"none", label:"None / Not Applicable 🚫"},
          {value:"apl",  label:"APL — Above Poverty Line"},
          {value:"bpl",  label:"BPL — Below Poverty Line 🟡"},
          {value:"aay",  label:"AAY — Antyodaya (Poorest) 🔴"},
        ],
      },
    },
  },
  hi: {
    appName:"योजना सहाय", appSub:"योजना खोज मंच",
    greeting:(n)=> n ? `नमस्ते, ${n} 🙏` : "नमस्ते, नागरिक 🙏",
    headline:"आपकी योजनाएं खोजें", subheadline:"जानें आप किन लाभों के हकदार हैं",
    searchPlaceholder:"योजना खोजें...", searchBtn:"खोजें",
    stats:[{number:"—",label:"योजनाएं"},{number:"28",label:"राज्य"},{number:"—",label:"मदद मिली"}],
    aiBannerTitle:"AI सहायक से पूछें", aiBannerSub:"हिंदी या अंग्रेज़ी में कोई भी सवाल पूछें",
    categoriesTitle:"श्रेणियां", categoriesSub:"श्रेणी के अनुसार देखें", seeAll:"सभी देखें →",
    ctaTitle:"पात्रता जांचें",
    ctaSub:(hp)=> hp ? "प्रोफाइल से परिणाम तैयार · देखें" : "7–11 स्मार्ट प्रश्नों के उत्तर दें · AI से मार्गदर्शन पाएं",
    ctaBtn:(hp)=> hp ? "मेरी योजनाएं →" : "शुरू करें →",
    schemesTitle:"लोकप्रिय योजनाएं", schemesSub:"शीर्ष सरकारी लाभ",
    matchedTitle:"आपके लिए योजनाएं", matchedSub:(n)=>`${n} योजनाएं जिनके आप पात्र हैं`,
    noProfileTitle:"अपनी योजनाएं पर्सनल बनाएं", noProfileSub:"एक बार प्रोफाइल बनाएं — हम आपके लिए सही योजनाएं दिखाएंगे।",
    setupProfileBtn:"प्रोफाइल बनाएं",

    navHome:"होम", navSearch:"खोजें", navSchemes:"योजनाएं", navAI:"AI", navProfile:"प्रोफाइल",
    checkerTitle:"पात्रता जांच", checkerSub:"जांच पूरी · AI से मार्गदर्शन लें",
    stepOf:(c,t)=>`सवाल ${c} / ${t}`,
    nextBtn:"अगला →", backBtn:"← वापस", checkBtn:"मेरी योजनाएं खोजें 🎯",
    matchSub:(n)=>`आप ${n} योजना${n!==1?"ओं":""} के हकदार हैं`,
    estimateTitle:"ये आंकड़े क्या दर्शाते हैं",
    estimateShort:"यह एक अनुमान है, गारंटी नहीं — समझने के लिए टैप करें",
    estimateLess:"कम दिखाएं",
    estimatePoints:[
      "ये वे योजनाएं हैं जिनके लिए आप अपने जवाबों के अनुसार शायद पात्र हैं — यहां दिखना स्वतः स्वीकृति नहीं है।",
      "दिखाई गई ₹ राशि अधिकतम संभावित कुल लाभ है — सिर्फ तभी जब आप हर मिलान योजना के लिए सफलतापूर्वक आवेदन करें और मंज़ूरी मिले — यह गारंटीशुदा राशि नहीं है।",
      "हर योजना की अपनी अलग आवेदन प्रक्रिया है और संबंधित सरकारी विभाग द्वारा अलग से सत्यापित की जाती है।",
      "अपने दस्तावेज़ सही और तैयार रखें — गलत या अधूरे दस्तावेज़ ही पात्र लोगों के आवेदन रद्द होने की सबसे बड़ी वजह हैं।",
    ],
    centralLabel:"🇮🇳 केंद्रीय", stateLabel:(s)=>`📍 ${s}`,
    noMatchTitle:"कोई मिलान नहीं", noMatchSub:"राज्य या जवाब बदलकर दोबारा कोशिश करें",
    retakeBtn:"फिर से", doneBtn:"पूरा हुआ", fixAnswerBtn:"← जवाब ठीक करें",
    applyLabel:"आवेदन कैसे करें", docsLabel:"ज़रूरी दस्तावेज़", totalBenefit:"कुल वार्षिक लाभ",
    nearMissTitle:"लगभग पात्र हैं आप 🎯",
    nearMissSub:"ये योजनाएं बस थोड़ी दूर हैं। यह कमी है:",
    nearMissMissing:"कमी:",
    nearMissCriteria:{
      who_farmer:"किसान होना ज़रूरी है",
      who_student:"छात्र होना ज़रूरी है",
      who_women:"महिला / गृहिणी होना ज़रूरी है",
      who_senior:"वरिष्ठ नागरिक होना ज़रूरी है",
      who_business:"व्यापारी होना ज़रूरी है",
      income_lower:"आय कम होनी चाहिए",
      income_below1:"आय ₹1 लाख से कम चाहिए",
      income_1to3:"आय ₹3 लाख से कम चाहिए",
      income_below3:"आय ₹3 लाख से कम चाहिए",
      income_below6:"आय ₹6 लाख से कम चाहिए",
      house_no:"पक्का मकान नहीं होना चाहिए",
      house_kutcha:"कच्चा/कोई मकान नहीं होना चाहिए",
      area_rural:"ग्रामीण क्षेत्र में रहना ज़रूरी है",
      area_urban:"शहरी/अर्ध-शहरी क्षेत्र में रहना ज़रूरी है",
      age_above60:"उम्र 60+ होनी चाहिए",
      age_below18:"उम्र 18 से कम होनी चाहिए",
      age_18to35:"उम्र 18–35 होनी चाहिए",
      state_match:"आपके राज्य में उपलब्ध नहीं",
      caste_reserved:"SC / ST / OBC / EWS श्रेणी होना ज़रूरी है",
    },
    searchStatePh:"अपना राज्य खोजें...",
    centralSchemes:"केंद्र सरकार की योजनाएं", stateSchemes:"राज्य सरकार की योजनाएं",
    profileTitle:"मेरी प्रोफाइल", setupTitle:"प्रोफाइल बनाएं", setupSub:"एक बार भरें · हर जगह काम आएगा",
    editBtn:"बदलें", matchedBtn:"मेरी योजनाएं", saveBtn:"सहेजें ✓", skipBtn:"छोड़ें",
    profileStats:["मिलान योजनाएं","दस्तावेज़","सहायता"],
    catSchemes:"योजनाएं", backHome:"← वापस", allSchemes:"सभी योजनाएं",
    noSchemesFound:"इस श्रेणी में कोई योजना नहीं मिली।",
    steps:[
      {title:"व्यक्तिगत विवरण",sub:"अपने बारे में बताएं",icon:"👤"},
      {title:"आपका स्थान",sub:"आप कहाँ रहते हैं?",icon:"📍"},
      {title:"परिवार और आय",sub:"घर की जानकारी",icon:"👨‍👩‍👧"},
      {title:"व्यवसाय",sub:"आप क्या करते हैं?",icon:"💼"},
      {title:"दस्तावेज़",sub:"बुनियादी जानकारी",icon:"📄"},
    ],
    fields:{
      name:"पूरा नाम", namePh:"अपना पूरा नाम लिखें",
      gender:"लिंग", genders:[{v:"male",l:"पुरुष 👨"},{v:"female",l:"महिला 👩"},{v:"other",l:"अन्य 🧑"}],
      age:"आयु वर्ग", ages:[{v:"below18",l:"18 से कम"},{v:"18to35",l:"18–35 वर्ष"},{v:"35to60",l:"35–60 वर्ष"},{v:"above60",l:"60 से अधिक"}],
      state:"राज्य / केंद्र शासित प्रदेश", selectState:"अपना राज्य चुनें",
      area:"क्षेत्र का प्रकार", areas:[{v:"rural",l:"ग्रामीण 🏡"},{v:"urban",l:"शहरी 🏙️"},{v:"semi",l:"अर्ध-शहरी 🏘️"}],
      family:"परिवार का आकार", families:[{v:"1to2",l:"1–2 सदस्य"},{v:"3to4",l:"3–4 सदस्य"},{v:"5to6",l:"5–6 सदस्य"},{v:"7plus",l:"7 या अधिक"}],
      income:"वार्षिक घरेलू आय", incomes:[{v:"below1",l:"₹1 लाख से कम"},{v:"1to3",l:"₹1–3 लाख"},{v:"3to6",l:"₹3–6 लाख"},{v:"above6",l:"₹6 लाख से अधिक"}],
      caste:"श्रेणी", castes:[{v:"general",l:"सामान्य"},{v:"obc",l:"ओबीसी"},{v:"sc",l:"अनु. जाति"},{v:"st",l:"अनु. जनजाति"},{v:"ews",l:"ईडब्ल्यूएस"}],
      occupation:"व्यवसाय", occupations:[{v:"farmer",l:"किसान 🌾"},{v:"student",l:"छात्र 📚"},{v:"women",l:"गृहिणी 👩"},{v:"senior",l:"वरिष्ठ 👴"},{v:"business",l:"व्यापारी 💼"},{v:"general",l:"वेतनभोगी 🧑"}],
      house:"क्या आपके पास पक्का मकान है?", houses:[{v:"yes",l:"हां — मेरे पास मकान है"},{v:"no",l:"नहीं — मुझे चाहिए"},{v:"kutcha",l:"कच्चा / अस्थायी"}],
      aadhaar:"आधार (अंतिम 4 अंक)", aadhaarPh:"जैसे 4521",
      bank:"बैंक खाता नंबर", bankPh:"खाता नंबर लिखें",
      phone:"मोबाइल नंबर", phonePh:"10 अंकों का नंबर",
    },
    questions:[
      {id:"who",   q:"आप कौन हैं?",                  icon:"👤", hint:"जो आप पर लागू हो वो चुनें",
        options:[{value:"farmer",label:"किसान 🌾"},{value:"student",label:"छात्र 📚"},{value:"women",label:"महिला 👩"},{value:"senior",label:"वरिष्ठ नागरिक 👴"},{value:"business",label:"व्यापारी 💼"},{value:"general",label:"सामान्य नागरिक 🧑"}]},
      {id:"income",q:"वार्षिक घरेलू आय?",            icon:"💰", hint:"परिवार की कुल सालाना आय",
        options:[{value:"below1",label:"₹1 लाख से कम"},{value:"1to3",label:"₹1–3 लाख"},{value:"3to6",label:"₹3–6 लाख"},{value:"above6",label:"₹6 लाख से अधिक"}]},
      {id:"state", q:"आप किस राज्य में रहते हैं?",  icon:"🗺️", hint:"केंद्रीय + आपके राज्य की योजनाएं दिखेंगी", type:"state"},
      {id:"house", q:"क्या आपके पास पक्का मकान है?", icon:"🏠", hint:"पक्का = ईंट/सीमेंट का स्थायी मकान",
        options:[{value:"no",label:"नहीं — मुझे चाहिए"},{value:"yes",label:"हां — मेरे पास है"},{value:"kutcha",label:"कच्चा / अस्थायी"}]},
      {id:"caste", q:"आपकी सामाजिक श्रेणी?",        icon:"🪪", hint:"SC/ST/OBC आरक्षित योजनाओं के मिलान के लिए",
        options:[{value:"general",label:"सामान्य"},{value:"obc",label:"OBC"},{value:"sc",label:"SC (अनु. जाति)"},{value:"st",label:"ST (अनु. जनजाति)"},{value:"ews",label:"EWS"}]},
      {id:"age",   q:"आपकी उम्र क्या है?",           icon:"🎂", hint:"मुख्य आवेदक की उम्र",
        options:[{value:"below18",label:"18 से कम"},{value:"18to35",label:"18–35 वर्ष"},{value:"35to60",label:"35–60 वर्ष"},{value:"above60",label:"60 से अधिक"}]},
      {id:"area",  q:"आपका क्षेत्र?",                icon:"📍", hint:"आपके रहने का क्षेत्र",
        options:[{value:"rural",label:"ग्रामीण / गांव 🏡"},{value:"urban",label:"शहरी / नगर 🏙️"},{value:"semi",label:"अर्ध-शहरी 🏘️"}]},
    ],
    // ── अनुकूल / सशर्त अतिरिक्त सवाल ───────────────────────────────────────
    adaptiveQuestions:{
      landHolding:{
        id:"landHolding", q:"आपके पास कितनी कृषि भूमि है?", icon:"🌾",
        hint:"किसान योजनाएं भूमि आकार पर निर्भर करती हैं",
        options:[
          {value:"below1",label:"1 एकड़ से कम"},
          {value:"1to2",  label:"1–2 एकड़"},
          {value:"2to5",  label:"2–5 एकड़"},
          {value:"5plus", label:"5+ एकड़"},
        ],
      },
      educationLevel:{
        id:"educationLevel", q:"आपकी वर्तमान शिक्षा स्तर क्या है?", icon:"📚",
        hint:"छात्रवृत्ति कक्षा के अनुसार अलग होती है",
        options:[
          {value:"class1to8",  label:"कक्षा 1–8 (प्राथमिक)"},
          {value:"class9to12", label:"कक्षा 9–12 (माध्यमिक)"},
          {value:"undergrad",  label:"स्नातक (डिग्री / डिप्लोमा)"},
          {value:"postgrad",   label:"स्नातकोत्तर (मास्टर्स / पीएचडी)"},
        ],
      },
      rationCard:{
        id:"rationCard", q:"आपके पास किस प्रकार का राशन कार्ड है?", icon:"🪪",
        hint:"BPL / AAY कार्ड बड़ी योजनाओं की कुंजी है",
        options:[
          {value:"none", label:"कोई नहीं / लागू नहीं 🚫"},
          {value:"apl",  label:"APL — गरीबी रेखा से ऊपर"},
          {value:"bpl",  label:"BPL — गरीबी रेखा से नीचे 🟡"},
          {value:"aay",  label:"AAY — अंत्योदय (सबसे गरीब) 🔴"},
        ],
      },
    },
  }
};

// ─── PROFILE TRANSLATIONS ─────────────────────────────────────────────────────
const PT = {
  en:{
    signInTitle:"Sign In",
    signInSub:"Sign in to save your matched schemes & profile",
    phoneLabel:"Mobile Number",
    phonePh:"Enter 10-digit mobile number",
    getOtpBtn:"Get OTP →",
    otpTitle:"Enter OTP",
    otpSub:(ph)=>`Sent to +91 ${ph.slice(0,5)} ••••••`,
    verifyBtn:"Verify & Continue →",
    resendIn:(s)=>`Resend OTP in ${s}s`,
    resendBtn:"Resend OTP",
    demoNote:"Enter any 6-digit OTP (UI Demo)",
    step1Title:"Your Name & Gender",
    step2Title:"State, Category & Social Info",
    step1of3:"STEP 1 OF 3",step2of3:"STEP 2 OF 3",step3of3:"STEP 3 OF 3",
    step3Title:"Income, Area & Welfare",
    fillOnce:"Fill once · Used everywhere",
    prefilled:"Pre-filled from your eligibility check ✓",
    rationLabel:"Ration Card Type",
    rations:[
      {v:"none",l:"None / Not Applicable 🚫"},
      {v:"apl", l:"APL — Above Poverty Line"},
      {v:"bpl", l:"BPL — Below Poverty Line 🟡"},
      {v:"aay", l:"AAY — Antyodaya (Poorest) 🔴"},
    ],
    disabilityLabel:"Any Disability in Family?",
    disabilityNone:"No Disability",
    disabilityYes:"Yes — Has Disability ♿",
    disabilityTypeLabel:"Disability Type",
    disabilityTypes:[
      {v:"physical",    l:"Physical / Locomotor 🦽"},
      {v:"visual",      l:"Visual Impairment 👁"},
      {v:"hearing",     l:"Hearing / Speech 🦻"},
      {v:"intellectual",l:"Intellectual / Mental 🧠"},
    ],
    maritalLabel:"Marital Status",
    maritals:[
      {v:"single",   l:"Single / Unmarried"},
      {v:"married",  l:"Married 💍"},
      {v:"widowed",  l:"Widowed 🕊️"},
      {v:"divorced", l:"Divorced / Separated"},
    ],
    nameLabel:"Full Name",namePh:"Enter your full name",
    genderLabel:"Gender",
    genders:[{v:"male",l:"Male 👨"},{v:"female",l:"Female 👩"},{v:"other",l:"Other 🧑"}],
    stateLabel:"State / UT",statePh:"Search your state...",
    catLabel:"You are a...",
    categories:[
      {v:"farmer",l:"Farmer 🌾"},{v:"student",l:"Student 📚"},
      {v:"women",l:"Homemaker 👩"},{v:"senior",l:"Senior Citizen 👴"},
      {v:"business",l:"Business Owner 💼"},{v:"general",l:"General Citizen 🧑"},
    ],
    nextBtn:"Next →",backBtn:"← Back",saveBtn:"Save Profile ✓",
    step1of4:"STEP 1 OF 4",step2of4:"STEP 2 OF 4",step3of4:"STEP 3 OF 4",step4of4:"STEP 4 OF 4",
    step4Title:"More About You",
    landHoldingLabel:"Farm Land Holding",
    landHoldings:[
      {v:"below1",l:"Below 1 Acre"},{v:"1to2",l:"1–2 Acres"},
      {v:"2to5",l:"2–5 Acres"},{v:"5plus",l:"5+ Acres"},
    ],
    kisanCardLabel:"Do you have a Kisan Credit Card (KCC)?",
    kisanCards:[
      {v:"yes",l:"Yes — I have KCC ✅"},{v:"no",l:"No — I don't have one"},
    ],
    educationLevelLabel:"Current Education Level",
    educationLevels:[
      {v:"class1to8",l:"Class 1–8 (Primary / Middle)"},
      {v:"class9to12",l:"Class 9–12 (Secondary / Sr. Secondary)"},
      {v:"undergrad",l:"Undergraduate (Degree / Diploma)"},
      {v:"postgrad",l:"Postgraduate (Masters / PhD)"},
    ],
    institutionTypeLabel:"Type of Institution",
    institutionTypes:[
      {v:"government",l:"Government Institution 🏛️"},
      {v:"private",l:"Private Institution 🏫"},
    ],
    numChildrenLabel:"Number of Children",
    numChildrenOpts:[
      {v:"0",l:"No children"},{v:"1",l:"1 child"},
      {v:"2",l:"2 children"},{v:"3plus",l:"3 or more"},
    ],
    hasGirlsLabel:"Any Girl Children?",
    hasGirlsOpts:[
      {v:"yes",l:"Yes — I have girl child/children 👧"},
      {v:"no",l:"No girl children"},
    ],
    dashTitle:"My Profile",
    viewSchemes:"View My Matched Schemes",
    schemesMatched:"Schemes",stateLabel2:"State",catLabel2:"Category",
    settingsTitle:"Settings",langLabel:"Language",
    editProfile:"Edit Profile",signOut:"Sign Out",
    signOutConfirm:"Sign out of Yojana Sahay?",
    googleBtn:"Continue with Google",
    emailLabel:"Email Address",emailPh:"Enter your email",
    passwordLabel:"Password",passwordPh:"Min. 6 characters",
    signInTab:"Sign In",createAcctTab:"Create Account",
    signInBtn:"Sign In",createAcctBtn:"Create Account",
    forgotHint:"New here? Use 'Create Account' to register.",
    forgotPassword:"Forgot Password?",
    forgotSent:"Reset link sent. Please check your email inbox.",
    forgotFail:"Could not send reset email. Please check the address.",
    weakPassword:"Password must be at least 6 characters",
    invalidEmail:"Please enter a valid email address",
    darkLabel:"Dark Mode",
    darkSub:(on)=>on?"On":"Off",
    reportLabel:"Report / Query",
    reportSub:"Share an issue or ask something",
    loginBenefits:[
      {icon:"🎯", title:"Matched Schemes Saved",    sub:"Your qualifying schemes auto-saved to account"},
      {icon:"🤖", title:"Personalized AI Answers",  sub:"AI knows your profile, gives tailored replies"},
      {icon:"💾", title:"Progress Never Lost",       sub:"Eligibility results & chat history saved"},
      {icon:"🔔", title:"Scheme Deadline Alerts",   sub:"Get notified about deadlines & new schemes"},
    ],
  },
  hi:{
    signInTitle:"साइन इन करें",
    signInSub:"योजनाएं और प्रोफाइल सहेजने के लिए साइन इन करें",
    phoneLabel:"मोबाइल नंबर",
    phonePh:"10 अंकों का मोबाइल नंबर",
    getOtpBtn:"OTP भेजें →",
    otpTitle:"OTP दर्ज करें",
    otpSub:(ph)=>`+91 ${ph.slice(0,5)} •••••• पर भेजा गया`,
    verifyBtn:"सत्यापित करें →",
    resendIn:(s)=>`OTP ${s} सेकंड में भेजें`,
    resendBtn:"OTP दोबारा भेजें",
    demoNote:"कोई भी 6 अंक दर्ज करें (UI Demo)",
    step1Title:"आपका नाम और लिंग",
    step2Title:"राज्य, श्रेणी और सामाजिक जानकारी",
    step1of3:"चरण 1 / 3",step2of3:"चरण 2 / 3",step3of3:"चरण 3 / 3",
    step3Title:"आय, क्षेत्र और कल्याण",
    fillOnce:"एक बार भरें · हर जगह काम आएगा",
    prefilled:"पात्रता जांच से पहले से भरा गया ✓",
    rationLabel:"राशन कार्ड प्रकार",
    rations:[
      {v:"none",l:"कोई नहीं / लागू नहीं 🚫"},
      {v:"apl", l:"APL — गरीबी रेखा से ऊपर"},
      {v:"bpl", l:"BPL — गरीबी रेखा से नीचे 🟡"},
      {v:"aay", l:"AAY — अंत्योदय (अतिगरीब) 🔴"},
    ],
    disabilityLabel:"परिवार में कोई दिव्यांग?",
    disabilityNone:"कोई दिव्यांगता नहीं",
    disabilityYes:"हाँ — दिव्यांगता है ♿",
    disabilityTypeLabel:"दिव्यांगता का प्रकार",
    disabilityTypes:[
      {v:"physical",    l:"शारीरिक / अस्थि 🦽"},
      {v:"visual",      l:"दृष्टि बाधित 👁"},
      {v:"hearing",     l:"श्रवण / वाणी 🦻"},
      {v:"intellectual",l:"बौद्धिक / मानसिक 🧠"},
    ],
    maritalLabel:"वैवाहिक स्थिति",
    maritals:[
      {v:"single",   l:"अविवाहित"},
      {v:"married",  l:"विवाहित 💍"},
      {v:"widowed",  l:"विधवा / विधुर 🕊️"},
      {v:"divorced", l:"तलाकशुदा / अलग"},
    ],
    nameLabel:"पूरा नाम",namePh:"अपना पूरा नाम लिखें",
    genderLabel:"लिंग",
    genders:[{v:"male",l:"पुरुष 👨"},{v:"female",l:"महिला 👩"},{v:"other",l:"अन्य 🧑"}],
    stateLabel:"राज्य / केंद्र शासित प्रदेश",statePh:"अपना राज्य खोजें...",
    catLabel:"आप हैं...",
    categories:[
      {v:"farmer",l:"किसान 🌾"},{v:"student",l:"छात्र 📚"},
      {v:"women",l:"गृहिणी 👩"},{v:"senior",l:"वरिष्ठ नागरिक 👴"},
      {v:"business",l:"व्यापारी 💼"},{v:"general",l:"सामान्य नागरिक 🧑"},
    ],
    nextBtn:"अगला →",backBtn:"← वापस",saveBtn:"सहेजें ✓",
    step1of4:"चरण 1 / 4",step2of4:"चरण 2 / 4",step3of4:"चरण 3 / 4",step4of4:"चरण 4 / 4",
    step4Title:"और जानकारी",
    landHoldingLabel:"कृषि भूमि",
    landHoldings:[
      {v:"below1",l:"1 एकड़ से कम"},{v:"1to2",l:"1–2 एकड़"},
      {v:"2to5",l:"2–5 एकड़"},{v:"5plus",l:"5+ एकड़"},
    ],
    kisanCardLabel:"क्या आपके पास किसान क्रेडिट कार्ड (KCC) है?",
    kisanCards:[
      {v:"yes",l:"हाँ — KCC है ✅"},{v:"no",l:"नहीं — नहीं है"},
    ],
    educationLevelLabel:"वर्तमान शिक्षा स्तर",
    educationLevels:[
      {v:"class1to8",l:"कक्षा 1–8 (प्राथमिक / माध्यमिक)"},
      {v:"class9to12",l:"कक्षा 9–12 (माध्यमिक / उच्च माध्यमिक)"},
      {v:"undergrad",l:"स्नातक (डिग्री / डिप्लोमा)"},
      {v:"postgrad",l:"स्नातकोत्तर (M.A. / PhD)"},
    ],
    institutionTypeLabel:"संस्था का प्रकार",
    institutionTypes:[
      {v:"government",l:"सरकारी संस्था 🏛️"},
      {v:"private",l:"निजी संस्था 🏫"},
    ],
    numChildrenLabel:"बच्चों की संख्या",
    numChildrenOpts:[
      {v:"0",l:"कोई बच्चा नहीं"},{v:"1",l:"1 बच्चा"},
      {v:"2",l:"2 बच्चे"},{v:"3plus",l:"3 या अधिक"},
    ],
    hasGirlsLabel:"क्या कोई बेटी है?",
    hasGirlsOpts:[
      {v:"yes",l:"हाँ — बेटी है 👧"},
      {v:"no",l:"नहीं"},
    ],
    dashTitle:"मेरी प्रोफाइल",
    viewSchemes:"मेरी मिलान योजनाएं देखें",
    schemesMatched:"योजनाएं",stateLabel2:"राज्य",catLabel2:"श्रेणी",
    settingsTitle:"सेटिंग्स",langLabel:"भाषा",
    editProfile:"प्रोफाइल बदलें",signOut:"साइन आउट",
    signOutConfirm:"Yojana Sahay से साइन आउट करें?",
    googleBtn:"Google से जारी रखें",
    emailLabel:"ईमेल पता",emailPh:"अपना ईमेल दर्ज करें",
    passwordLabel:"पासवर्ड",passwordPh:"कम से कम 6 अक्षर",
    signInTab:"साइन इन",createAcctTab:"अकाउंट बनाएं",
    signInBtn:"साइन इन करें",createAcctBtn:"अकाउंट बनाएं",
    forgotHint:"नए हैं? 'अकाउंट बनाएं' से पंजीकरण करें।",
    forgotPassword:"पासवर्ड भूल गए?",
    forgotSent:"रीसेट लिंक भेज दिया गया। अपना ईमेल इनबॉक्स जांचें।",
    forgotFail:"रीसेट ईमेल नहीं भेजा जा सका। पता जांचें।",
    weakPassword:"पासवर्ड कम से कम 6 अक्षर का होना चाहिए",
    invalidEmail:"कृपया सही ईमेल दर्ज करें",
    darkLabel:"डार्क मोड",
    darkSub:(on)=>on?"चालू":"बंद",
    reportLabel:"रिपोर्ट / सवाल",
    reportSub:"कोई समस्या बताएं या सवाल पूछें",
    loginBenefits:[
      {icon:"🎯", title:"मिलान योजनाएं सेव",        sub:"पात्र योजनाएं अकाउंट में ऑटो-सेव"},
      {icon:"🤖", title:"पर्सनल AI जवाब",           sub:"AI प्रोफाइल देखकर सटीक जवाब देता है"},
      {icon:"💾", title:"प्रगति कभी न खोएं",        sub:"पात्रता परिणाम और चैट इतिहास सेव"},
      {icon:"🔔", title:"योजना अलर्ट",             sub:"नई योजनाएं व डेडलाइन की सूचना पाएं"},
    ],
  }
};

// ─── LANG TOGGLE ───────────────────────────────────────────────────────────────
function LangToggle({lang,onToggle,dark=false}){
  const isHindi=lang==="hi";
  const trackBg  = dark ? "rgba(255,255,255,0.15)" : "#e4e4e4";
  const trackBdr = dark ? "rgba(255,255,255,0.35)" : "#c8c8c8";
  const inactiveC= dark ? "rgba(255,255,255,0.6)"  : "#999";
  return(
    <button onClick={()=>{haptic();onToggle();}} style={{display:"flex",alignItems:"center",background:trackBg,border:`1.5px solid ${trackBdr}`,borderRadius:22,padding:"3px 4px",cursor:"pointer",height:34,width:72,position:"relative",overflow:"hidden",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:isHindi?"calc(50% - 2px)":3,width:"calc(50% - 2px)",bottom:3,background:"#fff",borderRadius:16,transition:"left 0.28s",boxShadow:"0 1px 6px rgba(0,0,0,0.2)",zIndex:0}}/>
      <span style={{flex:1,textAlign:"center",fontSize:11,fontWeight:700,color:!isHindi?"#FF8C00":inactiveC,position:"relative",zIndex:1}}>EN</span>
      <span style={{flex:1,textAlign:"center",fontSize:11,fontWeight:700,color:isHindi?"#FF8C00":inactiveC,position:"relative",zIndex:1}}>हिं</span>
    </button>
  );
}

// ─── DARK MODE TOGGLE ──────────────────────────────────────────────────────────
// Same pill DNA as LangToggle — identical dimensions, track, slider, color tokens.
// Uses crisp inline SVG (no emoji) so it renders sharply on all screens.
function DarkModeToggle({dark,onToggle}){
  const SunIcon=()=>(
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.2"/>
      <line x1="12" y1="2"    x2="12" y2="5.5"/>
      <line x1="12" y1="18.5" x2="12" y2="22"/>
      <line x1="4.22"  y1="4.22"  x2="6.52"  y2="6.52"/>
      <line x1="17.48" y1="17.48" x2="19.78" y2="19.78"/>
      <line x1="2"    y1="12" x2="5.5"  y2="12"/>
      <line x1="18.5" y1="12" x2="22"   y2="12"/>
      <line x1="4.22"  y1="19.78" x2="6.52"  y2="17.48"/>
      <line x1="17.48" y1="6.52"  x2="19.78" y2="4.22"/>
    </svg>
  );
  const MoonIcon=()=>(
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
  return(
    <button onClick={()=>{haptic();onToggle();}}
      aria-label={dark?"Switch to light mode":"Switch to dark mode"}
      style={{display:"flex",alignItems:"center",
        background:"rgba(255,255,255,0.15)",
        border:"1.5px solid rgba(255,255,255,0.35)",
        borderRadius:22,padding:"3px 4px",cursor:"pointer",
        height:34,width:72,position:"relative",overflow:"hidden",flexShrink:0}}>
      {/* Sliding white pill — glides left↔right */}
      <div style={{position:"absolute",top:3,
        left:dark?"calc(50% - 2px)":3,
        width:"calc(50% - 2px)",bottom:3,
        background:"#fff",borderRadius:16,
        transition:"left 0.28s cubic-bezier(0.22,1,0.36,1)",
        boxShadow:"0 1px 6px rgba(0,0,0,0.2)",zIndex:0}}/>
      {/* ☀ Sun — left side — lit when light mode active */}
      <span style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
        position:"relative",zIndex:1,
        color:!dark?"#FF8C00":"rgba(255,255,255,0.55)",
        transition:"color 0.25s"}}>
        <SunIcon/>
      </span>
      {/* ☽ Moon — right side — lit when dark mode active */}
      <span style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
        position:"relative",zIndex:1,
        color:dark?"#FF8C00":"rgba(255,255,255,0.55)",
        transition:"color 0.25s"}}>
        <MoonIcon/>
      </span>
    </button>
  );
}

// ─── SCHEME CARD (used in eligibility results, schemes tab & category sheet) ─────
// Smooth expand/collapse via CSS grid 0fr→1fr trick.
// Content is ALWAYS mounted — animation works in both directions everywhere.
function _SchemeCard({scheme,lang,expanded,onToggle,dark=false,onOpenDetail=null}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const bf=fontFamily(lang);
  const isNational=scheme.scope==="national";
  const isOnline=scheme.applyType==="online";
  const applyUrl=isOnline?safeApplyUrl(scheme.apply.en):null;
  const isHindi=lang==="hi";

  const [copied,setCopied]=useState(false);
  const [showGSearch,setShowGSearch]=useState(false);

  const handleCopy=(e)=>{
    e.stopPropagation();
    haptic(30);
    const schemeName=scheme.name[lang];
    navigator.clipboard?.writeText(schemeName).then(()=>{
      setCopied(true);
      setShowGSearch(true);
      setTimeout(()=>setCopied(false),2000);
      setTimeout(()=>setShowGSearch(false),4000);
    }).catch(()=>{
      const el=document.createElement("textarea");
      el.value=schemeName;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setShowGSearch(true);
      setTimeout(()=>setCopied(false),2000);
      setTimeout(()=>setShowGSearch(false),4000);
    });
  };

  return(
    <div style={{
      background:th.card,borderRadius:18,marginBottom:10,overflow:"hidden",
      border:`1.5px solid ${expanded?scheme.color+"60":scheme.color+"28"}`,
      boxShadow:expanded?`0 6px 24px ${scheme.color}22`:"0 2px 12px rgba(0,0,0,0.05)",
      transition:"border-color 0.35s ease,box-shadow 0.35s ease",
    }}>

      {/* ── Tap header ── */}
      <div onClick={()=>{haptic();onToggle();}} style={{
        padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",
        background:expanded?scheme.color+"07":"transparent",
        transition:"background 0.35s ease",
      }}>
        <div style={{
          width:46,height:46,borderRadius:13,flexShrink:0,marginTop:2,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:22,border:`1.5px solid ${scheme.color}22`,
          background:expanded?scheme.color+"25":scheme.color+"15",
          transition:"background 0.35s ease",
        }}>{scheme.icon}</div>

        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:5}}>
            <span style={{fontSize:9,fontWeight:700,
              background:isNational?"#EFF6FF":"#FEF9C3",
              color:isNational?"#1D4ED8":"#854D0E",
              borderRadius:6,padding:"2px 7px",
              border:`1px solid ${isNational?"#BFDBFE":"#FEF08A"}`}}>
              {isNational?t.centralLabel:t.stateLabel(scheme.state)}
            </span>
            <span style={{fontSize:9,fontWeight:700,background:scheme.color+"18",color:scheme.color,borderRadius:6,padding:"2px 7px"}}>
              {scheme.tag[lang]}
            </span>
            {/* Online/Offline badge */}
            <span style={{fontSize:9,fontWeight:700,
              background:isOnline?"#f0fdf4":"#f5f5f5",
              color:isOnline?"#15803d":"#777",
              borderRadius:6,padding:"2px 7px",
              border:`1px solid ${isOnline?"#bbf7d0":"#e0e0e0"}`}}>
              {isOnline?"🌐 Online":"🏢 Offline"}
            </span>
            {/* ── Status badge — combines URL liveness (Tier 1) + application status (Tier 2 AI) ── */}
            {(()=>{
              if(!isOnline) return null;
              const st=scheme.linkAlive??scheme.isActive;
              const http=scheme.httpStatus??0;
              const hasBeenChecked=scheme.lastVerified!=null;
              const _now=Date.now();
              const _ld=scheme.lastDate?new Date(scheme.lastDate).getTime():null;
              const deadlinePassed=_ld&&_ld<_now;

              const errLabel=(()=>{
                if(http===404) return isHindi?"पेज नहीं मिला":"Page Not Found";
                if(http===403) return isHindi?"एक्सेस ब्लॉक्ड":"Blocked";
                if(http===401) return isHindi?"लॉगिन जरूरी":"Login Required";
                if(http>=500)  return isHindi?"सर्वर डाउन":"Server Down";
                if(http===0)   return isHindi?"कोई जवाब नहीं":"No Response";
                return isHindi?"लिंक खराब":"Dead Link";
              })();

              if(st===true){
                // AI confirmed open AND deadline hasn't passed
                if(scheme.isActive===true&&!deadlinePassed) return(
                  <span style={{fontSize:9,fontWeight:700,background:"#F0FDF4",color:"#15803D",borderRadius:6,padding:"2px 7px",border:"1px solid #BBF7D0"}}>
                    ✅ {isHindi?"आवेदन खुले हैं":"Applications Open"}
                  </span>
                );
                // Link alive but scheme closed (AI says so, or deadline passed)
                if(scheme.isActive===false||deadlinePassed) return(
                  <span style={{fontSize:9,fontWeight:700,background:dark?"rgba(251,191,36,0.15)":"#FFFBEB",color:"#B45309",borderRadius:6,padding:"2px 7px",border:"1px solid #FDE68A"}}>
                    ⚠️ {isHindi?"योजना बंद":"Scheme Closed"}
                  </span>
                );
                // Link alive, no AI data yet (Tier 1 only)
                return(
                  <span style={{fontSize:9,fontWeight:700,background:"#F0FDF4",color:"#15803D",borderRadius:6,padding:"2px 7px",border:"1px solid #BBF7D0"}}>
                    🔗 {isHindi?"लिंक सक्रिय":"Link Live"}
                  </span>
                );
              }
              if(st===false) return(
                <span style={{fontSize:9,fontWeight:700,background:"#FEF2F2",color:"#DC2626",borderRadius:6,padding:"2px 7px",border:"1px solid #FECACA"}}>
                  🔴 {errLabel}
                </span>
              );
              if(!hasBeenChecked) return(
                <span style={{fontSize:9,fontWeight:700,background:dark?"rgba(99,102,241,0.13)":"#EEF2FF",color:dark?"#A5B4FC":"#4338CA",borderRadius:6,padding:"2px 7px",border:`1px solid ${dark?"rgba(165,180,252,0.3)":"#C7D2FE"}`}}>
                  🕐 {isHindi?"जांच बाकी":"Check Pending"}
                </span>
              );
              return null;
            })()}
            {/* ── Deadline badge — smart time-aware display ── */}
            {scheme.lastDate&&(()=>{
              const _now=Date.now();
              const ld=new Date(scheme.lastDate).getTime();
              const isExpired=ld<_now;
              const daysLeft=Math.ceil((ld-_now)/(1000*60*60*24));
              const daysAgo=Math.floor((_now-ld)/(1000*60*60*24));
              const fmtShort=new Date(scheme.lastDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"});

              if(isExpired){
                const ago=daysAgo===0?(isHindi?"आज":"today"):daysAgo<2?(isHindi?"कल":"yesterday"):daysAgo<30?(isHindi?`${daysAgo}d पहले`:`${daysAgo}d ago`):daysAgo<365?(isHindi?`${Math.floor(daysAgo/30)} माह पहले`:`${Math.floor(daysAgo/30)}mo ago`):(isHindi?"1 साल+":"1yr+ ago");
                return(<span style={{fontSize:9,fontWeight:700,background:"#FEF2F2",color:"#DC2626",borderRadius:6,padding:"2px 7px",border:"1px solid #FECACA"}}>⌛ {isHindi?"बंद":"Closed"} · {ago}</span>);
              }
              if(daysLeft===0) return(<span style={{fontSize:9,fontWeight:700,background:"#FEF2F2",color:"#DC2626",borderRadius:6,padding:"2px 7px",border:"1px solid #FECACA",letterSpacing:"0.1px"}}>🔥 {isHindi?"आज बंद!":"Closes Today!"}</span>);
              if(daysLeft<=3)  return(<span style={{fontSize:9,fontWeight:700,background:"#FEF2F2",color:"#DC2626",borderRadius:6,padding:"2px 7px",border:"1px solid #FECACA"}}>🔥 {isHindi?`${daysLeft}दिन बचे!`:`${daysLeft}d left!`}</span>);
              if(daysLeft<=7)  return(<span style={{fontSize:9,fontWeight:700,background:"#FFF7ED",color:"#C2410C",borderRadius:6,padding:"2px 7px",border:"1px solid #FED7AA"}}>⚡ {isHindi?`${daysLeft} दिन बचे`:`${daysLeft} days left`}</span>);
              if(daysLeft<=30) return(<span style={{fontSize:9,fontWeight:700,background:"#FFF7ED",color:"#EA580C",borderRadius:6,padding:"2px 7px",border:"1px solid #FED7AA"}}>⏳ {isHindi?`${daysLeft} दिन शेष`:`${daysLeft} days left`}</span>);
              return(<span style={{fontSize:9,fontWeight:700,background:"#F0FDF4",color:"#15803D",borderRadius:6,padding:"2px 7px",border:"1px solid #BBF7D0"}}>📅 {isHindi?`${fmtShort} तक`:`Till ${fmtShort}`}</span>);
            })()}
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.35,fontFamily:bf,flex:1}}>
              {scheme.name[lang]}
            </div>
            {/* Copy button */}
            <div onClick={handleCopy}
              style={{flexShrink:0,display:"flex",alignItems:"center",gap:3,
                background:copied?(dark?"#14532d":"#f0fdf4"):(dark?"rgba(255,255,255,0.07)":scheme.color+"12"),
                border:`1px solid ${copied?"#22c55e60":scheme.color+"35"}`,
                borderRadius:8,padding:"3px 7px",cursor:"pointer",
                transition:"all 0.2s",marginTop:1,
              }}>
              <span style={{fontSize:11,lineHeight:1}}>{copied?"✓":"⎘"}</span>
              <span style={{fontSize:9,fontWeight:700,
                color:copied?"#16a34a":scheme.color,
                fontFamily:"sans-serif",transition:"color 0.2s",
              }}>
                {copied?"Copied":"Copy"}
              </span>
            </div>
          </div>
          <div style={{fontSize:12,color:scheme.color,fontWeight:600}}>{scheme.benefit[lang]}</div>
          <div style={{fontSize:10,color:th.textLight,marginTop:3,fontFamily:bf}}>{scheme.ministry[lang]}</div>

          {/* Google search quick-action — appears 1s after copy */}
          {showGSearch&&(
            <div
              onClick={e=>{e.stopPropagation();haptic(30);googleSearchScheme(scheme.name.en);}}
              style={{
                marginTop:7,display:"inline-flex",alignItems:"center",gap:5,
                background:"#EFF6FF",border:"1px solid #93C5FD",
                borderRadius:8,padding:"4px 9px",cursor:"pointer",
                animation:"fadeIn 0.2s ease",
              }}>
              <span style={{fontSize:11}}>🔎</span>
              <span style={{fontSize:10,fontWeight:700,color:"#1D4ED8"}}>
                Search on Google →
              </span>
            </div>
          )}
        </div>

        {/* Animated chevron */}
        <div style={{
          width:26,height:26,borderRadius:8,flexShrink:0,marginTop:2,
          display:"flex",alignItems:"center",justifyContent:"center",
          background:expanded?scheme.color+"18":"transparent",
          transform:expanded?"rotate(90deg)":"rotate(0deg)",
          transition:"background 0.3s ease,transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <span style={{fontSize:17,color:scheme.color,fontWeight:700,lineHeight:1}}>›</span>
        </div>
      </div>

      {/* ── Animated body: CSS grid 0fr→1fr, always mounted ── */}
      <div style={{
        display:"grid",
        gridTemplateRows:expanded?"1fr":"0fr",
        transition:"grid-template-rows 0.38s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{overflow:"hidden"}}>
          <div style={{
            borderTop:`1px solid ${scheme.color}22`,
            background:scheme.color+"07",
            opacity:expanded?1:0,
            transform:expanded?"translateY(0)":"translateY(-8px)",
            transition:"opacity 0.28s ease 0.08s,transform 0.28s ease 0.08s",
          }}>
            {/* Documents */}
            <div style={{padding:"14px 16px 10px"}}>
              <div style={{
                fontSize:10,fontWeight:700,color:th.textSub,
                letterSpacing:0.7,marginBottom:10,textTransform:"uppercase",
                display:"flex",alignItems:"center",gap:6,
              }}>
                <span style={{fontSize:14}}>📄</span>{t.docsLabel}
              </div>
              {scheme.docs[lang].map((d,i)=>(
                <div key={i} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"7px 0",
                  borderBottom:i<scheme.docs[lang].length-1?`1px solid ${th.border}`:"none",
                }}>
                  <div style={{
                    width:22,height:22,borderRadius:"50%",flexShrink:0,
                    background:scheme.color+"20",
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    <span style={{color:scheme.color,fontSize:11,fontWeight:800}}>✓</span>
                  </div>
                  <span style={{fontSize:12,color:th.text,fontFamily:bf,lineHeight:1.4}}>{d}</span>
                </div>
              ))}
            </div>

            {/* Apply CTA */}
            <div style={{padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:8}}>

              {/* ── URL Status detail panel — shown for dead/unverified online schemes ── */}
              {isOnline&&(()=>{
                // Fix 3: linkAlive is the pure URL-liveness signal (Tier 1).
                const st=scheme.linkAlive??scheme.isActive;
                const http=scheme.httpStatus??0;
                const hasBeenChecked=scheme.lastVerified!=null;
                const nowTs=Date.now();
                const deadlinePassed=scheme.lastDate&&new Date(scheme.lastDate).getTime()<nowTs;
                const daysUntilDeadline=scheme.lastDate&&!deadlinePassed?Math.ceil((new Date(scheme.lastDate).getTime()-nowTs)/(1000*60*60*24)):null;
                // Data freshness
                const checkedAgo=hasBeenChecked
                  ?Math.floor((Date.now()-new Date(scheme.lastVerified).getTime())/(1000*60*60*24))
                  :null;
                const freshLabel=checkedAgo===0
                  ?(isHindi?"आज जांचा गया":"Checked today")
                  :checkedAgo===1
                    ?(isHindi?"कल जांचा गया":"Checked yesterday")
                    :checkedAgo!=null
                      ?(isHindi?`${checkedAgo} दिन पहले जांचा गया`:`Checked ${checkedAgo} days ago`)
                      :null;
                const isStale=checkedAgo!=null&&checkedAgo>30;

                // Dead link detail
                const deadDetail=(()=>{
                  if(http===404) return{
                    title:isHindi?"यह पेज अब उपलब्ध नहीं है":"This page no longer exists",
                    desc:isHindi?"सरकार ने इस लिंक को बदल दिया होगा। नीचे गूगल पर खोजें।":"The government may have moved this link. Search Google below for the correct URL.",
                    safe:false,
                  };
                  if(http===403||http===401) return{
                    title:isHindi?"वेबसाइट ने एक्सेस ब्लॉक किया":"Website is blocking access",
                    desc:isHindi?"यह साइट लॉगिन मांगती है या हमारे सर्वर को ब्लॉक करती है। सीधे ब्राउज़र में खोलने की कोशिश करें।":"This site requires login or blocks automated access. Try opening it directly in your browser.",
                    safe:true,
                  };
                  if(http>=500) return{
                    title:isHindi?"सरकारी सर्वर अभी बंद है":"Government server is currently down",
                    desc:isHindi?"सर्वर पर तकनीकी समस्या है। कुछ घंटे बाद दोबारा कोशिश करें।":"Technical issue on the server. Try again after a few hours.",
                    safe:true,
                  };
                  if(http===0||st===false) return{
                    title:isHindi?"वेबसाइट ने जवाब नहीं दिया":"Website did not respond",
                    desc:isHindi?"साइट डाउन हो सकती है या हमारे सर्वर को ब्लॉक कर रही है। सीधे खोलकर देख सकते हैं।":"Site may be down or blocking our server. You can still try opening it directly.",
                    safe:true,
                  };
                  return null;
                })();

                return(<>
                  {/* Dead link panel */}
                  {st===false&&deadDetail&&(
                    <div style={{
                      background:dark?"rgba(220,38,38,0.08)":"#FEF2F2",
                      border:"1px solid #FECACA",borderRadius:10,
                      padding:"10px 12px",
                    }}>
                      <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}>
                        <span style={{fontSize:15,flexShrink:0}}>🔴</span>
                        <div>
                          <div style={{fontSize:11,fontWeight:700,color:dark?"#FCA5A5":"#991B1B",marginBottom:3}}>
                            {deadDetail.title}
                          </div>
                          <div style={{fontSize:10,color:dark?"#FCA5A5":"#7F1D1D",lineHeight:1.5}}>
                            {deadDetail.desc}
                          </div>
                        </div>
                      </div>
                      {deadDetail.safe&&(
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                          <span style={{fontSize:9,background:"#D1FAE5",color:"#065F46",borderRadius:5,padding:"2px 6px",fontWeight:700,border:"1px solid #A7F3D0"}}>
                            ✓ {isHindi?"खोलना सुरक्षित है":"Safe to open"}
                          </span>
                        </div>
                      )}
                      <div
                        onClick={e=>{e.stopPropagation();haptic(30);googleSearchScheme(scheme.name.en);}}
                        style={{
                          display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                          background:"#EFF6FF",border:"1px solid #93C5FD",
                          borderRadius:8,padding:"8px 10px",cursor:"pointer",
                        }}>
                        <span style={{fontSize:12}}>🔎</span>
                        <span style={{fontSize:10,fontWeight:700,color:"#1D4ED8"}}>
                          {isHindi?"गूगल पर सही लिंक खोजें →":"Find correct link on Google →"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Link not yet checked panel */}
                  {st==null&&!hasBeenChecked&&(
                    <div style={{
                      background:dark?"rgba(99,102,241,0.08)":"#EEF2FF",
                      border:"1px solid #C7D2FE",borderRadius:10,
                      padding:"9px 12px",display:"flex",gap:8,alignItems:"flex-start",
                    }}>
                      <span style={{fontSize:14,flexShrink:0}}>🕐</span>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:dark?"#A5B4FC":"#3730A3",marginBottom:2}}>
                          {isHindi?"लिंक की स्थिति जांचनी बाकी है":"Link status check pending"}
                        </div>
                        <div style={{fontSize:10,color:dark?"#C7D2FE":"#4338CA",lineHeight:1.5}}>
                          {isHindi?"यह लिंक अभी हमारे सिस्टम द्वारा स्कैन नहीं किया गया है। सटीक जानकारी के लिए आधिकारिक वेबसाइट पर जाएं या नीचे खोजें।":"This link hasn't been scanned by our system yet. For the most accurate and current information, visit the official website or search below."}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Freshness row — shown when checked */}
                  {hasBeenChecked&&(
                    <div style={{
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      background:dark?"rgba(255,255,255,0.03)":"#F9FAFB",
                      border:`1px solid ${isStale?(dark?"rgba(251,191,36,0.3)":"#FDE68A"):(dark?"rgba(255,255,255,0.07)":"#E5E7EB")}`,
                      borderRadius:8,padding:"6px 10px",
                    }}>
                      <span style={{fontSize:10,color:isStale?"#B45309":(dark?"#9CA3AF":"#6B7280")}}>
                        🕐 {freshLabel}
                        {isStale&&(isHindi?" · जानकारी पुरानी हो सकती है":" · Data may be outdated")}
                      </span>
                      <span style={{
                        fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:5,
                        background:st===true?"#D1FAE5":st===false?"#FEE2E2":"#F3F4F6",
                        color:st===true?"#065F46":st===false?"#991B1B":"#6B7280",
                        border:`1px solid ${st===true?"#A7F3D0":st===false?"#FECACA":"#E5E7EB"}`,
                      }}>
                        {st===true?(isHindi?"लिंक सक्रिय":"Link Active"):st===false?(isHindi?"लिंक खराब":"Link Down"):(isHindi?"अज्ञात":"Unknown")}
                      </span>
                    </div>
                  )}

                  {/* ── Applications Open strip — AI-confirmed, link alive, deadline not passed ── */}
                  {st===true&&scheme.isActive===true&&!deadlinePassed&&(
                    <div style={{
                      background:dark?"rgba(21,128,61,0.09)":"#F0FDF4",
                      border:"1px solid #BBF7D0",borderRadius:10,
                      padding:"10px 12px",display:"flex",gap:8,alignItems:"flex-start",
                    }}>
                      <span style={{fontSize:14,flexShrink:0}}>✅</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:700,color:dark?"#4ADE80":"#15803D",marginBottom:2}}>
                          {isHindi?"आवेदन अभी खुले हैं":"Applications are currently open"}
                        </div>
                        <div style={{fontSize:10,color:dark?"#86EFAC":"#166534",lineHeight:1.5}}>
                          {isHindi?"AI ने आधिकारिक वेबसाइट से यह सत्यापित किया है।":"Verified from the official website via AI scan."}
                          {scheme.confidence!=null&&scheme.confidence>0&&(
                            <span style={{opacity:0.65,marginLeft:4}}>({Math.round(scheme.confidence*100)}% confident)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Closing Soon urgency strip — deadline within 30 days ── */}
                  {daysUntilDeadline!=null&&daysUntilDeadline<=30&&(
                    <div style={{
                      background:dark?(daysUntilDeadline<=7?"rgba(220,38,38,0.09)":"rgba(234,88,12,0.09)"):(daysUntilDeadline<=7?"#FEF2F2":"#FFF7ED"),
                      border:`1px solid ${daysUntilDeadline<=7?"#FECACA":"#FED7AA"}`,borderRadius:10,
                      padding:"10px 12px",display:"flex",gap:8,alignItems:"flex-start",
                    }}>
                      <span style={{fontSize:14,flexShrink:0}}>{daysUntilDeadline<=3?"🔥":daysUntilDeadline<=7?"⚡":"⏳"}</span>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:dark?(daysUntilDeadline<=7?"#FCA5A5":"#FB923C"):(daysUntilDeadline<=7?"#991B1B":"#C2410C"),marginBottom:2}}>
                          {daysUntilDeadline===0
                            ?(isHindi?"आज आवेदन की अंतिम तिथि है!":"Today is the last day to apply!")
                            :daysUntilDeadline<=7
                              ?(isHindi?`सिर्फ ${daysUntilDeadline} दिन बचे हैं!`:`Only ${daysUntilDeadline} day${daysUntilDeadline===1?"":"s"} left to apply!`)
                              :(isHindi?`${daysUntilDeadline} दिन में आवेदन बंद होगा`:`Deadline in ${daysUntilDeadline} days`)}
                        </div>
                        <div style={{fontSize:10,color:dark?(daysUntilDeadline<=7?"#FCA5A5":"#FDBA74"):(daysUntilDeadline<=7?"#7F1D1D":"#9A3412"),lineHeight:1.5}}>
                          {isHindi?"जल्दी आवेदन करें — अंतिम तिथि नजदीक है।":"Apply soon — the deadline is approaching fast."}
                        </div>
                      </div>
                    </div>
                  )}
                </>);
              })()}

              {/* ── Expired info strip — shows exactly how long ago deadline passed ── */}
              {scheme.lastDate&&(()=>{
                const _now=Date.now();
                const ld=new Date(scheme.lastDate).getTime();
                if(ld>=_now) return null;
                const daysAgo=Math.floor((_now-ld)/(1000*60*60*24));
                const agoStr=daysAgo<1?(isHindi?"आज":"today"):daysAgo<2?(isHindi?"कल":"yesterday"):daysAgo<30?(isHindi?`${daysAgo} दिन पहले`:`${daysAgo} days ago`):daysAgo<365?(isHindi?`${Math.floor(daysAgo/30)} महीने पहले`:`${Math.floor(daysAgo/30)} months ago`):(isHindi?"1 साल से अधिक पहले":"over a year ago");
                const fmtDate=new Date(scheme.lastDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
                return(
                  <div style={{
                    background:dark?"rgba(220,38,38,0.07)":"#FEF2F2",
                    border:"1px solid #FECACA",borderRadius:10,
                    padding:"10px 12px",display:"flex",gap:8,alignItems:"flex-start",
                  }}>
                    <span style={{fontSize:14,flexShrink:0}}>⌛</span>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:dark?"#FCA5A5":"#991B1B",marginBottom:2}}>
                        {isHindi?`आवेदन ${agoStr} बंद हुआ (${fmtDate})`:`Applications closed ${agoStr} · ${fmtDate}`}
                      </div>
                      <div style={{fontSize:10,color:dark?"#FCA5A5":"#7F1D1D",lineHeight:1.5}}>
                        {isHindi?"यह योजना अगले चक्र में फिर खुल सकती है। सटीक जानकारी के लिए नीचे खोजें।":"This scheme may reopen in the next cycle. Search below for the latest update."}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Primary action */}
              <div
                onClick={()=>{
                  haptic();
                  // Dead link interceptor — 404 = page gone, redirect to Google search
                  if(applyUrl&&(scheme.linkAlive??scheme.isActive)===false&&scheme.httpStatus===404){
                    googleSearchScheme(scheme.name.en);
                    return;
                  }
                  if(applyUrl) window.open(applyUrl,"_blank");
                  else googleSearchScheme(scheme.name.en);
                }}
                style={{
                  background:applyUrl&&(scheme.linkAlive??scheme.isActive)===false&&scheme.httpStatus===404
                    ?"linear-gradient(135deg,#6B7280,#9CA3AF)"
                    :applyUrl
                      ?`linear-gradient(135deg,${scheme.color},${scheme.color}cc)`
                      :`linear-gradient(135deg,#1D4ED8,#2563eb)`,
                  borderRadius:14,padding:"13px 16px",
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  cursor:"pointer",
                  boxShadow:applyUrl?`0 4px 16px ${scheme.color}40`:"0 4px 16px rgba(37,99,235,0.35)",
                  opacity:(scheme.linkAlive??scheme.isActive)===false&&scheme.httpStatus===404?0.85:1,
                }}>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:"#fff",fontFamily:bf}}>
                    {(scheme.linkAlive??scheme.isActive)===false&&scheme.httpStatus===404
                      ?(isHindi?"गूगल पर सही लिंक खोजें":"Search Google for Correct Link")
                      :scheme.lastDate&&new Date(scheme.lastDate).getTime()<Date.now()
                        ?(isHindi?"आधिकारिक वेबसाइट देखें":"Check Official Website")
                        :t.applyLabel}
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.85)",marginTop:3}}>
                    {(scheme.linkAlive??scheme.isActive)===false&&scheme.httpStatus===404
                      ?"🔎 "+scheme.name.en
                      :applyUrl?"🌐 "+scheme.apply[lang]:"🔎 Find on Google"}
                  </div>
                </div>
                <div style={{
                  width:36,height:36,borderRadius:10,fontSize:18,
                  background:"rgba(255,255,255,0.22)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  border:"1.5px solid rgba(255,255,255,0.3)",
                }}>
                  {(scheme.linkAlive??scheme.isActive)===false&&scheme.httpStatus===404?"🔎":applyUrl?"↗":"🔍"}
                </div>
              </div>

              {/* Offline helper row */}
              {!applyUrl&&(
                <>
                  <div style={{
                    display:"flex",alignItems:"center",gap:8,
                    background:dark?"rgba(255,255,255,0.04)":"#f8f9fa",
                    border:`1px solid ${th.border}`,borderRadius:11,padding:"9px 12px",
                  }}>
                    <span style={{fontSize:14,flexShrink:0}}>🏢</span>
                    <span style={{fontSize:11,color:th.textMid,fontFamily:bf,lineHeight:1.45}}>
                      {scheme.apply[lang]} — {isHindi?"नजदीकी केंद्र में जाएं।":"Visit nearest centre."}
                    </span>
                  </div>
                  {/* Always-visible Google search for offline/unverifiable schemes */}
                  <div
                    onClick={e=>{e.stopPropagation();haptic(30);googleSearchScheme(scheme.name.en);}}
                    style={{
                      display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                      background:"#EFF6FF",border:"1px solid #93C5FD",
                      borderRadius:10,padding:"10px 14px",cursor:"pointer",
                    }}>
                    <span style={{fontSize:13}}>🔎</span>
                    <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8"}}>
                      {isHindi?"गूगल पर नवीनतम जानकारी खोजें →":"Search Google for latest info →"}
                    </span>
                  </div>
                  {/* Honest status note */}
                  <div style={{
                    fontSize:10,color:dark?"#9CA3AF":"#6B7280",textAlign:"center",
                    background:dark?"rgba(255,255,255,0.03)":"#F9FAFB",
                    borderRadius:8,padding:"7px 10px",
                    border:`1px solid ${dark?"rgba(255,255,255,0.07)":"#E5E7EB"}`,
                    lineHeight:1.5,
                  }}>
                    ℹ️ {isHindi?"यह योजना ऑफलाइन है — स्वत: सत्यापन संभव नहीं। सटीक जानकारी के लिए ऑनलाइन खोजें।":"This scheme is offline — auto-verification not available. Search online for the most accurate & current info."}
                  </div>
                </>
              )}
              {/* ── View Full Checklist — opens SchemeDetailSheet with tap-to-check docs + WhatsApp share ── */}
              {onOpenDetail&&(
                <div onClick={e=>{e.stopPropagation();haptic(30);onOpenDetail(scheme.id);}}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                    marginTop:4,background:scheme.color+"13",border:`1.5px solid ${scheme.color}40`,
                    borderRadius:12,padding:"11px 14px",cursor:"pointer",
                    WebkitTapHighlightColor:"transparent"}}>
                  <span style={{fontSize:13}}>📋</span>
                  <span style={{fontSize:12,fontWeight:700,color:scheme.color,fontFamily:bf}}>
                    {isHindi?"चेकलिस्ट देखें & WhatsApp Share":"View Checklist & Share"}
                  </span>
                  <span style={{fontSize:14,color:scheme.color,opacity:0.7,marginLeft:2}}>›</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
// Custom memo comparator — ignores onToggle (always a new arrow fn) and only
// re-renders when the data that actually affects the UI changes.
const SchemeCard = memo(_SchemeCard, (prev, next) =>
  prev.scheme       === next.scheme       &&
  prev.lang         === next.lang         &&
  prev.expanded     === next.expanded     &&
  prev.dark         === next.dark         &&
  prev.onOpenDetail === next.onOpenDetail
);

// ─── CATEGORY FILTER SHEET ─────────────────────────────────────────────────────
// Opens when user taps a category tile on home page.
// Two-phase render so the sheet NEVER lags on open:
//   Phase 1 (0–30ms)  : sheet slides up with shimmer skeleton cards
//   Phase 2 (400ms)   : real SchemeCard list swaps in after animation ends
function CategorySheet({category,lang,onClose,dark=false,onOpenDetail=null}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);
  const [visible,setVisible]=useState(false);
  const [contentReady,setContentReady]=useState(false);
  const [expandedId,setExpandedId]=useState(null);

  useEffect(()=>{
    const id1=setTimeout(()=>setVisible(true),30);
    // 400ms > animation duration (350ms) — list renders after sheet is fully open
    const id2=setTimeout(()=>setContentReady(true),400);
    return()=>{clearTimeout(id1);clearTimeout(id2);};
  },[]);

  // Only filter SCHEME_DB once the sheet is visible — avoids blocking the animation
  const schemes=useMemo(()=>contentReady?getSchemesForCategory(category.filterKey):[],[category.filterKey,contentReady]);
  const nationalSchemes=useMemo(()=>schemes.filter(s=>s.scope==="national"),[schemes]);
  const stateSchemes=useMemo(()=>schemes.filter(s=>s.scope==="state"),[schemes]);

  // Reuse the global SkeletonCard — no local definition needed

  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:th.appBg,borderRadius:"24px 24px 0 0",maxHeight:"90vh",display:"flex",flexDirection:"column",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>

        {/* Sheet Header — always visible immediately */}
        <div style={{background:th.card,borderRadius:"24px 24px 0 0",padding:"12px 20px 16px",flexShrink:0,borderBottom:`1px solid ${th.border}`}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <div style={{width:40,height:4,background:th.handle,borderRadius:2}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,background:category.bg,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1.5px solid ${category.color}30`,flexShrink:0}}>
              {category.icon}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:800,color:th.text,fontFamily:bf}}>{category.label} {t.catSchemes}</div>
              {/* Count placeholder while loading, real count after */}
              <div style={{fontSize:12,color:th.textSub,marginTop:1}}>
                {contentReady
                  ?`${schemes.length} ${isHindi?"योजनाएं मिलीं":"schemes found"}`
                  :<span style={{display:"inline-block",height:10,width:72,borderRadius:5,background:dark?"rgba(255,255,255,0.09)":"#ebebeb",verticalAlign:"middle"}}/>
                }
              </div>
            </div>
            <div onClick={()=>{haptic();onClose();}} style={{width:32,height:32,borderRadius:"50%",background:th.pillBg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:th.textMid}}>✕</div>
          </div>
          {/* Animated color bar */}
          <div style={{height:3,borderRadius:4,background:`linear-gradient(90deg,${category.color},${category.color}55)`,marginTop:14}}/>
        </div>

        {/* List area */}
        <div style={{overflowY:"auto",padding:"14px 16px 40px",flex:1}}>

          {/* ── Phase 1: shimmer skeletons while sheet animates in ── */}
          {!contentReady&&(
            <>{[0,1,2,3,4].map(i=><SkeletonCard key={i} dark={dark}/>)}</>
          )}

          {/* ── Phase 2: real content after animation done ── */}
          {contentReady&&schemes.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa"}}>
              <div style={{fontSize:44,marginBottom:12}}>🔍</div>
              <div style={{fontSize:14,fontWeight:600,fontFamily:bf}}>{t.noSchemesFound}</div>
            </div>
          )}

          {/* State schemes */}
          {contentReady&&stateSchemes.length>0&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{height:1,flex:1,background:th.border2}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>
                  📍 {t.stateSchemes} ({stateSchemes.length})
                </span>
                <div style={{height:1,flex:1,background:th.border2}}/>
              </div>
              {stateSchemes.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}
                  onOpenDetail={onOpenDetail}/>
              ))}
            </>
          )}

          {/* National schemes */}
          {contentReady&&nationalSchemes.length>0&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
                <div style={{height:1,flex:1,background:th.border2}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>
                  🇮🇳 {t.centralSchemes} ({nationalSchemes.length})
                </span>
                <div style={{height:1,flex:1,background:th.border2}}/>
              </div>
              {nationalSchemes.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}
                  onOpenDetail={onOpenDetail}/>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCHEME DETAIL SHEET (tapping home page scheme card) ──────────────────────
function SchemeDetailSheet({schemeId,lang,onClose,dark=false}){
  const th=THEME[dark?"dark":"light"];
  // Looks up full scheme data from SCHEME_DB by id
  const scheme=useMemo(()=>SCHEME_DB.find(s=>s.id===schemeId),[schemeId]);
  const t=T[lang];
  const bf=fontFamily(lang);
  const isHindi=lang==="hi";
  const [visible,setVisible]=useState(false);
  useEffect(()=>{const id=setTimeout(()=>setVisible(true),30);return()=>clearTimeout(id);},[]);
  const isOnline=scheme?.applyType==="online";
  const applyUrl=useMemo(()=>isOnline?safeApplyUrl(scheme.apply.en):null,[scheme]);

  // ── Per-scheme document checklist — own localStorage slot per account+scheme ──
  // Separate from DocumentVaultCard's aggregate vault: this tracks just THIS scheme's docs.
  const uid=auth.currentUser?.uid||"guest";
  const checkKey=`yojana_scheme_check_${uid}_${schemeId}`;
  const [docChecked,setDocChecked]=useState({});
  useEffect(()=>{
    try{setDocChecked(JSON.parse(localStorage.getItem(checkKey)||"{}"));}
    catch{setDocChecked({});}
  },[checkKey]);
  const toggleDoc=useCallback((i)=>{
    haptic(30);
    setDocChecked(prev=>{
      const next={...prev,[i]:!prev[i]};
      try{localStorage.setItem(checkKey,JSON.stringify(next));}catch{}
      return next;
    });
  },[checkKey]);

  if(!scheme)return null;

  const docList=scheme.docs[lang]||[];
  const docTotal=docList.length;
  const docDone=docList.filter((_,i)=>docChecked[i]).length;
  const allDocsDone=docTotal>0&&docDone===docTotal;

  // Builds a plain-text version of the checklist for WhatsApp sharing
  const shareChecklist=()=>{
    haptic();
    const lines=[
      `📋 ${scheme.name[lang]}`,
      `💰 ${scheme.benefit[lang]}`,
      "",
      isHindi?"ज़रूरी दस्तावेज़:":"Documents needed:",
      ...docList.map((d,i)=>`${docChecked[i]?"✅":"⬜"} ${d}`),
      "",
      applyUrl
        ?(isHindi?`आवेदन करें: ${applyUrl}`:`Apply here: ${applyUrl}`)
        :(isHindi?`आवेदन: ${scheme.apply[lang]}`:`How to apply: ${scheme.apply[lang]}`),
      "",
      "─────────────────────",
      isHindi?"🇮🇳 अपनी पात्र योजनाएं मुफ्त खोजें:":"🇮🇳 Find schemes you qualify for — free:",
      "👉 https://yojanasahay.vercel.app",
    ];
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
  };

  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:th.card,borderRadius:"24px 24px 0 0",maxHeight:"85vh",overflowY:"auto",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>
        <div style={{display:"flex",justifyContent:"center",paddingTop:12}}>
          <div style={{width:40,height:4,background:th.handle,borderRadius:2}}/>
        </div>
        <div style={{background:`linear-gradient(135deg,${scheme.color}15,${scheme.color}05)`,margin:16,borderRadius:20,padding:20,border:`1.5px solid ${scheme.color}22`,position:"relative"}}>
          <div onClick={()=>{haptic();onClose();}} style={{position:"absolute",top:12,right:12,width:30,height:30,borderRadius:"50%",background:dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:th.textMid}}>✕</div>
          <div style={{fontSize:40,marginBottom:10}}>{scheme.icon}</div>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontWeight:700,background:scheme.scope==="national"?"#EFF6FF":"#FEF9C3",color:scheme.scope==="national"?"#1D4ED8":"#854D0E",borderRadius:8,padding:"3px 8px"}}>
              {scheme.scope==="national"?t.centralLabel:t.stateLabel(scheme.state)}
            </span>
            <span style={{fontSize:10,fontWeight:700,background:scheme.color+"18",color:scheme.color,borderRadius:8,padding:"3px 8px"}}>{scheme.tag[lang]}</span>
          </div>
          <div style={{fontSize:17,fontWeight:800,color:th.text,marginBottom:8,paddingRight:36,fontFamily:bf}}>{scheme.name[lang]}</div>
          <div style={{display:"inline-flex",background:scheme.color,borderRadius:20,padding:"5px 14px",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{scheme.benefit[lang]}</span>
          </div>
          {scheme.annual>0&&<div style={{fontSize:12,color:th.textMid}}>📅 Annual: <strong style={{color:scheme.color}}>₹{scheme.annual.toLocaleString("en-IN")}</strong></div>}
          <div style={{fontSize:11,color:th.textSub,marginTop:4}}>{scheme.ministry[lang]}</div>
        </div>
        <div style={{padding:"0 16px 36px"}}>
          {/* ── Application Checklist header + live progress ── */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,paddingLeft:2}}>
            <div style={{fontSize:11,fontWeight:700,color:th.textSub,letterSpacing:0.6,textTransform:"uppercase",fontFamily:bf}}>
              {isHindi?"आवेदन चेकलिस्ट":"Application Checklist"}
            </div>
            {docTotal>0&&(
              <div style={{display:"flex",alignItems:"center",gap:5,background:allDocsDone?"rgba(19,136,8,0.12)":th.card2,border:`1px solid ${allDocsDone?"rgba(19,136,8,0.3)":th.border}`,borderRadius:20,padding:"3px 9px"}}>
                <span style={{fontSize:10,fontWeight:800,color:allDocsDone?"#138808":th.textSub,fontVariantNumeric:"tabular-nums"}}>{docDone}/{docTotal}</span>
                <span style={{fontSize:10}}>{allDocsDone?"✅":"📋"}</span>
              </div>
            )}
          </div>

          {/* ── STEP 1 — Gather Documents (tap to check off) ── */}
          <div style={{background:th.card2,borderRadius:16,padding:16,marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:scheme.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10.5,fontWeight:900,color:"#fff",fontFamily:"'Noto Sans',sans-serif"}}>1</div>
              <div style={{fontSize:12.5,fontWeight:700,color:th.text,fontFamily:bf}}>{isHindi?"दस्तावेज़ इकट्ठा करें":"Gather These Documents"}</div>
            </div>
            {docList.map((doc,i)=>{
              const isChecked=!!docChecked[i];
              return(
                <div key={i} onClick={()=>toggleDoc(i)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<docList.length-1?`1px solid ${th.border}`:"none",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:isChecked?scheme.color:scheme.color+"18",border:isChecked?"none":`1.5px solid ${scheme.color}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s"}}>
                    <span style={{color:isChecked?"#fff":scheme.color,fontSize:11,fontWeight:800}}>✓</span>
                  </div>
                  <span style={{fontSize:13,color:isChecked?th.textSub:th.text,fontFamily:bf,textDecoration:isChecked?"line-through":"none",transition:"color 0.2s"}}>{doc}</span>
                </div>
              );
            })}
          </div>

          {/* ── STEP 2 — Apply at the portal / office ── */}
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10,paddingLeft:2}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:scheme.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10.5,fontWeight:900,color:"#fff",fontFamily:"'Noto Sans',sans-serif"}}>2</div>
            <div style={{fontSize:12.5,fontWeight:700,color:th.text,fontFamily:bf}}>{isHindi?"पोर्टल पर आवेदन करें":"Apply & Submit"}</div>
          </div>
          <div onClick={()=>{haptic();if(applyUrl)window.open(applyUrl,"_blank");else googleSearchScheme(scheme.name.en);}}
            style={{background:applyUrl?`linear-gradient(135deg,${scheme.color},${scheme.color}cc)`:"linear-gradient(135deg,#1D4ED8,#2563eb)",borderRadius:16,padding:18,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",boxShadow:applyUrl?`0 6px 20px ${scheme.color}40`:"0 6px 20px rgba(37,99,235,0.35)"}}>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:bf}}>{t.applyLabel}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:3}}>{applyUrl?"🌐 "+scheme.apply[lang]:"🔎 Find on Google"}</div>
            </div>
            <div style={{width:40,height:40,background:"rgba(255,255,255,0.2)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:"1.5px solid rgba(255,255,255,0.3)"}}>
              {applyUrl?"↗":"🔍"}
            </div>
          </div>
          {!applyUrl&&(
            <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,background:"#f8f9fa",border:"1px solid #e8e8e8",borderRadius:12,padding:"10px 14px"}}>
              <span style={{fontSize:15,flexShrink:0}}>🏢</span>
              <span style={{fontSize:12,color:"#555",fontFamily:bf,lineHeight:1.5}}>
                {scheme.apply[lang]} — Visit nearest centre or search online for exact process.
              </span>
            </div>
          )}

          {/* ── Share checklist on WhatsApp ── */}
          <div onClick={shareChecklist} style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:dark?"rgba(37,211,102,0.12)":"#E7F9EF",border:"1.5px solid rgba(37,211,102,0.35)",borderRadius:14,padding:"12px 16px",cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5.1-1.3c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm5.5 12.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.8-.4-1.6-.9-2.4-1.6-.7-.6-1.2-1.4-1.6-2.2-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.1-.5-.1-.2-.6-1.5-.9-2-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.5-1 2.5.1 1.2.6 2.4 1.4 3.5 1.5 2 3.3 3.4 5.6 4.2.6.2 1.1.2 1.5.1.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.3z"/></svg>
            <span style={{fontSize:12.5,fontWeight:700,color:dark?"#25D366":"#0E7A3C",fontFamily:bf}}>{isHindi?"WhatsApp पर चेकलिस्ट भेजें":"Share Checklist on WhatsApp"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SEARCH TAB ────────────────────────────────────────────────────────────────
// Paginated + skeleton + deferred query to match SchemesTab performance.
// Root cause of old lag: dumped ALL SCHEME_DB cards to DOM at once (no pagination).
function SearchTab({lang,dark=false,onOpenDetail=null}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);

  // ── Input state — raw query updates instantly (responsive feel)
  const [query,setQuery]=useState("");
  const [expandedId,setExpandedId]=useState(null);
  const [visibleCount,setVisibleCount]=useState(PAGE_SIZE);
  const [focused,setFocused]=useState(false);
  const [isReady,setIsReady]=useState(false); // delays first paint so tab animation fires first

  const inputRef=useRef(null);
  const sentinelRef=useRef(null); // IntersectionObserver target at bottom of list

  // Defer the heavy filter to a low-priority render — typing stays instant
  const deferredQuery=useDeferredValue(query);
  const isStale=query!==deferredQuery; // true while deferred hasn't caught up

  // 1-frame delay so the tab slide-in animation completes before mounting cards
  useEffect(()=>{
    const id=requestAnimationFrame(()=>setIsReady(true));
    return()=>cancelAnimationFrame(id);
  },[]);

  // Reset pagination whenever the actual search query changes
  useEffect(()=>{
    setVisibleCount(PAGE_SIZE);
    setExpandedId(null);
  },[deferredQuery]);

  // ── Track search queries (debounced via deferredQuery, min 3 chars) ──────
  useEffect(()=>{
    const q=deferredQuery.trim();
    if(q.length<3) return;
    try{
      setDoc(doc(db,"appStats","usage"),{
        schemeSearches:arrayUnion({q,uid:auth.currentUser?.uid||"anon",ts:new Date().toISOString()}),
        searchTotal:increment(1),
      },{merge:true}).catch(()=>{});
    }catch{}
  },[deferredQuery]);

  // Filtered results — runs only when deferred query settles (not on every keystroke)
  const results=useMemo(()=>{
    if(!isReady) return [];
    if(deferredQuery.trim().length===0) return SCHEME_DB;
    const q=deferredQuery.toLowerCase();
    return SCHEME_DB.filter(s=>(
      s.name.en.toLowerCase().includes(q)||
      s.name.hi.toLowerCase().includes(q)||
      s.tag.en.toLowerCase().includes(q)||
      s.tag.hi.toLowerCase().includes(q)||
      s.ministry.en.toLowerCase().includes(q)||
      (s.state&&s.state.toLowerCase().includes(q))
    ));
  },[deferredQuery,isReady]);

  const national=useMemo(()=>results.filter(s=>s.scope==="national"),[results]);
  const stateRes=useMemo(()=>results.filter(s=>s.scope==="state"),[results]);

  // Paginated slices — same budget logic as SchemesTab
  const visibleState=useMemo(()=>stateRes.slice(0,Math.min(visibleCount,stateRes.length)),[stateRes,visibleCount]);
  const centralBudget=Math.max(0,visibleCount-stateRes.length);
  const visibleNat=useMemo(()=>national.slice(0,centralBudget),[national,centralBudget]);
  const totalVisible=visibleState.length+visibleNat.length;
  const hasMore=totalVisible<results.length;

  // Auto-load next page when sentinel scrolls into view
  useEffect(()=>{
    if(!hasMore||!sentinelRef.current) return;
    const obs=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting) setVisibleCount(c=>c+PAGE_SIZE);
    },{threshold:0.1});
    obs.observe(sentinelRef.current);
    return()=>obs.disconnect();
  },[hasMore,totalVisible]);

  const skeletonCount=!isReady||isStale?6:0;
  const hintText=isHindi
    ?"यहाँ टाइप करें — योजना का नाम, मंत्रालय या राज्य"
    :"Tap to search — scheme name, ministry or state";

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",background:th.appBg}}>

      {/* ── Sticky search bar ── */}
      <div style={{background:th.card,padding:"16px 16px 12px",borderBottom:`1px solid ${th.border}`,position:"sticky",top:0,zIndex:10}}>
        <div
          onClick={()=>inputRef.current?.focus()}
          style={{
            background:th.searchBg,borderRadius:14,
            display:"flex",alignItems:"center",gap:10,padding:"12px 16px",
            border:`2px solid ${focused?"#FF9933":"#FF993340"}`,
            transition:"border-color 0.2s",cursor:"text",
          }}>
          <span style={{fontSize:18}}>🔍</span>
          <div style={{flex:1,position:"relative",minWidth:0}}>
            <input
              ref={inputRef}
              value={query}
              onChange={e=>setQuery(e.target.value)}
              onFocus={()=>setFocused(true)}
              onBlur={()=>setFocused(false)}
              style={{border:"none",outline:"none",fontSize:14,width:"100%",background:"transparent",color:th.text,fontFamily:bf}}
            />
            {/* Floating hint — visible until user taps or types */}
            {!query&&!focused&&(
              <div style={{
                position:"absolute",top:"50%",left:0,transform:"translateY(-50%)",
                fontSize:13,color:th.textSub,pointerEvents:"none",
                whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                width:"100%",fontFamily:bf,
              }}>
                {hintText}
              </div>
            )}
          </div>
          {/* Stale spinner while deferred query is catching up */}
          {isStale&&(
            <div style={{flexShrink:0}}>
              <AshokaChakra size={15} color={SAFFRON} spinning={true}/>
            </div>
          )}
          {query&&!isStale&&(
            <span onClick={e=>{e.stopPropagation();haptic();setQuery("");}}
              style={{cursor:"pointer",color:"#aaa",fontSize:18,flexShrink:0}}>✕</span>
          )}
        </div>
        {/* Result count */}
        <div style={{fontSize:12,color:th.textSub,marginTop:8,paddingLeft:2}}>
          {isReady&&!isStale
            ?`${results.length} ${isHindi?"योजनाएं":"schemes"} · ${national.length} ${isHindi?"केंद्रीय":"Central"} · ${stateRes.length} ${isHindi?"राज्य":"State"}`
            :(isHindi?"खोज रहे हैं…":"Searching…")
          }
        </div>
      </div>

      {/* ── Results ── */}
      <div style={{padding:"12px 16px 80px"}}>

        {/* ── Smart Verification Status ── */}
        {VERIFICATION_STATS.verified>0?(
          <div style={{
            display:"flex",alignItems:"center",gap:10,
            background:dark?"rgba(19,136,8,0.09)":"linear-gradient(135deg,rgba(22,163,74,0.10),rgba(74,222,128,0.04))",
            border:`1px solid ${dark?"rgba(19,136,8,0.22)":"rgba(19,136,8,0.22)"}`,
            borderRadius:12,padding:"9px 13px",marginBottom:14,boxShadow:dark?"none":"0 1px 8px rgba(19,136,8,0.07)",
          }}>
            <span style={{fontSize:15,flexShrink:0}}>🛡️</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:dark?"#4ade80":"#15803d",fontFamily:bf,lineHeight:1.3}}>
                {isHindi
                  ?`${VERIFICATION_STATS.pctLive}% लिंक सत्यापित और लाइव`
                  :`${VERIFICATION_STATS.pctLive}% links verified live`}
                {LAST_VERIFIED_LABEL&&(
                  <span style={{fontWeight:500,opacity:0.7}}>
                    {isHindi?` · जाँच: ${LAST_VERIFIED_LABEL}`:` · Checked ${LAST_VERIFIED_LABEL}`}
                  </span>
                )}
              </div>
              <div style={{fontSize:10,color:dark?"rgba(74,222,128,0.6)":"rgba(15,98,46,0.85)",marginTop:2,fontFamily:bf,lineHeight:1.4}}>
                {isHindi
                  ?"लिंक काम न करे तो कार्ड › खोलें — ~5% अगली जाँच से पहले बदल सकते हैं"
                  :"Tap › on a card for the official link · ~5% may change between checks"}
              </div>
            </div>
            <div style={{
              fontSize:8,fontWeight:800,letterSpacing:0.7,flexShrink:0,
              color:dark?"#4ade80":"#15803d",
              background:dark?"rgba(19,136,8,0.16)":"rgba(19,136,8,0.14)",
              border:`1px solid ${dark?"rgba(19,136,8,0.28)":"rgba(19,136,8,0.30)"}`,
              borderRadius:20,padding:"3px 9px",textTransform:"uppercase",
            }}>
              {isHindi?"सत्यापित":"AI VERIFIED"}
            </div>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"flex-start",gap:8,background:dark?"rgba(255,153,51,0.08)":"#FFFBEB",borderRadius:12,padding:"9px 12px",marginBottom:14,border:`1px solid ${dark?"rgba(255,153,51,0.18)":"#FDE68A"}`}}>
            <span style={{fontSize:13,flexShrink:0,marginTop:1}}>💡</span>
            <span style={{fontSize:11,color:dark?"#fbbf24":"#92400e",lineHeight:1.5,fontFamily:bf}}>
              {isHindi?"कुछ योजना लिंक काम नहीं कर सकते। सटीक जानकारी के लिए योजना का नाम Google पर खोजें।":"Some scheme links may not work. Search the scheme name on Google for the latest info."}
            </span>
          </div>
        )}

        {/* Skeleton shimmer while loading / searching */}
        {skeletonCount>0&&Array.from({length:skeletonCount}).map((_,i)=>(
          <SkeletonCard key={`srch-sk-${i}`} dark={dark}/>
        ))}

        {/* Real cards — fade in once ready and not stale */}
        <div style={{
          opacity:isReady&&!isStale?1:0,
          transition:"opacity 0.18s ease",
          pointerEvents:isStale?"none":"auto",
        }}>

          {/* Central schemes */}
          {visibleNat.length>0&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{height:1,flex:1,background:th.border2}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>
                  🇮🇳 {t.centralSchemes} ({national.length})
                </span>
                <div style={{height:1,flex:1,background:th.border2}}/>
              </div>
              {visibleNat.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}
                  onOpenDetail={onOpenDetail}/>
              ))}
            </>
          )}

          {/* State schemes */}
          {visibleState.length>0&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,margin:`${visibleNat.length>0?14:0}px 0 10px`}}>
                <div style={{height:1,flex:1,background:th.border2}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>
                  📍 {t.stateSchemes} ({stateRes.length})
                </span>
                <div style={{height:1,flex:1,background:th.border2}}/>
              </div>
              {visibleState.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}
                  onOpenDetail={onOpenDetail}/>
              ))}
            </>
          )}

          {/* Auto load-more sentinel */}
          {hasMore&&(
            <div ref={sentinelRef} style={{padding:"18px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <AshokaChakra size={15} color={SAFFRON} spinning={true}/>
              <span style={{fontSize:12,color:th.textSub,fontFamily:bf}}>
                {isHindi?"और योजनाएं लोड हो रही हैं...":"Loading more schemes…"}
              </span>
            </div>
          )}

          {/* No results */}
          {isReady&&!isStale&&results.length===0&&(
            <div style={{textAlign:"center",padding:"50px 20px"}}>
              <div style={{fontSize:44,marginBottom:12}}>🔍</div>
              <div style={{fontSize:15,fontWeight:700,color:th.text,fontFamily:bf}}>{t.noMatchTitle}</div>
              <div style={{fontSize:13,marginTop:6,color:th.textSub}}>{t.noMatchSub}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STATE PICKER SHEET ────────────────────────────────────────────────────────
// Smart bottom sheet: alphabet sidebar, grouped sections, recently picked memory
const RECENT_STATE_KEY = "yojana_recent_state";

function StatePickerSheet({selectedState,onSelect,onClose,lang,dark=false}){
  const th=THEME[dark?"dark":"light"];
  const bf=fontFamily(lang);
  const isHindi=lang==="hi";
  const [search,setSearch]=useState("");
  const [visible,setVisible]=useState(false);
  const [activeLetter,setActiveLetter]=useState(null);
  const listRef=useRef(null);
  const sectionRefs=useRef({});
  const searchRef=useRef(null);

  // Persist recently selected state across sessions
  const [recentState,setRecentState]=useState(()=>{
    try{ return localStorage.getItem(RECENT_STATE_KEY)||null; }catch{ return null; }
  });

  useEffect(()=>{const id=setTimeout(()=>setVisible(true),30);return()=>clearTimeout(id);},[]);

  const isSearching=search.trim().length>0;

  // Flat filtered list (used when searching)
  const filteredStates=useMemo(()=>
    INDIA_STATES.filter(s=>s.toLowerCase().includes(search.toLowerCase()))
  ,[search]);

  // Grouped by first letter (used when not searching)
  const grouped=useMemo(()=>{
    const map={};
    INDIA_STATES.forEach(s=>{
      const letter=s[0].toUpperCase();
      if(!map[letter])map[letter]=[];
      map[letter].push(s);
    });
    return map;
  },[]);

  const alphabet=useMemo(()=>Object.keys(grouped).sort(),[grouped]);

  // Jump to letter section
  const jumpTo=(letter)=>{
    setActiveLetter(letter);
    const el=sectionRefs.current[letter];
    if(el&&listRef.current){
      listRef.current.scrollTo({top:el.offsetTop-8,behavior:"smooth"});
    }
    setTimeout(()=>setActiveLetter(null),600);
  };

  const handleSelect=(st)=>{
    try{ localStorage.setItem(RECENT_STATE_KEY,st); }catch{}
    setRecentState(st);
    onSelect(st);
    onClose();
  };

  const StateRow=({st,icon="📍"})=>(
    <div onClick={()=>{haptic();handleSelect(st);}}
      style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",
        background:selectedState===st?SAFFRON+"15":"transparent",
        cursor:"pointer",borderBottom:`1px solid ${th.border}`,
        transition:"background 0.15s"}}>
      <span style={{fontSize:15}}>{icon}</span>
      <span style={{flex:1,fontSize:14,fontWeight:selectedState===st?700:500,
        color:selectedState===st?SAFFRON:th.text,fontFamily:bf}}>{st}</span>
      {selectedState===st&&(
        <span style={{width:20,height:20,borderRadius:"50%",background:SAFFRON,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,color:"#fff",fontWeight:800,flexShrink:0}}>✓</span>
      )}
    </div>
  );

  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.55)",
        display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:th.card,
        borderRadius:"24px 24px 0 0",maxHeight:"82vh",display:"flex",flexDirection:"column",
        transform:visible?"translateY(0)":"translateY(100%)",
        transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)"}}>

        {/* Drag handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 8px",flexShrink:0}}>
          <div style={{width:40,height:4,background:th.handle,borderRadius:2}}/>
        </div>

        {/* Title + search */}
        <div style={{padding:"0 16px 12px",borderBottom:`1px solid ${th.border}`,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:th.text,fontFamily:bf}}>
                {isHindi?"राज्य चुनें":"Select State"}
              </div>
              <div style={{fontSize:11,color:th.textSub,marginTop:2}}>
                {isHindi?"A–Z से जल्दी जाएं या खोजें":"Jump A–Z or search"}
              </div>
            </div>
            <div onClick={()=>{haptic();onClose();}}
              style={{width:30,height:30,borderRadius:"50%",background:th.pillBg,
                display:"flex",alignItems:"center",justifyContent:"center",
                cursor:"pointer",fontSize:13,color:th.textMid}}>✕</div>
          </div>
          {/* Search bar — NOT autofocused, user taps to open keyboard */}
          <div style={{background:th.searchBg,borderRadius:12,display:"flex",
            alignItems:"center",gap:8,padding:"10px 14px",border:`1.5px solid ${th.border2}`}}>
            <span style={{fontSize:15}}>🔍</span>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={isHindi?"राज्य खोजें...":"Search state..."}
              style={{border:"none",outline:"none",fontSize:13,flex:1,
                background:"transparent",color:th.text,fontFamily:bf}}/>
            {search
              ? <span onClick={()=>{haptic();setSearch("");}}
                  style={{cursor:"pointer",color:"#aaa",fontSize:16,padding:"2px 4px"}}>✕</span>
              : <span style={{fontSize:11,color:th.textLight,fontWeight:600}}>A–Z</span>
            }
          </div>
        </div>

        {/* Main body: list + alphabet sidebar side by side */}
        <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative"}}>

          {/* Scrollable state list */}
          <div ref={listRef} style={{flex:1,overflowY:"auto",paddingBottom:40,paddingRight:24}}>

            {/* All States row — always on top */}
            <div onClick={()=>{haptic();onSelect("all");onClose();}}
              style={{display:"flex",alignItems:"center",gap:12,padding:"13px 20px",
                background:selectedState==="all"?ASHOKA_BLUE+"10":"transparent",
                cursor:"pointer",borderBottom:`1px solid ${th.border}`}}>
              <span style={{fontSize:18}}>🇮🇳</span>
              <span style={{flex:1,fontSize:14,fontWeight:selectedState==="all"?700:500,
                color:selectedState==="all"?ASHOKA_BLUE:th.text,fontFamily:bf}}>
                {isHindi?"सभी राज्य":"All States"}
              </span>
              {selectedState==="all"&&(
                <span style={{width:20,height:20,borderRadius:"50%",background:ASHOKA_BLUE,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,color:"#fff",fontWeight:800,flexShrink:0}}>✓</span>
              )}
            </div>

            {/* Recently picked — shown only when not searching and a prior selection exists */}
            {!isSearching&&recentState&&recentState!=="all"&&recentState!==selectedState&&(
              <>
                <div style={{padding:"8px 20px 4px",fontSize:10,fontWeight:700,
                  color:th.textSub,letterSpacing:0.8,textTransform:"uppercase",
                  background:th.card2}}>
                  {isHindi?"हाल में चुना":"Recently Picked"} 🕐
                </div>
                <StateRow st={recentState} icon="🕐"/>
              </>
            )}

            {/* Currently selected highlight — show at top when not "all" and not searching */}
            {!isSearching&&selectedState&&selectedState!=="all"&&(
              <>
                <div style={{padding:"8px 20px 4px",fontSize:10,fontWeight:700,
                  color:SAFFRON,letterSpacing:0.8,textTransform:"uppercase",
                  background:SAFFRON+"08"}}>
                  {isHindi?"चुना गया":"Selected"} ✓
                </div>
                <StateRow st={selectedState} icon="📍"/>
              </>
            )}

            {/* ── SEARCH MODE: flat filtered list ── */}
            {isSearching&&(
              <>
                {filteredStates.map(st=><StateRow key={st} st={st}/>)}
                {filteredStates.length===0&&(
                  <div style={{textAlign:"center",padding:"40px 20px",color:th.textSub,fontFamily:bf}}>
                    <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                    <div style={{fontSize:13,fontWeight:600}}>
                      {isHindi?"कोई राज्य नहीं मिला":"No state found"}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── BROWSE MODE: grouped A–Z sections ── */}
            {!isSearching&&alphabet.map(letter=>(
              <div key={letter} ref={el=>sectionRefs.current[letter]=el}>
                {/* Letter header */}
                <div style={{padding:"6px 20px 4px",fontSize:11,fontWeight:800,
                  color:activeLetter===letter?SAFFRON:th.textSub,
                  background:activeLetter===letter?SAFFRON+"12":th.card2,
                  letterSpacing:1,transition:"all 0.2s"}}>
                  {letter}
                </div>
                {grouped[letter].map(st=><StateRow key={st} st={st}/>)}
              </div>
            ))}
          </div>

          {/* ── ALPHABET SIDEBAR ── */}
          {!isSearching&&(
            <div style={{position:"absolute",right:0,top:0,bottom:0,
              width:24,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",
              paddingTop:4,paddingBottom:4,gap:1,zIndex:10}}>
              {alphabet.map(letter=>(
                <div key={letter} onClick={()=>{haptic(30);jumpTo(letter);}}
                  style={{width:20,height:20,display:"flex",alignItems:"center",
                    justifyContent:"center",borderRadius:6,cursor:"pointer",
                    fontSize:10,fontWeight:700,
                    background:activeLetter===letter?SAFFRON:"transparent",
                    color:activeLetter===letter?"#fff":th.textSub,
                    transition:"all 0.15s"}}>
                  {letter}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCHEME SKELETON CARD ──────────────────────────────────────────────────────
// Shimmer placeholder shown while schemes are loading / filtering
function SkeletonCard({dark=false}){
  const th=THEME[dark?"dark":"light"];
  return(
    <div style={{background:th.card,borderRadius:16,padding:"14px 16px",marginBottom:10,
      border:`1.5px solid ${th.border}`,overflow:"hidden",position:"relative",
      "--sk-shimmer-color": dark?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.75)"}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div className="sk-s" style={{width:42,height:42,borderRadius:13,flexShrink:0,
          background:dark?"#2c2c2e":"#eeeeea"}}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <div className="sk-s" style={{width:58,height:16,borderRadius:8,background:dark?"#2c2c2e":"#eeeeea"}}/>
            <div className="sk-s" style={{width:80,height:16,borderRadius:8,background:dark?"#2c2c2e":"#eeeeea"}}/>
          </div>
          <div className="sk-s" style={{width:"72%",height:14,borderRadius:6,marginBottom:8,background:dark?"#333":"#e5e5e0"}}/>
          <div className="sk-s" style={{width:"48%",height:12,borderRadius:6,background:dark?"#2c2c2e":"#eeeeea"}}/>
        </div>
      </div>
    </div>
  );
}

// ─── ALL SCHEMES TAB ───────────────────────────────────────────────────────────
// Paginated + skeleton + deferred-filter for instant tab open
const PAGE_SIZE=20;

function SchemesTab({lang,dark=false,onOpenDetail=null}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);

  const [expandedId,setExpandedId]=useState(null);
  const [filter,setFilter]=useState("all");
  const [selectedState,setSelectedState]=useState("all");
  const [dismissingState,setDismissingState]=useState(false);
  const [showStatePicker,setShowStatePicker]=useState(false);
  const [visibleCount,setVisibleCount]=useState(PAGE_SIZE);
  const [isReady,setIsReady]=useState(false);
  const [scrollingTo,setScrollingTo]=useState(null); // "state" | "central" | null

  // ── Track state selections ────────────────────────────────────────────────
  const handleStateSelect=useCallback((st)=>{
    setSelectedState(st);
    if(st && st!=="all"){
      try{
        setDoc(doc(db,"appStats","usage"),{
          stateSelections:arrayUnion({state:st,ts:new Date().toISOString()}),
          [`stateCount_${st.replace(/\s+/g,"_")}`]:increment(1),
        },{merge:true}).catch(()=>{});
      }catch{}
    }
  },[]);

  // ── One-time filter hint ──────────────────────────────────────────────────
  // Shows an animated swipe hint on first visit only. Dismissed on:
  //   • Any pill tap  • Auto-dismiss after 2.5s  • Stored in localStorage
  const HINT_KEY="ys_filter_hint_seen";
  const [showFilterHint,setShowFilterHint]=useState(false);
  const hintTimer=useRef(null);
  const pillRowRef=useRef(null);

  useEffect(()=>{
    // Only show if user has never seen it
    let alreadySeen=false;
    try{alreadySeen=!!localStorage.getItem(HINT_KEY);}catch{}
    if(alreadySeen) return;
    // Delay slightly so tab slide animation completes first
    const id=setTimeout(()=>setShowFilterHint(true), 900);
    return()=>clearTimeout(id);
  },[]);

  useEffect(()=>{
    if(!showFilterHint) return;
    // Auto-dismiss after 3s
    hintTimer.current=setTimeout(()=>dismissHint(), 3000);
    return()=>{if(hintTimer.current)clearTimeout(hintTimer.current);};
  },[showFilterHint]);

  const dismissHint=()=>{
    setShowFilterHint(false);
    try{localStorage.setItem(HINT_KEY,"1");}catch{}
  };
  // ─────────────────────────────────────────────────────────────────────────

  const cats=useMemo(()=>CATEGORIES[lang],[lang]);

  const scrollContainerRef=useRef(null);
  const stateHeaderRef=useRef(null);
  const centralHeaderRef=useRef(null);
  const loadMoreRef=useRef(null);
  const pendingScrollCentral=useRef(false);

  // Deferred values: pill taps are instant; heavy filtering runs async
  const deferredFilter=useDeferredValue(filter);
  const deferredState=useDeferredValue(selectedState);
  const isStale=filter!==deferredFilter||selectedState!==deferredState;

  // Delay first paint by 1 frame so tab slide animation fires first
  useEffect(()=>{
    const id=requestAnimationFrame(()=>setIsReady(true));
    return()=>cancelAnimationFrame(id);
  },[]);

  const filtered=useMemo(()=>{
    let base=deferredFilter==="all"?SCHEME_DB:getSchemesForCategory(deferredFilter);
    if(deferredState!=="all"){
      base=base.filter(s=>s.scope==="national"||s.state===deferredState);
    }
    // Rank: active(2) > unverified(1) > expired/dead(0)
    const now=Date.now();
    return [...base].sort((a,b)=>{
      // Fix 3: rank by linkAlive (pure URL liveness), falling back to the
      // legacy isActive field for schemes not yet re-verified.
      const sc=s=>{const la=s.linkAlive??s.isActive;return la===true?2:la===false||(s.lastDate&&new Date(s.lastDate).getTime()<now)?0:1;};
      return sc(b)-sc(a);
    });
  },[deferredFilter,deferredState]);

  const national=useMemo(()=>filtered.filter(s=>s.scope==="national"),[filtered]);
  const stateSchemes=useMemo(()=>filtered.filter(s=>s.scope==="state"),[filtered]);

  // Reset pagination when filter changes
  useEffect(()=>{setVisibleCount(PAGE_SIZE);setExpandedId(null);},[filter,selectedState]);

  // Smooth state-chip dismiss: play exit animation, then clear state
  const handleClearState=useCallback(()=>{
    haptic(30);
    setDismissingState(true);
    setTimeout(()=>{
      setSelectedState("all");
      setDismissingState(false);
    },280);
  },[]);

  // Paginated slices — state schemes first, then central
  const visibleState=useMemo(()=>stateSchemes.slice(0,Math.min(visibleCount,stateSchemes.length)),[stateSchemes,visibleCount]);
  const centralBudget=Math.max(0,visibleCount-stateSchemes.length);
  const visibleNat=useMemo(()=>national.slice(0,centralBudget),[national,centralBudget]);
  const totalVisible=visibleState.length+visibleNat.length;
  const hasMore=totalVisible<filtered.length;

  // IntersectionObserver: silently load next page when sentinel scrolls into view
  useEffect(()=>{
    if(!hasMore||!loadMoreRef.current)return;
    const obs=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting)setVisibleCount(c=>c+PAGE_SIZE);
    },{threshold:0.1});
    obs.observe(loadMoreRef.current);
    return()=>obs.disconnect();
  },[hasMore,totalVisible]);

  // When central pill is tapped before central schemes are rendered,
  // we force-load them (visibleCount bump) and set pendingScrollCentral=true.
  // This effect fires once visibleNat is non-empty and does the deferred scroll.
  useEffect(()=>{
    if(!pendingScrollCentral.current||visibleNat.length===0)return;
    pendingScrollCentral.current=false;
    requestAnimationFrame(()=>scrollToRef(centralHeaderRef,"central"));
  },[visibleNat.length]);

  const scrollToRef=(ref,target=null)=>{
    if(!ref.current||!scrollContainerRef.current)return;
    const container=scrollContainerRef.current;
    const containerTop=container.getBoundingClientRect().top;
    const elTop=ref.current.getBoundingClientRect().top;
    if(target) setScrollingTo(target);
    container.scrollTo({top:elTop-containerTop+container.scrollTop-12,behavior:"smooth"});
    setTimeout(()=>setScrollingTo(null),900);
  };

  const skeletonCount=!isReady||isStale?6:0;

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto",background:th.appBg}}>

      {/* ── STICKY HEADER ── */}
      <div style={{background:th.card,padding:"16px 16px 0",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${th.border}`}}>

        {/* Title row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:17,fontWeight:800,color:th.text,fontFamily:bf}}>{t.allSchemes||"All Schemes"}</div>
            {isStale&&(
              <div style={{width:16,height:16,flexShrink:0}}>
                <AshokaChakra size={16} color={SAFFRON} spinning={true}/>
              </div>
            )}
          </div>
          <div onClick={()=>{haptic();setShowStatePicker(true);}}
            className="fpill-state"
            style={{
              background:selectedState!=="all"?SAFFRON+"18":th.pillBg,
              border:`1.5px solid ${selectedState!=="all"?SAFFRON:th.border2}`,
              boxShadow:selectedState!=="all"?`0 2px 10px ${SAFFRON}28`:"0 1px 4px rgba(0,0,0,0.06)",
            }}>
            <span style={{fontSize:14,lineHeight:1}}>🇮🇳</span>
            <span style={{fontSize:11,fontWeight:700,color:selectedState!=="all"?SAFFRON:th.textMid,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:bf}}>
              {selectedState==="all"?(isHindi?"सभी राज्य":"All States"):selectedState}
            </span>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{opacity:0.5,flexShrink:0}}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke={selectedState!=="all"?SAFFRON:th.textSub} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Category filter pills */}
        <div style={{position:"relative"}}>
          {/* ── One-time filter hint overlay ── */}
          {showFilterHint&&(
            <div
              onClick={dismissHint}
              style={{
                position:"absolute",inset:0,zIndex:20,
                borderRadius:12,
                pointerEvents:"auto",
                overflow:"hidden",
              }}>
              {/* Frosted backdrop — only over the pill row */}
              <div style={{
                position:"absolute",inset:0,
                background:dark?"rgba(0,0,0,0.55)":"rgba(255,255,255,0.72)",
                backdropFilter:"blur(3px)",WebkitBackdropFilter:"blur(3px)",
                borderRadius:12,
                animation:"hint-fade-in 0.35s ease forwards",
              }}/>
              {/* Tooltip bubble */}
              <div style={{
                position:"absolute",
                top:"50%",left:"50%",
                transform:"translate(-50%,-50%)",
                display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                animation:"hint-pop-in 0.40s cubic-bezier(0.34,1.56,0.64,1) forwards",
                pointerEvents:"none",
                whiteSpace:"nowrap",
              }}>
                {/* Animated finger */}
                <div style={{
                  fontSize:26,lineHeight:1,
                  animation:"hint-finger-slide 1.1s cubic-bezier(0.4,0,0.2,1) 0.2s infinite",
                  filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
                }}>
                  👆
                </div>
                {/* Label */}
                <div style={{
                  background:dark?"rgba(255,153,51,0.95)":"#FF9933",
                  color:"#fff",
                  fontSize:12,fontWeight:800,
                  fontFamily:bf,letterSpacing:0.3,
                  borderRadius:20,padding:"5px 14px",
                  boxShadow:"0 4px 16px rgba(255,153,51,0.50)",
                  border:"1.5px solid rgba(255,255,255,0.30)",
                }}>
                  {isHindi?"श्रेणी चुनें — योजनाएं फ़िल्टर होंगी":"Tap a pill to filter schemes"}
                </div>
                {/* Dismiss hint */}
                <div style={{
                  fontSize:9.5,fontWeight:600,
                  color:dark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.35)",
                  fontFamily:bf,letterSpacing:0.3,marginTop:2,
                }}>
                  {isHindi?"टैप करके बंद करें":"tap anywhere to dismiss"}
                </div>
              </div>
              {/* Sliding highlight beam — shows the pill row is scrollable */}
              <div style={{
                position:"absolute",top:0,bottom:0,width:60,
                background:"linear-gradient(90deg,transparent,rgba(255,153,51,0.18),transparent)",
                animation:"hint-beam-slide 1.4s cubic-bezier(0.4,0,0.2,1) 0.3s infinite",
                pointerEvents:"none",
              }}/>
            </div>
          )}
          <div
            ref={pillRowRef}
            style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:14,scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}
            onTouchStart={e=>e.stopPropagation()}
            onTouchMove={e=>e.stopPropagation()}
            onTouchEnd={e=>e.stopPropagation()}
          >
          <div onClick={()=>{haptic();setFilter("all");dismissHint();}}
            className="fpill"
            style={{
              background:filter==="all"?"linear-gradient(135deg,#002060,#003580)":th.pillBg,
              color:filter==="all"?"#fff":th.textMid,
              border:`1.5px solid ${filter==="all"?"transparent":th.border2}`,
              boxShadow:filter==="all"?"0 3px 14px rgba(0,53,128,0.32), inset 0 1px 0 rgba(255,255,255,0.12)":"0 1px 3px rgba(0,0,0,0.05)",
              fontFamily:bf,
            }}>
            {isHindi?"सभी":"All"} ({filtered.length})
          </div>
          {cats.map(cat=>{
            const active=filter===cat.filterKey;
            return(
            <div key={cat.filterKey} onClick={()=>{haptic();setFilter(cat.filterKey);dismissHint();}}
              className="fpill"
              style={{
                background:active?cat.color:th.pillBg,
                color:active?"#fff":th.textMid,
                border:`1.5px solid ${active?"transparent":th.border2}`,
                boxShadow:active?`0 3px 14px ${cat.color}44, inset 0 1px 0 rgba(255,255,255,0.14)`:"0 1px 3px rgba(0,0,0,0.05)",
                fontFamily:bf,
              }}>
              {cat.label}
            </div>
          );})}
          </div>{/* end pill row */}
        </div>{/* end pill row wrapper */}

        {/* Active state chip row */}
        {(selectedState!=="all"||dismissingState)&&(
          <div style={{display:"flex",alignItems:"center",gap:6,paddingBottom:10,flexWrap:"wrap"}}>
            {/* ── Premium state chip ── */}
            <div className={dismissingState?"state-chip-exit":"state-chip-enter"}
              style={{
                display:"flex",alignItems:"center",gap:6,
                background:`linear-gradient(135deg,${SAFFRON}20 0%,${SAFFRON}0d 100%)`,
                border:`1.5px solid ${SAFFRON}55`,
                borderRadius:50,
                padding:"4px 6px 4px 9px",
                boxShadow:`0 2px 14px ${SAFFRON}20,inset 0 1px 0 rgba(255,255,255,0.09)`,
              }}>
              {/* Location dot bubble */}
              <div style={{
                width:18,height:18,borderRadius:"50%",
                background:`${SAFFRON}22`,
                border:`1px solid ${SAFFRON}35`,
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,
              }}>
                <svg width="8" height="10" viewBox="0 0 10 12" fill={SAFFRON}>
                  <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z"/>
                </svg>
              </div>
              {/* State name */}
              <span style={{
                fontSize:12,fontWeight:700,color:SAFFRON,
                fontFamily:bf,letterSpacing:0.1,
                maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
              }}>{selectedState}</span>
              {/* Premium ✕ close button */}
              <div
                className="state-chip-close"
                onClick={handleClearState}
                style={{
                  width:20,height:20,borderRadius:"50%",
                  background:`${SAFFRON}22`,
                  border:`1px solid ${SAFFRON}30`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",flexShrink:0,
                  transition:"background 0.18s,transform 0.15s cubic-bezier(0.34,1.56,0.64,1),border-color 0.18s",
                }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke={SAFFRON} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div onClick={()=>{if(stateSchemes.length>0){haptic(30);scrollToRef(stateHeaderRef,"state");}}}
              style={{display:"flex",alignItems:"center",gap:4,
                background:scrollingTo==="state"?"#FEF08A":stateSchemes.length>0?"#FEF9C3":"#f5f5f0",
                border:`1.5px solid ${scrollingTo==="state"?"#ca8a04":stateSchemes.length>0?"#d97706":"#e0e0e0"}`,
                borderRadius:20,padding:"4px 10px",
                cursor:stateSchemes.length>0?"pointer":"default",
                opacity:stateSchemes.length>0?1:0.55,
                transform:scrollingTo==="state"?"scale(0.93)":"scale(1)",
                boxShadow:scrollingTo==="state"?"0 0 0 3px #fde04780":"none",
                transition:"background 0.15s,border-color 0.15s,transform 0.15s,box-shadow 0.15s"}}>
              <span style={{fontSize:11}}>📍</span>
              <span style={{fontSize:11,fontWeight:700,color:stateSchemes.length>0?"#92400e":"#999",fontFamily:bf}}>
                {isHindi?"राज्य":"State"} ({stateSchemes.length})
              </span>
              {scrollingTo==="state"
                ?<span style={{marginLeft:3,display:"inline-flex",alignItems:"center"}}><AshokaChakra size={11} color="#b45309" spinning={true}/></span>
                :stateSchemes.length>0&&<span style={{fontSize:9,color:"#b45309",marginLeft:1}}>↓</span>}
            </div>
            <div onClick={()=>{if(national.length>0){haptic(30);setScrollingTo("central");if(visibleNat.length>0){scrollToRef(centralHeaderRef,"central");}else{pendingScrollCentral.current=true;setVisibleCount(stateSchemes.length+PAGE_SIZE);}}}}
              style={{display:"flex",alignItems:"center",gap:4,
                background:scrollingTo==="central"?"#BFDBFE":"#EFF6FF",
                border:`1.5px solid ${scrollingTo==="central"?"#1d4ed8":"#3b82f6"}`,
                borderRadius:20,padding:"4px 10px",
                cursor:national.length>0?"pointer":"default",
                transform:scrollingTo==="central"?"scale(0.93)":"scale(1)",
                boxShadow:scrollingTo==="central"?"0 0 0 3px #93c5fd80":"none",
                transition:"background 0.15s,border-color 0.15s,transform 0.15s,box-shadow 0.15s"}}>
              <span style={{fontSize:11}}>🇮🇳</span>
              <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",fontFamily:bf}}>
                {isHindi?"केंद्रीय":"Central"} ({national.length})
              </span>
              {scrollingTo==="central"
                ?<span style={{marginLeft:3,display:"inline-flex",alignItems:"center"}}><AshokaChakra size={11} color="#1D4ED8" spinning={true}/></span>
                :national.length>0&&<span style={{fontSize:9,color:"#2563eb",marginLeft:1}}>↓</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── SCHEME LIST ── */}
      <div ref={scrollContainerRef} style={{padding:"12px 16px 80px",overflowY:"auto",flex:1}}>

        {/* ── Smart Verification Status ── */}
        {VERIFICATION_STATS.verified>0?(
          <div style={{
            display:"flex",alignItems:"center",gap:10,
            background:dark?"rgba(19,136,8,0.09)":"linear-gradient(135deg,rgba(22,163,74,0.10),rgba(74,222,128,0.04))",
            border:`1px solid ${dark?"rgba(19,136,8,0.22)":"rgba(19,136,8,0.22)"}`,
            borderRadius:12,padding:"9px 13px",marginBottom:14,boxShadow:dark?"none":"0 1px 8px rgba(19,136,8,0.07)",
          }}>
            <span style={{fontSize:15,flexShrink:0}}>🛡️</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:dark?"#4ade80":"#15803d",fontFamily:bf,lineHeight:1.3}}>
                {isHindi
                  ?`${VERIFICATION_STATS.pctLive}% लिंक सत्यापित और लाइव`
                  :`${VERIFICATION_STATS.pctLive}% links verified live`}
                {LAST_VERIFIED_LABEL&&(
                  <span style={{fontWeight:500,opacity:0.7}}>
                    {isHindi?` · जाँच: ${LAST_VERIFIED_LABEL}`:` · Checked ${LAST_VERIFIED_LABEL}`}
                  </span>
                )}
              </div>
              <div style={{fontSize:10,color:dark?"rgba(74,222,128,0.6)":"rgba(15,98,46,0.85)",marginTop:2,fontFamily:bf,lineHeight:1.4}}>
                {isHindi
                  ?"लिंक काम न करे तो कार्ड › खोलें — ~5% अगली जाँच से पहले बदल सकते हैं"
                  :"Tap › on a card for the official link · ~5% may change between checks"}
              </div>
            </div>
            <div style={{
              fontSize:8,fontWeight:800,letterSpacing:0.7,flexShrink:0,
              color:dark?"#4ade80":"#15803d",
              background:dark?"rgba(19,136,8,0.16)":"rgba(19,136,8,0.14)",
              border:`1px solid ${dark?"rgba(19,136,8,0.28)":"rgba(19,136,8,0.30)"}`,
              borderRadius:20,padding:"3px 9px",textTransform:"uppercase",
            }}>
              {isHindi?"सत्यापित":"AI VERIFIED"}
            </div>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"flex-start",gap:8,background:dark?"rgba(255,153,51,0.08)":"#FFFBEB",borderRadius:12,padding:"9px 12px",marginBottom:14,border:`1px solid ${dark?"rgba(255,153,51,0.18)":"#FDE68A"}`}}>
            <span style={{fontSize:13,flexShrink:0,marginTop:1}}>💡</span>
            <span style={{fontSize:11,color:dark?"#fbbf24":"#92400e",lineHeight:1.5,fontFamily:bf}}>
              {isHindi?"कुछ योजना लिंक काम नहीं कर सकते। सटीक जानकारी के लिए योजना का नाम Google पर खोजें।":"Some scheme links may not work. Search the scheme name on Google for the latest info."}
            </span>
          </div>
        )}

        {/* Skeleton shimmer cards */}
        {skeletonCount>0&&Array.from({length:skeletonCount}).map((_,i)=>(
          <SkeletonCard key={`sk-${i}`} dark={dark}/>
        ))}

        {/* Real cards — fade in once ready */}
        <div style={{
          opacity:isReady&&!isStale?1:0,
          transition:"opacity 0.2s ease",
          pointerEvents:isStale?"none":"auto",
        }}>

          {/* STATE SCHEMES */}
          {visibleState.length>0&&(
            <>
              <div ref={stateHeaderRef} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{height:1,flex:1,background:th.border2}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#92400e",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #d97706"}}>
                  📍 {t.stateSchemes} ({stateSchemes.length})
                </span>
                <div style={{height:1,flex:1,background:th.border2}}/>
              </div>
              {visibleState.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}
                  onOpenDetail={onOpenDetail}/>
              ))}
            </>
          )}

          {/* CENTRAL SCHEMES */}
          {visibleNat.length>0&&(
            <>
              <div ref={centralHeaderRef} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,marginTop:visibleState.length>0?16:0}}>
                <div style={{height:1,flex:1,background:th.border2}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #3b82f6"}}>
                  🇮🇳 {t.centralSchemes} ({national.length})
                </span>
                <div style={{height:1,flex:1,background:th.border2}}/>
              </div>
              {visibleNat.map(s=>(
                <SchemeCard key={s.id} scheme={s} lang={lang} dark={dark}
                  expanded={expandedId===s.id}
                  onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)}
                  onOpenDetail={onOpenDetail}/>
              ))}
            </>
          )}

          {/* Auto-load-more sentinel */}
          {hasMore&&(
            <div ref={loadMoreRef} style={{padding:"18px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <AshokaChakra size={15} color={SAFFRON} spinning={true}/>
                <span style={{fontSize:12,color:th.textSub,fontFamily:bf}}>
                  {isHindi?"और योजनाएं लोड हो रही हैं...":"Loading more schemes..."}
                </span>
              </div>
              <span style={{fontSize:11,color:th.textLight,fontFamily:bf}}>
                {isHindi
                  ?`${totalVisible} / ${filtered.length} दिखाई जा रही हैं`
                  :`Showing ${totalVisible} of ${filtered.length}`}
              </span>
            </div>
          )}

          {/* Empty state */}
          {filtered.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:"#aaa"}}>
              <div style={{fontSize:44,marginBottom:12}}>🔍</div>
              <div style={{fontSize:14,fontWeight:600,fontFamily:bf,color:th.text}}>{t.noMatchTitle}</div>
              <div style={{fontSize:12,color:th.textSub,marginTop:6,fontFamily:bf}}>{t.noMatchSub}</div>
            </div>
          )}

        </div>
      </div>

      {/* State picker */}
      {showStatePicker&&(
        <StatePickerSheet
          selectedState={selectedState}
          onSelect={handleStateSelect}
          onClose={()=>setShowStatePicker(false)}
          lang={lang}
          dark={dark}
        />
      )}
    </div>
  );
}

// ─── NEAR-MISS UTILITY ────────────────────────────────────────────────────────
// For each unmatched scheme, figure out which criteria the user is failing.
// Strategy: try every single-field substitution; if the scheme matches with that
// substitution, that field was a barrier. Collect all barriers found.
// Returns array of unique human-readable reason strings.
const WHO_VALUES    = ["farmer","student","women","senior","business","general"];
const INCOME_VALUES = ["below1","1to3","3to6","above6"];
const CASTE_RESERVED = ["obc","sc","st","ews"];

function getMissingCriteria(scheme, answers, lang){
  const criteria = T[lang].nearMissCriteria;
  const reasons  = [];

  // Helper: does the scheme match when we override one field?
  const matchWith = (overrides) => {
    try{ return scheme.match({...answers,...overrides}); }catch{ return false; }
  };

  // 1. who — find the first alternate "who" value that unlocks the scheme
  const passingWho = WHO_VALUES.find(v => v !== answers.who && matchWith({who:v}));
  if(passingWho){
    const key = `who_${passingWho}`;
    if(criteria[key]) reasons.push(criteria[key]);
  }

  // 2. income — check if any lower income bracket unlocks the scheme
  const myIncomeIdx = INCOME_VALUES.indexOf(answers.income);
  if(myIncomeIdx > 0){
    const lowerUnlocks = INCOME_VALUES.slice(0, myIncomeIdx).some(v => matchWith({income:v}));
    if(lowerUnlocks) reasons.push(criteria.income_lower);
  }

  // 3. house — if user owns pucca house, check if not owning one unlocks the scheme
  if(answers.house === "yes"){
    if(matchWith({house:"no"}) || matchWith({house:"kutcha"})){
      reasons.push(criteria.house_no);
    }
  }

  // 4. area — check if switching area type unlocks the scheme
  if(answers.area !== "rural" && matchWith({area:"rural"}))
    reasons.push(criteria.area_rural);
  if(answers.area === "rural" && (matchWith({area:"urban"}) || matchWith({area:"semi"})))
    reasons.push(criteria.area_urban);

  // 5. age — check if a different age bracket unlocks the scheme
  if(answers.age !== "above60" && matchWith({age:"above60"})) reasons.push(criteria.age_above60);
  if(answers.age !== "18to35"  && matchWith({age:"18to35"}))  reasons.push(criteria.age_18to35);
  if(answers.age !== "below18" && matchWith({age:"below18"})) reasons.push(criteria.age_below18);

  // 6. caste — if user is General, check if a reserved category would unlock the scheme
  if(answers.caste === "general" || !answers.caste){
    const reservedUnlocks = CASTE_RESERVED.some(v => matchWith({caste:v}));
    if(reservedUnlocks) reasons.push(criteria.caste_reserved);
  }

  // Deduplicate (a single substitution could push the same label twice in theory)
  return [...new Set(reasons)];
}

function getNearMissSchemes(answers, matchedIds, lang){
  // Only look at schemes that weren't matched and have scope matching user state
  const unmatched = SCHEME_DB.filter(s=>{
    if(matchedIds.has(s.id)) return false;
    if(s.scope==="state"&&s.state!==answers.state) return false; // different state schemes aren't near-miss
    return true;
  });

  const result = [];
  for(const scheme of unmatched){
    const reasons = getMissingCriteria(scheme, answers, lang);
    // Only surface schemes where 1–2 clear reasons explain the miss
    if(reasons.length>=1&&reasons.length<=2){
      result.push({scheme, reasons});
    }
    if(result.length>=5) break; // cap at 5 near-miss cards
  }
  return result;
}

// ─── SHOW-MORE / SHOW-LESS TOGGLE ──────────────────────────────────────────────
// Reusable pill used in every collapsible results section.
// hiddenCount  — number of items not yet visible
// moreText     — label when collapsed  e.g. "more schemes"
// lessText     — label when expanded   e.g. "Show less"
function ShowMoreBtn({ expanded, hiddenCount, moreText, lessText, onToggle, dark, th, bf }) {
  return (
    <div
      onClick={onToggle}
      onTouchStart={e=>{ e.currentTarget.style.opacity="0.65"; }}
      onTouchEnd={e=>{ e.currentTarget.style.opacity="1"; }}
      onMouseEnter={e=>{ e.currentTarget.style.opacity="0.82"; }}
      onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; }}
      style={{
        display:"flex",alignItems:"center",justifyContent:"center",gap:9,
        margin:"4px 0 14px",padding:"13px 20px",
        borderRadius:14,
        background: dark
          ? "linear-gradient(135deg,rgba(255,122,0,0.10),rgba(255,122,0,0.04))"
          : "linear-gradient(135deg,#FFF7ED,#FFFBF7)",
        border:`1.5px solid ${dark?"rgba(255,122,0,0.28)":"rgba(255,153,51,0.35)"}`,
        cursor:"pointer",WebkitTapHighlightColor:"transparent",
        userSelect:"none",transition:"opacity 0.16s",
        boxShadow: dark?"none":"0 2px 10px rgba(255,153,51,0.09)",
      }}>
      {expanded ? (
        <>
          <span style={{
            fontSize:10,fontWeight:800,lineHeight:1,
            color:dark?"#FF9933":"#CC6600",
            transform:"rotate(180deg)",display:"inline-block",
          }}>▼</span>
          <span style={{fontSize:13,fontWeight:700,color:dark?"#FF9933":"#CC6600",fontFamily:bf}}>
            {lessText}
          </span>
        </>
      ) : (
        <>
          <span style={{
            background:"linear-gradient(135deg,#FF9933,#FF8C00)",
            color:"#fff",fontSize:11,fontWeight:800,
            borderRadius:20,padding:"2px 10px",
            boxShadow:"0 2px 7px rgba(255,153,51,0.35)",
            minWidth:22,textAlign:"center",display:"inline-block",
            letterSpacing:0.2,
          }}>+{hiddenCount}</span>
          <span style={{fontSize:13,fontWeight:700,color:dark?"#FF9933":"#CC6600",fontFamily:bf}}>
            {moreText}
          </span>
          <span style={{fontSize:10,fontWeight:800,color:dark?"rgba(255,153,51,0.55)":"rgba(204,102,0,0.50)",lineHeight:1}}>▼</span>
        </>
      )}
    </div>
  );
}

// ─── ELIGIBILITY CHECKER ───────────────────────────────────────────────────────
function EligibilityChecker({lang,onClose,onComplete,onExitFromResults,prefilledAnswers,dark=false,onOpenDetail=null}){
  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);

  // ── Adaptive queue builder ────────────────────────────────────────────────
  // Builds the live question list from base questions + conditional inserts.
  // Conditional rules (Feature 2 from screenshot):
  //   who === "farmer"  → inject landHolding after income
  //   who === "student" → inject educationLevel after income
  //   income === "below1" → inject rationCard after income (or after landHolding/educationLevel)
  const buildQueue=useCallback((ans)=>{
    const aq=t.adaptiveQuestions;
    const base=[...t.questions]; // [who, income, state, house, age, area]
    const extra=[];
    if(ans.who==="farmer")  extra.push(aq.landHolding);
    if(ans.who==="student") extra.push(aq.educationLevel);
    if(ans.income==="below1") extra.push(aq.rationCard);
    // Insert extras after the "income" question (index 1)
    const incomeIdx=base.findIndex(q=>q.id==="income");
    base.splice(incomeIdx+1,0,...extra);
    return base;
  },[t]);

  // Filter SCHEME_DB using match() functions — single source of truth
  const initResults=useCallback((ans)=>SCHEME_DB.filter(s=>s.match(ans)),[]);

  const [answers,setAnswers]=useState(()=>{
    if(prefilledAnswers) return prefilledAnswers;
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(!saved) return {};
      if(saved.answers && typeof saved.step==="number") return saved.answers;
      return saved;
    }catch{return {};}
  });

  // Queue is derived from answers — recomputed whenever answers change
  const queue=useMemo(()=>buildQueue(answers),[answers,buildQueue]);
  const TOTAL=queue.length;

  const [step,setStep]=useState(()=>{
    if(prefilledAnswers){
      const fullQueue=buildQueue(prefilledAnswers);
      // Find first question that doesn't have a pre-filled answer
      const firstMissing=fullQueue.findIndex(q=>{
        const val=q.type==="state"?prefilledAnswers.state:prefilledAnswers[q.id];
        return !val;
      });
      // All answered → jump straight to results; else start at first gap
      return firstMissing===-1?fullQueue.length:firstMissing;
    }
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(!saved) return 0;
      if(saved.answers && typeof saved.step==="number"){
        // Clamp saved step to new queue length (answers may have changed)
        const q=buildQueue(saved.answers);
        return Math.min(saved.step, q.length);
      }
      return buildQueue(saved).length;
    }catch{return 0;}
  });

  const [selected,setSelected]=useState(null);
  const [stateSearch,setStateSearch]=useState(prefilledAnswers?.state||"");
  const [visible,setVisible]=useState(false);
  const [animKey,setAnimKey]=useState(0);
  const [direction,setDirection]=useState("fwd"); // "fwd" | "bwd"
  const [lockedAnswer,setLockedAnswer]=useState(null); // tracks the answer currently in the 400ms lock-in window
  const autoAdvanceTimerRef=useRef(null); // holds the setTimeout id so we can cancel it
  const [displayCount,setDisplayCount]=useState(0); // visually-animated value of partialCount
  const animCountRaf=useRef(null);  // rAF handle for the count-up tween
  const prevCountRef=useRef(0);     // last committed count, so tween starts from it
  const [expandedId,setExpandedId]=useState(null);
  const [showEstimateInfo,setShowEstimateInfo]=useState(false); // "What These Numbers Mean" disclaimer expand/collapse

  const [results,setResults]=useState(()=>{
    if(prefilledAnswers) return SCHEME_DB.filter(s=>s.match(prefilledAnswers));
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(!saved) return [];
      const isNew=saved.answers && typeof saved.step==="number";
      const ans=isNew?saved.answers:saved;
      const builtQ=buildQueue(ans);
      const savedStep=isNew?saved.step:builtQ.length;
      return savedStep===builtQ.length?SCHEME_DB.filter(s=>s.match(ans)):[];
    }catch{return [];}
  });

  useEffect(()=>{const id=setTimeout(()=>setVisible(true),30);return()=>clearTimeout(id);},[]);

  const q=step<TOTAL?queue[step]:null;
  const isStateQ=q?.type==="state";
  const activeVal=isStateQ?(stateSearch&&INDIA_STATES.includes(stateSearch)?stateSearch:null):(selected||(q?answers[q.id]:null));
  const canProceed=!!activeVal;

  // ── Live scheme counter ───────────────────────────────────────────────────
  // Counts how many schemes match answers-so-far + current selection.
  // Runs on every render but match() is pure boolean — fast enough on 150 schemes.
  let partialCount = null;
  if(step < TOTAL && q && activeVal){
    const partial = {...answers, [q.id]: activeVal};
    let c = 0;
    for(const s of SCHEME_DB){
      try{ if(s.match(partial)) c++; }catch{}
    }
    partialCount = c;
  }
  const progress=step>=TOTAL?100:Math.round(((step+1)/TOTAL)*100);
  // How many questions were already answered from the profile prefill
  const prefillCount=useMemo(()=>{
    if(!prefilledAnswers)return 0;
    return queue.filter(q=>{
      const val=q.type==="state"?prefilledAnswers.state:prefilledAnswers[q.id];
      return !!val;
    }).length;
  },[queue,prefilledAnswers]);
  const filteredStates=useMemo(()=>INDIA_STATES.filter(s=>s.toLowerCase().includes(stateSearch.toLowerCase())),[stateSearch]);
  const totalAnnual=useMemo(()=>results.reduce((s,r)=>s+(r.annual||0),0),[results]);
  const nationalResults=useMemo(()=>results.filter(r=>r.scope==="national").sort((a,b)=>(b.annual||0)-(a.annual||0)),[results]);
  const stateResults=useMemo(()=>results.filter(r=>r.scope==="state").sort((a,b)=>(b.annual||0)-(a.annual||0)),[results]);
  const matchedIds=useMemo(()=>new Set(results.map(r=>r.id)),[results]);
  const nearMiss=useMemo(()=>step===TOTAL?getNearMissSchemes(answers,matchedIds,lang):[],[step,TOTAL,answers,matchedIds,lang]);

  const goNext=(valOverride=null)=>{
    const useVal=valOverride!==null?valOverride:activeVal;
    if(!useVal)return;
    const newAnswers={...answers,[q.id]:useVal};
    // Recompute queue with the freshly updated answers so conditional
    // questions are injected before we decide if this is the last step
    const newQueue=buildQueue(newAnswers);
    const newTotal=newQueue.length;
    const nextStep=step===newTotal-1?newTotal:step+1;
    setAnswers(newAnswers);setSelected(null);setDirection("fwd");setAnimKey(k=>k+1);
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({answers:newAnswers,step:nextStep}));}catch{}
    if(step===newTotal-1){
      const matched=initResults(newAnswers);
      setResults(matched);
      onComplete?.(newAnswers); // notify parent so BenefitCalculatorCard reflects fresh results
      setCalculating(true);
      setCalcPhase(0);
      setCalcCount(0);

      // Phase 0 → Scanning (900ms)
      setTimeout(()=>{
        setCalcPhase(1); // icons fly-in phase
        // Phase 1 → Matching (750ms — icons settle)
        setTimeout(()=>{
          setCalcPhase(2); // counter phase
          const matchedTotal=matched.length;
          if(matchedTotal===0){
            setTimeout(()=>{ setCalculating(false); setStep(newTotal); },700);
            return;
          }
          const dur=1100;
          const startT=performance.now();
          const tick=(now)=>{
            const p=Math.min((now-startT)/dur,1);
            const ease=1-Math.pow(1-p,3); // cubic ease-out
            setCalcCount(Math.floor(ease*matchedTotal));
            if(p<1){ requestAnimationFrame(tick); }
            else{
              setCalcCount(matchedTotal);
              // Linger on final number, then reveal results
              setTimeout(()=>{ setCalculating(false); setStep(newTotal); },750);
            }
          };
          requestAnimationFrame(tick);
        },750);
      },900);
    }
    else setStep(nextStep);
  };
  const goBack=()=>{
    if(step===0){onClose();return;}
    if(step===TOTAL){setDirection("bwd");setAnimKey(k=>k+1);setStep(TOTAL-1);return;}
    const prevQ=queue[step-1];
    if(prevQ.type==="state")setStateSearch(answers[prevQ.id]||"");
    else setSelected(answers[prevQ.id]||null);
    setAnimKey(k=>k+1);setDirection("bwd");setStep(s=>s-1);
  };
  // ── Auto-advance cleanup: cancel pending timer when step changes ──────────
  useEffect(()=>{
    return ()=>{
      if(autoAdvanceTimerRef.current){
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current=null;
      }
      setLockedAnswer(null);
    };
  },[step]);
  // ── Animated scheme counter: tween displayCount from prev → partialCount ──
  useEffect(()=>{
    if(partialCount===null){
      if(animCountRaf.current) cancelAnimationFrame(animCountRaf.current);
      prevCountRef.current=0;
      setDisplayCount(0);
      return;
    }
    const from=prevCountRef.current;
    const to=partialCount;
    prevCountRef.current=to;
    if(animCountRaf.current) cancelAnimationFrame(animCountRaf.current);
    const dur=450;
    const startT=performance.now();
    const tick=(now)=>{
      const p=Math.min((now-startT)/dur,1);
      const ease=1-Math.pow(1-p,3); // cubic ease-out
      setDisplayCount(Math.round(from+(to-from)*ease));
      if(p<1) animCountRaf.current=requestAnimationFrame(tick);
      else animCountRaf.current=null;
    };
    animCountRaf.current=requestAnimationFrame(tick);
    return()=>{ if(animCountRaf.current) cancelAnimationFrame(animCountRaf.current); };
  },[partialCount]);
  // ── AI Results Brief ──────────────────────────────────────────────────────
  // Initialise from cache so the brief is visible immediately when the checker
  // re-opens (no API call needed for the same set of answers).
  const [brief, setBrief] = useState(()=>{
    try{
      const saved   = JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(!saved) return null;
      const savedAns = (saved.answers && typeof saved.step==="number") ? saved.answers : saved;
      const cached   = JSON.parse(localStorage.getItem(BRIEF_CACHE_KEY)||"null");
      if(cached?.brief && cached.answersKey===answerFingerprint(savedAns)) return cached.brief;
    }catch{}
    return null;
  });
  const [briefLoading, setBriefLoading] = useState(false);
  // ── Calculating screen state ──────────────────────────────────────────────
  const [calculating, setCalculating] = useState(false);
  const [calcCount,   setCalcCount]   = useState(0);
  // 0=scanning  1=icons-fly-in  2=counter-matched
  const [calcPhase,   setCalcPhase]   = useState(0);
  // ── Celebration (confetti + benefit count-up) ─────────────────────────────
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedBenefit, setAnimatedBenefit] = useState(0);
  const celebrationRafRef  = useRef(null);
  const prevCalculatingRef = useRef(false);

  // ── Page-reload fix: results pre-loaded from localStorage, no calculating transition fires ──
  // animatedBenefit stays 0 on reload even though totalAnnual is correct.
  // Set it immediately on mount when results are already present.
  useEffect(()=>{
    if(totalAnnual>0) setAnimatedBenefit(totalAnnual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // ── Celebration: fires once when `calculating` transitions true → false with matches ──
  // NOTE: placed here so all deps (calculating, results, totalAnnual, celebrationRafRef,
  // setShowCelebration, setAnimatedBenefit, prevCalculatingRef) are already declared above.
  useEffect(()=>{
    const wasCalculating=prevCalculatingRef.current;
    prevCalculatingRef.current=calculating;
    if(wasCalculating && !calculating && results.length>0){
      setShowCelebration(true);
      if(totalAnnual>0){
        setAnimatedBenefit(0);
        const dur=1800;
        const startT=performance.now();
        const tick=(now)=>{
          const p=Math.min((now-startT)/dur,1);
          const ease=1-Math.pow(1-p,3);
          setAnimatedBenefit(Math.floor(ease*totalAnnual));
          if(p<1){ celebrationRafRef.current=requestAnimationFrame(tick); }
          else{ setAnimatedBenefit(totalAnnual); celebrationRafRef.current=null; }
        };
        celebrationRafRef.current=requestAnimationFrame(tick);
      }
      const dismissTimer=setTimeout(()=>setShowCelebration(false),3000);
      return()=>{
        clearTimeout(dismissTimer);
        if(celebrationRafRef.current){ cancelAnimationFrame(celebrationRafRef.current); celebrationRafRef.current=null; }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[calculating]);

  // ── Collapsible results — constants & state ───────────────────────────────
  // PREVIEW_COUNT : scheme cards visible before "Show more" in each section.
  // NM_PREVIEW    : near-miss cards visible before "Show more".
  // These are intentionally small so Near-Miss and Retake/Done stay reachable
  // without scrolling, even when there are thousands of schemes.
  const PREVIEW_COUNT = 4;
  const NM_PREVIEW    = 3;
  const [showAllState,   setShowAllState]   = useState(false);
  const [showAllNational,setShowAllNational] = useState(false);
  const [showAllNearMiss,setShowAllNearMiss] = useState(false);

  useEffect(()=>{
    if(step !== TOTAL || results.length === 0) return;
    let cancelled = false;
    // ── Sync matched count back to Firestore so Profile "Schemes" stat stays accurate ──
    const uid=auth.currentUser?.uid;
    if(uid){
      try{
        updateDoc(doc(db,"users",uid),{matchedCount:results.length,lastChecked:serverTimestamp()})
          .catch(()=>{}); // silent — non-critical
      }catch{}
    }
    // ── Log checker run to appStats/usage for admin analytics ──
    try{
      const runRecord={
        uid:uid||"anon",
        matchedCount:results.length,
        state:answers.state||null,
        who:answers.who||null,
        income:answers.income||null,
        age:answers.age||null,
        area:answers.area||null,
        gender:answers.gender||null,
        ration:answers.ration||null,
        ts:new Date().toISOString(),
      };
      setDoc(doc(db,"appStats","usage"),{
        checkerRuns:arrayUnion(runRecord),
        checkerTotal:increment(1),
        lastRun:new Date().toISOString(),
      },{merge:true}).catch(()=>{});
    }catch{}
    // ── Cache check — skip API if we already have a brief for these exact answers ──
    try{
      const cached = JSON.parse(localStorage.getItem(BRIEF_CACHE_KEY)||"null");
      if(cached?.brief && cached.answersKey===answerFingerprint(answers)){
        setBrief(cached.brief);   // restore silently — no loading state, no API call
        return;
      }
    }catch{}
    // No cache hit → call the AI
    setBrief(null);
    setBriefLoading(true);
    generateResultsBrief(answers, [...results].sort((a,b)=>(b.annual||0)-(a.annual||0)), nearMiss, totalAnnual, lang)
      .then(text => {
        if(!cancelled){
          setBrief(text);
          setBriefLoading(false);
          // Persist so next open reuses this result without another API call
          try{
            localStorage.setItem(BRIEF_CACHE_KEY, JSON.stringify({
              answersKey: answerFingerprint(answers),
              brief: text,
            }));
          }catch{}
        }
      })
      .catch(()  => { if(!cancelled){ setBriefLoading(false); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[step, TOTAL]);

  const retake=()=>{
    try{localStorage.removeItem(STORAGE_KEY);}catch{}
    try{localStorage.removeItem(BRIEF_CACHE_KEY);}catch{}  // clear cached brief so retake always gets a fresh AI message
    // Always reset to step 0 with blank answers so the user can retake freely.
    // prefilledAnswers is only used for the initial open — not for retake.
    setStep(0);setAnswers({});setStateSearch("");
    setResults([]);
    setSelected(null);setExpandedId(null);setAnimKey(k=>k+1);setBrief(null);setBriefLoading(false);
    // Collapse all sections so fresh results always start tidy
    setShowAllState(false);setShowAllNational(false);setShowAllNearMiss(false);
  };

  return(
    <div onClick={e=>{if(e.target===e.currentTarget){onClose();}}}
      style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"flex-end",opacity:visible?1:0,transition:"opacity 0.25s"}}>
      <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:th.appBg,borderRadius:"24px 24px 0 0",maxHeight:"93vh",overflowY:"auto",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.35s cubic-bezier(0.32,0.72,0,1)",fontFamily:bf}}>

        {/* Sheet top — Premium Tricolor Stepper */}
        {/* Tricolor top stripe */}
        <div style={{display:"flex",height:5,borderRadius:"24px 24px 0 0",overflow:"hidden"}}>
          <div style={{flex:1,background:SAFFRON}}/>
          <div style={{flex:1,background:"#fff",borderLeft:"1px solid #f0e8dc",borderRight:"1px solid #dde8dd"}}/>
          <div style={{flex:1,background:IND_GREEN}}/>
        </div>
        <div style={{background:th.card,padding:"12px 20px 16px",position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${th.border}`}}>
          {/* Drag handle */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
            <div style={{width:38,height:3.5,background:th.handle2,borderRadius:2}}/>
          </div>
          {/* Title row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${NAVY_BLUE},${ASHOKA_BLUE})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 3px 12px rgba(6,3,141,0.28)`,flexShrink:0}}>
                <AshokaChakra size={22} color="#fff" spinning={step<TOTAL}/>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:th.text,letterSpacing:-0.2,lineHeight:1,fontFamily:bf}}>{t.checkerTitle}</div>
                <div style={{fontSize:10,fontWeight:700,marginTop:3,letterSpacing:0.25,fontFamily:bf,color:step<TOTAL?SAFFRON:IND_GREEN}}>
                  {step<TOTAL?`${q?.icon}  ${q?.q}`:`✅  ${t.checkerSub}`}
                </div>
              </div>
            </div>
            <div onClick={()=>{if(step===TOTAL){onExitFromResults?.(!!prefilledAnswers&&!Object.keys(answers).some(k=>answers[k]!==prefilledAnswers[k]));}onClose();}} style={{width:30,height:30,borderRadius:"50%",background:th.pillBg,border:`1.5px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:th.textSub,fontWeight:700}}>✕</div>
          </div>
          {/* Premium numbered stepper — replaces both old bars */}
          {step<TOTAL&&(
            <>
              <div style={{display:"flex",alignItems:"center"}}>
                {queue.map((_,i)=>{
                  const done=i<step,active=i===step;
                  // Mark adaptive questions with a subtle accent
                  const isAdaptive=!t.questions.find(bq=>bq.id===queue[i].id);
                  return [
                    <div key={`dot-${i}`} style={{width:32,height:32,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:done?IND_GREEN:active?SAFFRON:isAdaptive?"#FFF7ED":"#fff",border:`2.5px solid ${done?IND_GREEN:active?SAFFRON:isAdaptive?"#FF9933":"#ddd"}`,boxShadow:active?`0 0 0 5px ${SAFFRON}22,0 2px 10px ${SAFFRON}44`:done?`0 0 0 3px ${IND_GREEN}18`:"none",transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",zIndex:1,position:"relative"}}>
                      {done
                        ?<span style={{color:"#fff",fontSize:14,fontWeight:900}}>✓</span>
                        :active
                          ?<AshokaChakra size={16} color="#fff" spinning={true}/>
                          :<span style={{color:isAdaptive?"#FF9933":"#ccc",fontSize:11,fontWeight:800}}>{i+1}</span>
                      }
                    </div>,
                    i<queue.length-1&&(
                      <div key={`line-${i}`} style={{flex:1,height:3,borderRadius:3,background:"#ebebeb",position:"relative",overflow:"hidden"}}>
                        {i<step&&<div style={{position:"absolute",inset:0,borderRadius:3,background:`linear-gradient(90deg,${SAFFRON},${IND_GREEN})`}}/>}
                      </div>
                    ),
                  ];
                })}
              </div>
              {/* Step label row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7,paddingLeft:3,paddingRight:3}}>
                <span style={{fontSize:9.5,fontWeight:700,color:ASHOKA_BLUE,letterSpacing:0.4,fontFamily:bf}}>
                  {isHindi?`चरण ${step+1} / ${TOTAL}`:`STEP ${step+1} OF ${TOTAL}`}
                </span>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {q&&!t.questions.find(bq=>bq.id===q.id)&&(
                    <span style={{fontSize:8.5,fontWeight:700,color:"#CC6600",background:"#FFF7ED",borderRadius:20,padding:"2px 7px",border:"1px solid #FFD8A8",letterSpacing:0.3}}>
                      {isHindi?"अतिरिक्त":"+ Smart"}
                    </span>
                  )}
                  <span style={{fontSize:9.5,fontWeight:600,color:"#aaa",fontFamily:bf}}>{q?.hint}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{marginTop:8,height:3,borderRadius:99,background:dark?"#2c2c2e":"#ebebeb",overflow:"hidden"}}>
                <div style={{
                  height:"100%",borderRadius:99,
                  width:`${progress}%`,
                  background:`linear-gradient(90deg,${SAFFRON},${IND_GREEN})`,
                  transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)",
                }}/>
              </div>
            </>
          )}
        </div>

        {/* ── CALCULATING REVEAL SCREEN (full-screen theatrical) ── */}
        {calculating&&(
          <div style={{
            position:"fixed",inset:0,zIndex:9999,
            background:"linear-gradient(160deg,#03031a 0%,#06038D 55%,#03031a 100%)",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            animation:"reveal-overlay-in 0.4s ease forwards",
            overflow:"hidden",
          }}>
            {/* Dot-grid background */}
            <div style={{
              position:"absolute",inset:0,
              backgroundImage:"radial-gradient(rgba(255,255,255,0.55) 1px,transparent 1px)",
              backgroundSize:"34px 34px",
              animation:"reveal-bg-pulse 3s ease-in-out infinite",
              pointerEvents:"none",
            }}/>
            {/* Central glow orb */}
            <div style={{
              position:"absolute",width:320,height:320,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(6,3,141,0.55) 0%,transparent 70%)",
              pointerEvents:"none",
            }}/>

            {/* ── Phase 0: Scanning ── */}
            {calcPhase===0&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:22,animation:"reveal-overlay-in 0.45s ease"}}>
                <div style={{animation:"chakra-spin 0.9s linear infinite",filter:"drop-shadow(0 0 22px rgba(255,153,51,0.65)) drop-shadow(0 0 45px rgba(6,3,141,0.9))"}}>
                  <AshokaChakra size={112} color={SAFFRON} spinning={false}/>
                </div>
                <div>
                  <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:bf,letterSpacing:-0.3,marginBottom:7}}>
                    {isHindi?"योजनाएं स्कैन हो रही हैं…":"Scanning schemes…"}
                  </div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.48)",fontFamily:bf}}>
                    {isHindi?`${SCHEME_DB.length} सरकारी योजनाएं जाँच रहे हैं`:`Checking ${SCHEME_DB.length} government schemes`}
                  </div>
                </div>
              </div>
            )}

            {/* ── Phase 1: Icons flying in ── */}
            {calcPhase===1&&(
              <div style={{position:"relative",width:300,height:260,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {/* Center chakra */}
                <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                  <div style={{animation:"chakra-spin 0.8s linear infinite",filter:"drop-shadow(0 0 18px rgba(255,153,51,0.7)) drop-shadow(0 0 36px rgba(6,3,141,1))"}}>
                    <AshokaChakra size={74} color={SAFFRON} spinning={false}/>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.65)",fontFamily:bf,letterSpacing:0.2}}>
                    {isHindi?"आपकी प्रोफाइल से मिलान…":"Matching to your profile…"}
                  </div>
                </div>
                {/* Flying scheme icons */}
                {REVEAL_ICONS.map((ic,idx)=>(
                  <div key={idx} style={{
                    position:"absolute",left:ic.x,top:ic.y,
                    fontSize:30,lineHeight:1,zIndex:1,
                    animation:`${ic.anim} 0.55s ${ic.delay} cubic-bezier(0.22,1,0.36,1) both`,
                    filter:"drop-shadow(0 3px 10px rgba(0,0,0,0.55))",
                  }}>
                    {ic.icon}
                  </div>
                ))}
              </div>
            )}

            {/* ── Phase 2: Big matched counter ── */}
            {calcPhase===2&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",animation:"reveal-count-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) both"}}>
                <div style={{
                  fontSize:100,fontWeight:900,lineHeight:1,
                  fontFamily:bf,letterSpacing:-5,
                  color:SAFFRON,
                  textShadow:"0 0 40px rgba(255,153,51,0.6),0 0 80px rgba(255,153,51,0.3)",
                  animation:"reveal-found-glow 1.5s ease-in-out infinite",
                }}>
                  {calcCount}
                </div>
                <div style={{fontSize:18,fontWeight:700,color:"#fff",fontFamily:bf,marginTop:6,letterSpacing:0.2}}>
                  {isHindi?"योजनाएं मिलीं आपके लिए 🎯":"schemes found for you 🎯"}
                </div>
                {/* Tricolor bar */}
                <div style={{display:"flex",margin:"18px auto 0",width:76,height:4,borderRadius:99,overflow:"hidden"}}>
                  <div style={{flex:1,background:SAFFRON}}/>
                  <div style={{flex:1,background:"rgba(255,255,255,0.9)"}}/>
                  <div style={{flex:1,background:IND_GREEN}}/>
                </div>
              </div>
            )}

            {/* Phase progress dots */}
            <div style={{position:"absolute",bottom:54,display:"flex",gap:7,alignItems:"center"}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{
                  width:i===calcPhase?26:7,height:7,borderRadius:99,
                  background:i<=calcPhase?SAFFRON:"rgba(255,255,255,0.18)",
                  transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow:i===calcPhase?`0 0 12px ${SAFFRON}`:"none",
                }}/>
              ))}
            </div>
          </div>
        )}

        {/* ── Profile Pre-fill Banner ── */}
        {prefillCount>0&&step<TOTAL&&(
          <div style={{
            margin:"0 20px 0",
            display:"flex",alignItems:"center",gap:9,
            background:dark?"rgba(19,136,8,0.12)":"rgba(19,136,8,0.07)",
            border:`1.5px solid ${dark?"rgba(19,136,8,0.35)":"rgba(19,136,8,0.22)"}`,
            borderRadius:14,padding:"10px 14px",
          }}>
            <span style={{fontSize:18,flexShrink:0}}>🧠</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:800,color:IND_GREEN,fontFamily:bf,lineHeight:1.3}}>
                {isHindi
                  ?`${prefillCount} जवाब प्रोफाइल से भरे गए ✓`
                  :`${prefillCount} of ${TOTAL} answers pre-filled from your profile ✓`}
              </div>
              <div style={{fontSize:10.5,color:th.textSub,marginTop:2,fontFamily:bf}}>
                {isHindi
                  ?`सिर्फ ${TOTAL-step} सवाल बचे हैं`
                  :`Just ${TOTAL-step} question${TOTAL-step!==1?"s":""} remaining`}
              </div>
            </div>
          </div>
        )}

        {/* Question step */}
        {step<TOTAL&&q&&(
          <div key={animKey} style={{padding:"20px 20px 32px",animation:`${direction==="fwd"?"q-enter-fwd":"q-enter-bwd"} 0.32s cubic-bezier(0.25,1,0.5,1) both`}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:42,marginBottom:10}}>{q.icon}</div>
              <div style={{fontSize:17,fontWeight:800,color:th.text,lineHeight:1.3,fontFamily:bf}}>{q.q}</div>
              <div style={{fontSize:12,color:th.textLight,marginTop:5}}>{q.hint}</div>
            </div>

            {/* ── Live Scheme Counter ── */}
            {partialCount !== null && (
              <div style={{display:"flex",justifyContent:"center",marginBottom:14,marginTop:-8}}>
                <div style={{
                  display:"inline-flex",alignItems:"center",gap:6,
                  background: partialCount>=10
                    ? (dark?"rgba(19,136,8,0.15)":"rgba(19,136,8,0.08)")
                    : (dark?"rgba(255,153,51,0.18)":"rgba(255,153,51,0.10)"),
                  border:`1.5px solid ${partialCount>=10?"rgba(19,136,8,0.30)":"rgba(255,153,51,0.35)"}`,
                  borderRadius:20,padding:"6px 14px",
                  animation:"briefSlideIn 0.2s ease",
                }}>
                  <span style={{fontSize:13}}>🎯</span>
                  <span style={{
                    fontSize:12,fontWeight:800,fontFamily:bf,
                    color:partialCount>=10?IND_GREEN:SAFFRON,
                    letterSpacing:0.1,
                  }}>
                    ~{displayCount} {isHindi?"योजनाएं मिलेंगी":"schemes match so far"}
                  </span>
                </div>
              </div>
            )}

            {isStateQ?(
              <div>
                <input value={stateSearch} onChange={e=>setStateSearch(e.target.value)} placeholder={t.searchStatePh}
                  style={{width:"100%",padding:"13px 16px",borderRadius:14,border:"2px solid #FF9933",fontSize:14,outline:"none",fontFamily:bf,marginBottom:8,boxSizing:"border-box",background:th.inputBg,color:th.text}}/>
                <div style={{background:th.card,borderRadius:14,border:`1.5px solid ${th.border}`,maxHeight:220,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                  {(stateSearch?filteredStates:INDIA_STATES).map(state=>{
                    const sel=stateSearch===state;
                    return(
                      <div key={state} onClick={()=>{haptic();setStateSearch(state);}}
                        style={{padding:"12px 16px",borderBottom:`1px solid ${th.divider}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",background:sel?th.optionActive:th.card,transition:"background 0.15s"}}>
                        <span style={{fontSize:14,fontWeight:sel?700:400,color:sel?"#CC6600":th.text,fontFamily:bf}}>{state}</span>
                        {sel&&<span style={{color:"#FF9933",fontSize:16,fontWeight:700}}>✓</span>}
                      </div>
                    );
                  })}
                  {stateSearch&&filteredStates.length===0&&<div style={{padding:16,textAlign:"center",color:"#aaa",fontSize:13}}>No state found</div>}
                </div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {q.options.map(opt=>{
                  const active=activeVal===opt.value;
                  const locked=lockedAnswer===opt.value;
                  return(
                    <div key={opt.value}
                      onClick={()=>{
                        haptic();
                        setSelected(opt.value);
                        setLockedAnswer(opt.value);
                        if(autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
                        autoAdvanceTimerRef.current=setTimeout(()=>{
                          autoAdvanceTimerRef.current=null;
                          setLockedAnswer(null);
                          goNext(opt.value);
                        },400);
                      }}
                      style={{
                        padding:"13px 16px",borderRadius:13,
                        border:`2px solid ${locked?"#138808":active?"#FF9933":th.border}`,
                        background:locked?(dark?"rgba(19,136,8,0.18)":th.optionActive):active?th.optionActive:th.optionBg,
                        cursor:"pointer",display:"flex",alignItems:"center",gap:12,
                        transition:"border-color 0.15s,background 0.15s,box-shadow 0.15s",
                        boxShadow:locked?"0 4px 18px rgba(19,136,8,0.22)":active?"0 4px 14px rgba(255,153,51,0.18)":"none",
                        animation:locked?"answer-lock-pulse 0.38s cubic-bezier(0.34,1.56,0.64,1) both":"none",
                      }}>
                      <div style={{
                        width:20,height:20,borderRadius:"50%",
                        border:`2px solid ${locked?"#138808":active?"#FF9933":th.border3}`,
                        background:locked?"#138808":active?"#FF9933":th.optionBg,
                        flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                        transition:"all 0.15s",
                      }}>
                        {locked
                          ?<span style={{color:"#fff",fontSize:11,fontWeight:900,lineHeight:1}}>✓</span>
                          :active&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>
                        }
                      </div>
                      <span style={{fontSize:13,fontWeight:active||locked?700:400,color:locked?"#138808":active?"#CC6600":th.text,fontFamily:bf}}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{display:"flex",gap:10,marginTop:24}}>
              <div onClick={()=>{haptic();goBack();}} style={{flex:1,padding:14,borderRadius:14,border:`1.5px solid ${th.border3}`,background:th.card,textAlign:"center",fontSize:14,fontWeight:600,color:th.textMid,cursor:"pointer",fontFamily:bf}}>{t.backBtn}</div>
              <div onClick={()=>{if(canProceed)haptic();goNext();}} style={{flex:2,padding:14,borderRadius:14,background:canProceed?"linear-gradient(135deg,#FF9933,#FF8C00)":"#e0e0e0",textAlign:"center",fontSize:14,fontWeight:700,color:"#fff",cursor:canProceed?"pointer":"default",fontFamily:bf,boxShadow:canProceed?"0 4px 16px rgba(255,153,51,0.35)":"none",transition:"all 0.2s"}}>
                {step===TOTAL-1?t.checkBtn:t.nextBtn}
              </div>
            </div>
          </div>
        )}

        {/* ── CONFETTI OVERLAY — pointer-events:none so results stay tappable ── */}
        {showCelebration&&results.length>0&&(
          <div style={{position:"fixed",inset:0,zIndex:500,pointerEvents:"none",overflow:"hidden",animation:"celebrate-fade-out 0.55s ease 2.4s both"}}>
            {[
              [3,"#FF9933",1.55,0,9,true],[9,"#138808",1.72,0.08,6,false],[15,"#FFD700",1.42,0.22,11,true],
              [22,"#FF4081",1.63,0.01,7,false],[28,"#06038D",1.85,0.17,6,true],[34,"#FF9933",1.44,0.31,9,false],
              [40,"#138808",1.68,0.06,7,true],[46,"#FFD700",1.51,0.26,12,false],[52,"#ffffff",1.65,0.11,6,true],
              [58,"#FF6B35",1.80,0.02,8,false],[64,"#FF9933",1.45,0.21,7,true],[70,"#4CAF50",1.73,0.32,10,false],
              [76,"#FFD700",1.56,0.09,6,true],[82,"#FF4081",1.62,0.04,11,false],[88,"#138808",1.78,0.18,7,true],
              [94,"#FF9933",1.43,0.28,8,false],[6,"#FFE066",1.69,0.37,6,true],[18,"#29B6F6",1.53,0.07,9,false],
              [31,"#EF5350",1.61,0.19,7,true],[43,"#FFB300",1.82,0.29,11,false],[55,"#06038D",1.47,0.13,6,true],
              [67,"#FF9933",1.74,0.23,8,false],[79,"#138808",1.50,0.03,9,true],[91,"#FFD700",1.66,0.33,7,false],
              [12,"#FF4081",1.84,0.16,6,true],[24,"#4CAF50",1.41,0.27,10,false],[36,"#FF9933",1.77,0.05,7,true],
              [48,"#FFD700",1.58,0.37,8,false],[60,"#138808",1.64,0.14,6,true],[72,"#FF6B35",1.86,0.24,9,false],
              [84,"#FFE066",1.46,0.04,7,true],[96,"#29B6F6",1.71,0.34,11,false],
            ].map(([l,col,dur,del,sz,rect],i)=>(
              <div key={i} style={{
                position:"absolute",top:-14,left:`${l}%`,
                width:rect?sz:sz*0.75,height:rect?sz*0.5:sz,
                borderRadius:rect?2:"50%",background:col,
                animation:`confetti-fall ${dur}s ${del}s ease-in both`,
                transform:`rotate(${i*53%360}deg)`,
              }}/>
            ))}
          </div>
        )}

        {/* Results */}
        {step===TOTAL&&(
          <div style={{padding:"16px 16px 48px"}}>
            {results.length>0?(
              <>
                {/* ── CELEBRATION HERO CARD ── */}
                <div style={{
                  background:"linear-gradient(145deg,#0a5c1f 0%,#138808 45%,#1da832 100%)",
                  borderRadius:22,padding:"20px 20px 18px",marginBottom:16,
                  boxShadow:"0 10px 36px rgba(19,136,8,0.38),0 3px 10px rgba(0,0,0,0.18)",
                  animation:"celebrate-card-in 0.65s cubic-bezier(0.34,1.56,0.64,1) both",
                  position:"relative",overflow:"hidden",
                }}>
                  {/* One-shot shine sweep */}
                  <div style={{position:"absolute",top:0,left:"-60%",width:"40%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",transform:"skewX(-15deg)",animation:"premiumShine 1.2s ease-out 0.45s 1",pointerEvents:"none"}}/>
                  {/* Subtle radial glow */}
                  <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 50% -10%,rgba(255,255,255,0.10) 0%,transparent 70%)",pointerEvents:"none"}}/>

                  {/* Top row: 🎉 + scheme count */}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,position:"relative"}}>
                    <div style={{fontSize:40,lineHeight:1,animation:"celebrate-emoji-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.15s both"}}>🎉</div>
                    <div>
                      <div style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:bf,lineHeight:1.15,letterSpacing:-0.4}}>{t.matchSub(results.length)}</div>
                      {answers.state&&<div style={{fontSize:12,color:"rgba(255,255,255,0.82)",marginTop:3,display:"flex",alignItems:"center",gap:4}}>📍 <span>{answers.state}</span></div>}
                    </div>
                  </div>

                  {/* Benefit hero block */}
                  {totalAnnual>0&&(
                    <div style={{
                      background:"rgba(0,0,0,0.18)",border:"1.5px solid rgba(255,255,255,0.22)",
                      borderRadius:16,padding:"14px 16px",marginBottom:14,textAlign:"center",
                      animation:"celebrate-amount-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.32s both",
                    }}>
                      <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.68)",letterSpacing:1.6,textTransform:"uppercase",fontFamily:bf,marginBottom:6}}>
                        {isHindi?"कुल अनुमानित सालाना लाभ":"Total Estimated Annual Benefit"}
                      </div>
                      <div style={{
                        fontSize:42,fontWeight:900,color:"#FFD700",fontFamily:bf,lineHeight:1,
                        letterSpacing:-1.5,
                        textShadow:"0 0 24px rgba(255,215,0,0.55),0 2px 10px rgba(0,0,0,0.35)",
                      }}>
                        ₹{animatedBenefit>=100000
                          ?`${(animatedBenefit/100000).toFixed(1)}L`
                          :`${(animatedBenefit/1000).toFixed(0)}K`}
                      </div>
                      <div style={{fontSize:11.5,color:"rgba(255,255,255,0.72)",marginTop:5,fontFamily:bf,fontWeight:500}}>
                        {isHindi?"*अनुमानित — सभी योजनाओं में आवेदन व मंज़ूरी पर निर्भर":"*Estimated — if you apply & get approved for all matched schemes"}
                      </div>
                    </div>
                  )}

                  {/* Central / State breakdown pills */}
                  <div style={{display:"flex",gap:8,position:"relative"}}>
                    <div style={{flex:1,background:"rgba(255,255,255,0.13)",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                      <div style={{fontSize:22,fontWeight:900,color:"#fff",lineHeight:1}}>{nationalResults.length}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.78)",marginTop:3}}>🇮🇳 {isHindi?"केंद्रीय":"Central"}</div>
                    </div>
                    <div style={{flex:1,background:"rgba(255,255,255,0.13)",borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
                      <div style={{fontSize:22,fontWeight:900,color:"#fff",lineHeight:1}}>{stateResults.length}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.78)",marginTop:3}}>📍 {isHindi?"राज्य":"State"}</div>
                    </div>
                    {totalAnnual===0&&(
                      <div style={{flex:2,background:"rgba(255,255,255,0.10)",borderRadius:12,padding:"10px 12px",textAlign:"center",border:"1px solid rgba(255,255,255,0.18)"}}>
                        <div style={{fontSize:14,fontWeight:800,color:"#fff",lineHeight:1}}>{results.length}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.78)",marginTop:3}}>{isHindi?"कुल योजनाएं":"Total Schemes"}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── "What These Numbers Mean" — honest-estimate disclaimer ──
                     Addresses the "this feels fake / how could I get ₹80L"
                     reaction: clarifies the ₹ figure is a maximum potential
                     total, not a guaranteed payout, and that documents +
                     per-scheme approval still decide the real outcome.       */}
                <div style={{
                  background:dark?"rgba(255,153,51,0.08)":"rgba(255,153,51,0.06)",
                  border:`1.5px solid ${dark?"rgba(255,153,51,0.28)":"rgba(255,153,51,0.30)"}`,
                  borderRadius:16,padding:"13px 15px",marginBottom:16,
                }}>
                  <div onClick={()=>{haptic();setShowEstimateInfo(v=>!v);}} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
                    <div style={{width:30,height:30,borderRadius:9,flexShrink:0,background:"rgba(255,153,51,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>📋</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:800,color:dark?"#FFB366":"#B45309",fontFamily:bf,lineHeight:1.3}}>{t.estimateTitle}</div>
                      <div style={{fontSize:10.5,color:dark?"rgba(255,179,102,0.75)":"rgba(180,83,9,0.75)",marginTop:2,fontFamily:bf,lineHeight:1.4}}>{t.estimateShort}</div>
                    </div>
                    <span style={{fontSize:13,color:dark?"rgba(255,179,102,0.7)":"rgba(180,83,9,0.65)",flexShrink:0,transform:showEstimateInfo?"rotate(180deg)":"none",transition:"transform 0.25s",marginTop:1}}>▾</span>
                  </div>
                  {showEstimateInfo&&(
                    <div style={{marginTop:11,paddingTop:11,borderTop:`1px solid ${dark?"rgba(255,153,51,0.18)":"rgba(255,153,51,0.20)"}`,display:"flex",flexDirection:"column",gap:8,animation:"briefSlideIn 0.2s ease"}}>
                      {t.estimatePoints.map((p,i)=>(
                        <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                          <span style={{fontSize:12,flexShrink:0,marginTop:1}}>{["🎯","💰","📝","📎"][i]||"•"}</span>
                          <span style={{fontSize:11.5,lineHeight:1.55,color:dark?"#FCD9B0":"#92400E",fontFamily:bf}}>{p}</span>
                        </div>
                      ))}
                      <div onClick={()=>{haptic();setShowEstimateInfo(false);}} style={{textAlign:"center",fontSize:10.5,color:dark?"rgba(255,179,102,0.6)":"rgba(180,83,9,0.55)",fontFamily:bf,marginTop:2,cursor:"pointer"}}>
                        {t.estimateLess}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── AI Results Brief ── */}
                {(briefLoading || brief) && (
                  /* Gradient-border wrapper */
                  <div style={{
                    marginBottom:16,borderRadius:20,
                    padding:1.5,
                    background: dark
                      ? "linear-gradient(135deg,rgba(99,102,241,0.55),rgba(139,92,246,0.45),rgba(99,102,241,0.55))"
                      : "linear-gradient(135deg,rgba(99,102,241,0.38),rgba(139,92,246,0.28),rgba(59,130,246,0.32))",
                    boxShadow: dark
                      ? "0 8px 32px rgba(99,102,241,0.22),0 2px 8px rgba(0,0,0,0.30)"
                      : "0 8px 28px rgba(99,102,241,0.13),0 2px 8px rgba(0,0,0,0.06)",
                  }}>
                    {/* Inner card */}
                    <div style={{
                      borderRadius:19,overflow:"hidden",position:"relative",
                      background: dark ? "#16162a" : "#FAFAFF",
                      padding:"14px 16px",
                    }}>
                      {/* Shine sweep */}
                      <div style={{
                        position:"absolute",top:0,left:"-60%",width:"40%",height:"100%",
                        background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.07),transparent)",
                        transform:"skewX(-15deg)",
                        animation:"premiumShine 3.5s ease-in-out 1.2s infinite",
                        pointerEvents:"none",
                      }}/>

                      {/* ── Header row ── */}
                      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                        {/* AI icon chip */}
                        <div style={{
                          width:30,height:30,borderRadius:10,flexShrink:0,
                          background:"linear-gradient(135deg,#6366F1,#8B5CF6)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          boxShadow:"0 3px 10px rgba(99,102,241,0.42)",
                          fontSize:15,
                        }}>✨</div>

                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:10.5,fontWeight:800,letterSpacing:0.7,
                            color:"#6366F1",fontFamily:bf,lineHeight:1}}>
                            {isHindi?"AI सलाहकार":"AI ADVISOR"}
                          </div>
                          <div style={{fontSize:9,marginTop:2,fontFamily:bf,lineHeight:1,
                            color:dark?"rgba(165,180,252,0.65)":"rgba(79,70,229,0.55)"}}>
                            {isHindi?"आपकी प्रोफाइल के अनुसार":"Personalised for your profile"}
                          </div>
                        </div>

                        {/* Loading dots OR language tag */}
                        {briefLoading ? (
                          <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
                            {[0,1,2].map(i=>(
                              <div key={i} style={{
                                width:5,height:5,borderRadius:"50%",
                                background:"#6366F1",
                                animation:"briefDot 1.3s ease-in-out infinite",
                                animationDelay:`${i*0.2}s`,
                              }}/>
                            ))}
                          </div>
                        ) : (
                          <div style={{
                            fontSize:8.5,fontWeight:700,fontFamily:bf,flexShrink:0,
                            color:dark?"rgba(165,180,252,0.55)":"rgba(99,102,241,0.50)",
                            background:dark?"rgba(99,102,241,0.10)":"rgba(99,102,241,0.07)",
                            border:`1px solid ${dark?"rgba(99,102,241,0.18)":"rgba(99,102,241,0.13)"}`,
                            padding:"2px 8px",borderRadius:20,letterSpacing:0.3,
                          }}>
                            {isHindi?"हिंदी · AI":"EN · AI"}
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div style={{
                        height:1,marginBottom:11,
                        background:dark
                          ?"linear-gradient(90deg,transparent,rgba(99,102,241,0.22),transparent)"
                          :"linear-gradient(90deg,transparent,rgba(99,102,241,0.13),transparent)",
                      }}/>

                      {/* ── Skeleton ── */}
                      {briefLoading&&!brief&&(
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          {[88,72,82,58].map((w,i)=>(
                            <div key={i} style={{
                              height:9,width:`${w}%`,borderRadius:6,
                              background:dark?"rgba(99,102,241,0.14)":"rgba(99,102,241,0.08)",
                              animation:"badgePulse 1.6s ease-in-out infinite",
                              animationDelay:`${i*0.16}s`,
                            }}/>
                          ))}
                        </div>
                      )}

                      {/* ── Brief text ── */}
                      {brief&&(
                        <p style={{
                          margin:0,fontSize:12.5,lineHeight:1.8,fontFamily:bf,
                          color:dark?"#C7D2FE":"#3730A3",
                          animation:"briefTextReveal 0.55s cubic-bezier(0.16,1,0.3,1) both",
                        }}>{brief}</p>
                      )}

                      {/* ── Smart insight chips (data-driven, no extra API) ── */}
                      {brief&&results.length>0&&(()=>{
                        const chips=[];
                        const topS=[...results].sort((a,b)=>(b.annual||0)-(a.annual||0))[0];
                        if(topS?.annual>0) chips.push({
                          icon:"💰",
                          label:isHindi?`₹${(topS.annual/1000).toFixed(0)}K/वर्ष तक`:`Up to ₹${(topS.annual/1000).toFixed(0)}K/yr`,
                        });
                        if(nearMiss.length>0) chips.push({
                          icon:"⚡",
                          label:isHindi?`${nearMiss.length} निकट योजना`:`${nearMiss.length} near-miss`,
                        });
                        if(results.some(r=>r.applyType==="online")) chips.push({
                          icon:"🌐",
                          label:isHindi?"ऑनलाइन आवेदन":"Apply online",
                        });
                        if(!chips.length) return null;
                        return(
                          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:11}}>
                            {chips.map((c,i)=>(
                              <div key={i} style={{
                                display:"flex",alignItems:"center",gap:4,
                                background:dark?"rgba(99,102,241,0.11)":"rgba(99,102,241,0.07)",
                                border:`1px solid ${dark?"rgba(99,102,241,0.20)":"rgba(99,102,241,0.14)"}`,
                                borderRadius:20,padding:"3px 10px",
                                fontSize:10,fontWeight:700,color:dark?"#A5B4FC":"#4F46E5",fontFamily:bf,
                              }}>
                                <span style={{fontSize:10}}>{c.icon}</span>{c.label}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {stateResults.length>0&&(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                      <span style={{fontSize:11,fontWeight:700,color:"#854D0E",background:"#FEF9C3",borderRadius:20,padding:"3px 10px",border:"1px solid #FEF08A"}}>📍 {t.stateSchemes} ({stateResults.length})</span>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                    </div>
                    {(showAllState?stateResults:stateResults.slice(0,PREVIEW_COUNT)).map((s,idx)=>(
                      <div key={s.id} style={{
                        animation:`fadeSlide 0.35s ease both`,
                        // Newly revealed cards (idx >= PREVIEW_COUNT on expand) animate
                        // in fresh from 0; initial-render cards keep their original stagger.
                        animationDelay:`${(showAllState&&idx>=PREVIEW_COUNT?(idx-PREVIEW_COUNT):idx)*60}ms`,
                      }}>
                        <SchemeCard scheme={s} lang={lang} dark={dark} expanded={expandedId===s.id} onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)} onOpenDetail={onOpenDetail}/>
                      </div>
                    ))}
                    {stateResults.length>PREVIEW_COUNT&&(
                      <ShowMoreBtn
                        expanded={showAllState}
                        hiddenCount={stateResults.length-PREVIEW_COUNT}
                        moreText={isHindi?"और राज्य योजनाएं":"more state schemes"}
                        lessText={isHindi?"कम दिखाएं":"Show less"}
                        onToggle={()=>{haptic(30);setShowAllState(v=>!v);}}
                        dark={dark} th={th} bf={bf}
                      />
                    )}
                  </>
                )}
                {nationalResults.length>0&&(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,margin:"14px 0 10px"}}>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                      <span style={{fontSize:11,fontWeight:700,color:"#1D4ED8",background:"#EFF6FF",borderRadius:20,padding:"3px 10px",border:"1px solid #BFDBFE"}}>🇮🇳 {t.centralSchemes} ({nationalResults.length})</span>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                    </div>
                    {(showAllNational?nationalResults:nationalResults.slice(0,PREVIEW_COUNT)).map((s,idx)=>(
                      <div key={s.id} style={{
                        animation:`fadeSlide 0.35s ease both`,
                        // On initial render stagger after state results;
                        // on expand, newly revealed cards animate in with a clean 0-based stagger.
                        animationDelay:`${(showAllNational&&idx>=PREVIEW_COUNT?(idx-PREVIEW_COUNT):(stateResults.length+idx))*60}ms`,
                      }}>
                        <SchemeCard scheme={s} lang={lang} dark={dark} expanded={expandedId===s.id} onToggle={()=>setExpandedId(expandedId===s.id?null:s.id)} onOpenDetail={onOpenDetail}/>
                      </div>
                    ))}
                    {nationalResults.length>PREVIEW_COUNT&&(
                      <ShowMoreBtn
                        expanded={showAllNational}
                        hiddenCount={nationalResults.length-PREVIEW_COUNT}
                        moreText={isHindi?"और केंद्रीय योजनाएं":"more central schemes"}
                        lessText={isHindi?"कम दिखाएं":"Show less"}
                        onToggle={()=>{haptic(30);setShowAllNational(v=>!v);}}
                        dark={dark} th={th} bf={bf}
                      />
                    )}
                  </>
                )}

                {/* ── NEAR-MISS SECTION ── */}
                {nearMiss.length>0&&(
                  <div style={{marginTop:22}}>
                    {/* Section header */}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                      <span style={{fontSize:11,fontWeight:700,color:"#92400E",background:"#FFFBEB",borderRadius:20,padding:"3px 10px",border:"1px solid #FCD34D",display:"flex",alignItems:"center",gap:4}}>
                        {t.nearMissTitle}
                      </span>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                    </div>
                    {/* Subtitle */}
                    <div style={{fontSize:12,color:th.textSub,marginBottom:12,lineHeight:1.5,fontFamily:bf}}>
                      {t.nearMissSub}
                    </div>
                    {/* Near-miss cards */}
                    {(showAllNearMiss?nearMiss:nearMiss.slice(0,NM_PREVIEW)).map(({scheme,reasons},nmIdx)=>(
                      <div key={scheme.id} style={{
                        background:dark?"#1c1300":"#FFFDF5",
                        borderRadius:14,padding:"13px 14px",marginBottom:10,
                        border:`1.5px dashed ${scheme.color}55`,
                        position:"relative",overflow:"hidden",
                        animation:`fadeSlide 0.35s ease both`,
                        animationDelay:`${(showAllNearMiss&&nmIdx>=NM_PREVIEW?(nmIdx-NM_PREVIEW):nmIdx)*60}ms`,
                      }}>
                        {/* Faded "Almost" watermark badge */}
                        <div style={{
                          position:"absolute",top:8,right:10,
                          fontSize:8,fontWeight:800,letterSpacing:0.6,
                          color:scheme.color,background:scheme.color+"18",
                          borderRadius:20,padding:"2px 8px",
                          border:`1px solid ${scheme.color}33`,
                          textTransform:"uppercase",
                        }}>
                          {isHindi?"लगभग":"Almost"}
                        </div>
                        {/* Scheme identity row */}
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,paddingRight:60}}>
                          <div style={{
                            width:38,height:38,borderRadius:11,flexShrink:0,
                            background:`${scheme.color}18`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:20,border:`1.5px solid ${scheme.color}30`,
                            filter:"grayscale(40%)",opacity:0.85,
                          }}>
                            {scheme.icon}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:bf,lineHeight:1.3,marginBottom:2}}>
                              {scheme.name[lang]}
                            </div>
                            <div style={{fontSize:11,color:th.textSub,fontFamily:bf}}>
                              {scheme.benefit[lang]}
                            </div>
                          </div>
                        </div>
                        {/* Missing criteria chips */}
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                          <span style={{fontSize:10,fontWeight:700,color:"#92400E",fontFamily:bf}}>
                            {t.nearMissMissing}
                          </span>
                          {reasons.map((r,i)=>(
                            <span key={i} style={{
                              fontSize:10,fontWeight:700,
                              color:"#B45309",
                              background:"#FEF3C7",
                              borderRadius:20,padding:"3px 9px",
                              border:"1px solid #FCD34D",
                              display:"flex",alignItems:"center",gap:4,
                            }}>
                              ⚠️ {r}
                            </span>
                          ))}
                        </div>
                        {/* Fix my answer CTA */}
                        <div
                          onClick={()=>{haptic();retake();}}
                          onTouchStart={e=>e.currentTarget.style.background="rgba(255,153,51,0.18)"}
                          onTouchEnd={e=>e.currentTarget.style.background="rgba(255,153,51,0.10)"}
                          style={{
                            marginTop:10,
                            display:"inline-flex",alignItems:"center",gap:5,
                            background:"rgba(255,153,51,0.10)",
                            border:"1.5px solid rgba(255,153,51,0.40)",
                            borderRadius:10,padding:"7px 13px",
                            cursor:"pointer",WebkitTapHighlightColor:"transparent",
                            fontSize:11,fontWeight:700,color:"#CC6600",fontFamily:bf,
                            transition:"background 0.15s",
                          }}>
                          {t.fixAnswerBtn}
                        </div>
                      </div>
                    ))}
                    {nearMiss.length>NM_PREVIEW&&(
                      <ShowMoreBtn
                        expanded={showAllNearMiss}
                        hiddenCount={nearMiss.length-NM_PREVIEW}
                        moreText={isHindi?"और अवसर देखें":"more to unlock"}
                        lessText={isHindi?"कम दिखाएं":"Show less"}
                        onToggle={()=>{haptic(30);setShowAllNearMiss(v=>!v);}}
                        dark={dark} th={th} bf={bf}
                      />
                    )}
                  </div>
                )}
              </>
            ):(
              <>
                <div style={{textAlign:"center",padding:"32px 20px 16px"}}>
                  <div style={{fontSize:48,marginBottom:12}}>🔍</div>
                  <div style={{fontSize:17,fontWeight:800,color:th.text,marginBottom:8,fontFamily:bf}}>{t.noMatchTitle}</div>
                  <div style={{fontSize:13,color:th.textSub,lineHeight:1.6,fontFamily:bf}}>{t.noMatchSub}</div>
                </div>
                {nearMiss.length>0&&(
                  <div style={{marginTop:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                      <span style={{fontSize:11,fontWeight:700,color:"#92400E",background:"#FFFBEB",borderRadius:20,padding:"3px 10px",border:"1px solid #FCD34D"}}>
                        {t.nearMissTitle}
                      </span>
                      <div style={{height:1,flex:1,background:th.border2}}/>
                    </div>
                    <div style={{fontSize:12,color:th.textSub,marginBottom:12,lineHeight:1.5,fontFamily:bf}}>{t.nearMissSub}</div>
                    {(showAllNearMiss?nearMiss:nearMiss.slice(0,NM_PREVIEW)).map(({scheme,reasons},nmIdx)=>(
                      <div key={scheme.id} style={{background:dark?"#1c1300":"#FFFDF5",borderRadius:14,padding:"13px 14px",marginBottom:10,border:`1.5px dashed ${scheme.color}55`,position:"relative",overflow:"hidden",animation:`fadeSlide 0.35s ease both`,animationDelay:`${(showAllNearMiss&&nmIdx>=NM_PREVIEW?(nmIdx-NM_PREVIEW):nmIdx)*60}ms`}}>
                        <div style={{position:"absolute",top:8,right:10,fontSize:8,fontWeight:800,letterSpacing:0.6,color:scheme.color,background:scheme.color+"18",borderRadius:20,padding:"2px 8px",border:`1px solid ${scheme.color}33`,textTransform:"uppercase"}}>
                          {isHindi?"लगभग":"Almost"}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,paddingRight:60}}>
                          <div style={{width:38,height:38,borderRadius:11,flexShrink:0,background:`${scheme.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`1.5px solid ${scheme.color}30`,filter:"grayscale(40%)",opacity:0.85}}>
                            {scheme.icon}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:bf,lineHeight:1.3,marginBottom:2}}>{scheme.name[lang]}</div>
                            <div style={{fontSize:11,color:th.textSub,fontFamily:bf}}>{scheme.benefit[lang]}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                          <span style={{fontSize:10,fontWeight:700,color:"#92400E",fontFamily:bf}}>{t.nearMissMissing}</span>
                          {reasons.map((r,i)=>(
                            <span key={i} style={{fontSize:10,fontWeight:700,color:"#B45309",background:"#FEF3C7",borderRadius:20,padding:"3px 9px",border:"1px solid #FCD34D",display:"flex",alignItems:"center",gap:4}}>⚠️ {r}</span>
                          ))}
                        </div>
                        {/* Fix my answer CTA */}
                        <div
                          onClick={()=>{haptic();retake();}}
                          onTouchStart={e=>e.currentTarget.style.background="rgba(255,153,51,0.18)"}
                          onTouchEnd={e=>e.currentTarget.style.background="rgba(255,153,51,0.10)"}
                          style={{
                            marginTop:10,
                            display:"inline-flex",alignItems:"center",gap:5,
                            background:"rgba(255,153,51,0.10)",
                            border:"1.5px solid rgba(255,153,51,0.40)",
                            borderRadius:10,padding:"7px 13px",
                            cursor:"pointer",WebkitTapHighlightColor:"transparent",
                            fontSize:11,fontWeight:700,color:"#CC6600",fontFamily:bf,
                            transition:"background 0.15s",
                          }}>
                          {t.fixAnswerBtn}
                        </div>
                      </div>
                    ))}
                    {nearMiss.length>NM_PREVIEW&&(
                      <ShowMoreBtn
                        expanded={showAllNearMiss}
                        hiddenCount={nearMiss.length-NM_PREVIEW}
                        moreText={isHindi?"और अवसर देखें":"more to unlock"}
                        lessText={isHindi?"कम दिखाएं":"Show less"}
                        onToggle={()=>{haptic(30);setShowAllNearMiss(v=>!v);}}
                        dark={dark} th={th} bf={bf}
                      />
                    )}
                  </div>
                )}
              </>
            )}
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <div onClick={()=>{haptic();retake();}} style={{flex:1,padding:14,borderRadius:14,border:"1.5px solid #FF9933",background:th.card,textAlign:"center",fontSize:13,fontWeight:700,color:"#FF8C00",cursor:"pointer",fontFamily:bf}}>{t.retakeBtn}</div>
              <div onClick={()=>{haptic();onExitFromResults?.(!!prefilledAnswers&&!Object.keys(answers).some(k=>answers[k]!==prefilledAnswers[k]));onClose();}} style={{flex:1,padding:14,borderRadius:14,background:"linear-gradient(135deg,#003580,#1a56db)",textAlign:"center",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:bf}}>{t.doneBtn}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHARED PROFILE SUB-COMPONENTS (top-level — prevents focus loss on re-render) ─
function TriHeader({children,bg="linear-gradient(160deg,#FF9933 0%,#FF8C00 35%,#003580 100%)"}){
  return(
    <div style={{background:bg,paddingTop:44,paddingBottom:24,paddingLeft:24,paddingRight:24,position:"relative",overflow:"hidden",flexShrink:0}}>
      {/* Large Ashoka Chakra watermark — absolute positioned top-right */}
      <div style={{position:"absolute",right:-18,top:12,opacity:0.08,pointerEvents:"none"}}>
        <AshokaChakra size={150} color="#fff"/>
      </div>
      {/* Subtle decorative ring — bottom-left */}
      <div style={{position:"absolute",left:-45,bottom:-45,width:150,height:150,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.07)",pointerEvents:"none"}}/>
      {children}
    </div>
  );
}
function Card({children,mt=-20,dark=false}){
  const th=THEME[dark?"dark":"light"];
  return(
    <div style={{margin:`${mt}px 16px 0`,background:th.card,borderRadius:20,padding:22,boxShadow:dark?"0 6px 28px rgba(0,0,0,0.35)":"0 6px 28px rgba(0,0,0,0.10)",border:`1.5px solid ${th.border}`}}>
      {children}
    </div>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────
function ProfileTab({lang,profile,setProfile,toggleLang,onViewChecker,dark=false,toggleDark,isAdmin=false,onAdminOpen,liveCheckerTotal=null}){
  const th=THEME[dark?"dark":"light"];
  const pt=PT[lang];
  const bf=fontFamily(lang);
  const isHindi=lang==="hi";

  // Stage: "phone" | "otp" | "setup1" | "setup2" | "dashboard"
  const [stage,setStage]=useState(profile?"dashboard":"phone");
  const [phone,setPhone]=useState(profile?.phone||"");
  const [otp,setOtp]=useState(["","","","","",""]);
  const [timer,setTimer]=useState(60);
  const [timerOn,setTimerOn]=useState(false);
  const [setupName,setSetupName]=useState(profile?.name||"");
  const [setupGender,setSetupGender]=useState(profile?.gender||"");
  const [setupState,setSetupState]=useState(profile?.state||"");
  const [stateSearch,setStateSearch]=useState(profile?.state||"");
  const [setupCat,setSetupCat]=useState(profile?.occupation||"");
  // Bug 4+5 fix: these 4 fields were never collected in setup — add state vars
  // initialized from existing profile so handleEdit() can restore them correctly
  const [setupIncome,    setSetupIncome]    =useState(profile?.income ||"");
  const [setupAge,       setSetupAge]       =useState(profile?.age    ||"");
  const [setupArea,      setSetupArea]      =useState(profile?.area   ||"");
  const [setupHouse,     setSetupHouse]     =useState(profile?.house  ||"");
  const [setupRation,    setSetupRation]    =useState(profile?.ration    ||"");
  const [setupDisability,setSetupDisability]=useState(profile?.disability||"none");
  const [setupMarital,   setSetupMarital]   =useState(profile?.marital   ||"");
  const [setupCaste,     setSetupCaste]     =useState(profile?.caste     ||"");
  // ── Step 4 — occupation-conditional + children fields ──────────────────────
  const [setupLandHolding,    setSetupLandHolding]    =useState(profile?.landHolding    ||"");
  const [setupKisanCard,      setSetupKisanCard]      =useState(profile?.kisanCard      ||"");
  const [setupEducationLevel, setSetupEducationLevel] =useState(profile?.educationLevel ||"");
  const [setupInstitutionType,setSetupInstitutionType]=useState(profile?.institutionType||"");
  const [setupNumChildren,    setSetupNumChildren]    =useState(profile?.numChildren    ||"");
  const [setupHasGirls,       setSetupHasGirls]       =useState(profile?.hasGirls       ||"");
  const [authLoading,setAuthLoading]=useState(false);
  const [authError,setAuthError]=useState("");
  const [googleLoading,setGoogleLoading]=useState(false);
  const [googleEmail,setGoogleEmail]=useState("");
  const [googlePhoto,setGooglePhoto]=useState("");
  const [emailInput,setEmailInput]=useState("");
  const [passwordInput,setPasswordInput]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [emailTab,setEmailTab]=useState("signin"); // "signin" | "signup"
  const [emailLoading,setEmailLoading]=useState(false);
  const [forgotLoading,setForgotLoading]=useState(false);
  const [forgotMsg,setForgotMsg]=useState(""); // "" | "sent" | "error"
  const [showForgot,setShowForgot]=useState(false); // only reveal after a wrong-password attempt
  const [loginToast,setLoginToast]=useState(null);  // { name, photo } | null
  const [showReport,setShowReport]=useState(false);
  const [reportTab,setReportTab]=useState("my"); // "my" | "new"
  const [showAbout,setShowAbout]=useState(false);
  const [showHelpline,setShowHelpline]=useState(false);
  const [showFAQ,setShowFAQ]=useState(false);
  const [showSignOutModal,setShowSignOutModal]=useState(false);
  const [signOutLoading,setSignOutLoading]=useState(false);
  const otpRefs=useRef([]);
  const verifierRef=useRef(null);
  const confirmationRef=useRef(null);

  // Read eligibility checker saved answers for pre-fill
  const savedAnswers=useMemo(()=>{
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||null;}catch{return null;}
  },[]);

  // Sync stage if profile changes (e.g. after save or sign-out).
  // Guard against overriding setup stages so Edit Profile flow works correctly.
  useEffect(()=>{
    const isSetupStage=stage==="setup1"||stage==="setup2"||stage==="setup3"||stage==="setup4";
    if(profile&&!isSetupStage) setStage("dashboard");
    else if(!profile&&stage==="dashboard") setStage("phone");
  },[profile,stage]);

  // ── HARDWARE BACK BUTTON (Android) ──────────────────────────────────────────
  // Push a history entry whenever we enter a sub-view so the back button
  // navigates within the app instead of closing it.
  useEffect(()=>{
    const isSubView=
      stage==="otp"||stage==="setup1"||stage==="setup2"||stage==="setup3"||stage==="setup4"||
      showReport||showAbout||showHelpline||showFAQ||showSignOutModal;
    if(isSubView) window.history.pushState({ysProfileSubView:true},"");
  },[stage,showReport,showAbout,showHelpline,showFAQ,showSignOutModal]);

  useEffect(()=>{
    const handlePop=()=>{
      // Close modals first (highest priority)
      if(showSignOutModal){setShowSignOutModal(false);return;}
      if(showReport)     {setShowReport(false);return;}
      if(showAbout)      {setShowAbout(false);return;}
      if(showHelpline)   {setShowHelpline(false);return;}
      if(showFAQ)        {setShowFAQ(false);return;}
      // Walk back through setup stages
      if(stage==="setup4"){setStage("setup3");return;}
      if(stage==="setup3"){setStage("setup2");return;}
      if(stage==="setup2"){setStage("setup1");return;}
      if(stage==="setup1"){profile?setStage("dashboard"):setStage("phone");return;}
      if(stage==="otp")   {setStage("phone");return;}
      // dashboard stage — let parent/browser decide (no-op here)
    };
    window.addEventListener("popstate",handlePop);
    return()=>window.removeEventListener("popstate",handlePop);
  },[stage,showReport,showAbout,showHelpline,showFAQ,showSignOutModal,profile]);

  // OTP countdown timer
  useEffect(()=>{
    if(!timerOn)return;
    if(timer<=0){setTimerOn(false);return;}
    const id=setTimeout(()=>setTimer(prev=>prev-1),1000);
    return()=>clearTimeout(id);
  },[timerOn,timer]);

  const startTimer=()=>{setTimer(60);setTimerOn(true);};

  // ── HANDLERS ────────────────────────────────────────────────────────────────
  const handleGetOtp=async()=>{
    if(phone.length!==10)return;
    setAuthLoading(true);setAuthError("");
    try{
      if(!verifierRef.current){
        verifierRef.current=new RecaptchaVerifier(auth,"recaptcha-container",{size:"invisible",callback:()=>{}});
      }
      const confirmation=await signInWithPhoneNumber(auth,`+91${phone}`,verifierRef.current);
      confirmationRef.current=confirmation;
      startTimer();setOtp(["","","","","",""]);setStage("otp");
    }catch(err){
      setAuthError(err.message||"Failed to send OTP. Please try again.");
      verifierRef.current?.clear(); // destroy widget & free the DOM element before next attempt
      verifierRef.current=null;
    }finally{setAuthLoading(false);}
  };

  const handleOtpChange=(i,val)=>{
    if(!/^\d*$/.test(val))return;
    const next=[...otp];next[i]=val.slice(-1);setOtp(next);
    if(val&&i<5)setTimeout(()=>otpRefs.current[i+1]?.focus(),0);
  };

  const handleOtpKey=(i,e)=>{
    if(e.key==="Backspace"&&!otp[i]&&i>0)otpRefs.current[i-1]?.focus();
  };

  const handleOtpPaste=(e)=>{
    const digits=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if(digits.length===6){setOtp(digits.split(""));setTimeout(()=>otpRefs.current[5]?.focus(),0);}
    e.preventDefault();
  };

  const handleVerify=async()=>{
    if(otp.join("").length!==6)return;
    setAuthLoading(true);setAuthError("");
    try{
      await confirmationRef.current.confirm(otp.join(""));
      if(savedAnswers){
        if(savedAnswers.state){setSetupState(savedAnswers.state);setStateSearch(savedAnswers.state);}
        if(savedAnswers.who)    setSetupCat(savedAnswers.who);
        if(savedAnswers.income) setSetupIncome(savedAnswers.income);
        if(savedAnswers.age)    setSetupAge(savedAnswers.age);
        if(savedAnswers.area)   setSetupArea(savedAnswers.area);
        if(savedAnswers.house)  setSetupHouse(savedAnswers.house);
        if(savedAnswers.caste)  setSetupCaste(savedAnswers.caste);
      }
      setStage("setup1");
    }catch(err){
      setAuthError("Invalid OTP. Please check and try again.");
    }finally{setAuthLoading(false);}
  };

  const handleSetup1Next=()=>{
    if(setupName.trim().length<2||!setupGender)return;
    setStage("setup2");
  };

  const handleSetup2Next=()=>{
    if(!setupState||!setupCat)return;
    setStage("setup3");
  };

  const handleSetup3Next=()=>{
    if(!setupRation||!setupDisability||!setupMarital)return;
    setStage("setup4");
  };

  const handleSetup4Save=async()=>{
    if(!setupNumChildren)return;
    if(setupNumChildren!=="0"&&!setupHasGirls)return;
    const isNewUser=!profile;
    const profileData={
      name:setupName.trim(),phone,gender:setupGender,
      state:setupState,occupation:setupCat,
      caste:setupCaste||"general",
      income:setupIncome||"1to3",
      house:setupHouse||"no",
      age:setupAge||"18to35",
      area:setupArea||"rural",
      ration:setupRation,
      disability:setupDisability,
      marital:setupMarital,
      numChildren:setupNumChildren,
      hasGirls:setupNumChildren!=="0"?setupHasGirls:"no",
      ...(setupCat==="farmer"?{landHolding:setupLandHolding,kisanCard:setupKisanCard}:{}),
      ...(setupCat==="student"?{educationLevel:setupEducationLevel,institutionType:setupInstitutionType}:{}),
      ...(googleEmail?{email:googleEmail}:{}),
      ...(googlePhoto?{photo:googlePhoto}:{}),
    };
    setProfile(profileData);
    setStage("dashboard");
    try{
      const uid=auth.currentUser?.uid;
      if(uid){
        await setDoc(doc(db,"users",uid),{
          ...profileData,
          uid,
          ...(isNewUser?{createdAt:serverTimestamp()}:{}),
          lastSeen:serverTimestamp(),
        },{merge:true});
      }
    }catch(err){console.warn("Firestore save failed:",err);}
  };

  const handleEdit=()=>{
    setPhone(profile?.phone||"");            // restore phone for editing
    setSetupName(profile?.name||"");setSetupGender(profile?.gender||"");
    setSetupState(profile?.state||"");setStateSearch(profile?.state||"");
    setSetupCat(profile?.occupation||"");
    setSetupIncome(profile?.income||"");  // Bug 5 fix: was never restored
    setSetupAge(profile?.age||"");
    setSetupArea(profile?.area||"");
    setSetupHouse(profile?.house||"");
    setSetupRation(profile?.ration||"");
    setSetupDisability(profile?.disability||"none");
    setSetupMarital(profile?.marital||"");
    setSetupCaste(profile?.caste||"");
    setSetupLandHolding(profile?.landHolding||"");
    setSetupKisanCard(profile?.kisanCard||"");
    setSetupEducationLevel(profile?.educationLevel||"");
    setSetupInstitutionType(profile?.institutionType||"");
    setSetupNumChildren(profile?.numChildren||"");
    setSetupHasGirls(profile?.hasGirls||"");
    setStage("setup1");
  };

  const handleSignOut=async()=>{
    // Clear this user's doc vault from localStorage before signing out
    const uid=auth.currentUser?.uid;
    if(uid){ try{ localStorage.removeItem(`yojana_doc_vault_${uid}`); }catch{} }
    try{ localStorage.removeItem(STORAGE_KEY); }catch{}       // Bug 2 fix: eligibility answers bleed to next user
    try{ localStorage.removeItem(RECENT_STATE_KEY); }catch{}  // Bug 6 fix: last-picked state leaks across accounts
    await signOut(auth);
    setProfile(null);
    setPhone("");setOtp(["","","","","",""]);
    setSetupName("");setSetupGender("");setSetupState("");setStateSearch("");setSetupCat("");
    setSetupIncome("");setSetupAge("");setSetupArea("");setSetupHouse("");
    setSetupRation("");setSetupDisability("none");setSetupMarital("");setSetupCaste("");
    setSetupLandHolding("");setSetupKisanCard("");
    setSetupEducationLevel("");setSetupInstitutionType("");
    setSetupNumChildren("");setSetupHasGirls("");
    setGoogleEmail("");setGooglePhoto("");setEmailInput("");setPasswordInput("");setShowPassword(false);setEmailTab("signin");
    setStage("phone");
  };

  // ── On mount: if user is already authenticated but has no profile yet
  //    (returning from Google redirect, or auth restored from cache),
  //    pre-fill from Google account and jump straight to setup. ─────────────────
  useEffect(()=>{
    const user=auth.currentUser;
    if(!user||profile) return;
    setGoogleEmail(user.email||"");
    setGooglePhoto(user.photoURL||"");
    if(user.displayName) setSetupName(user.displayName);
    if(savedAnswers){
      if(savedAnswers.state){setSetupState(savedAnswers.state);setStateSearch(savedAnswers.state);}
      if(savedAnswers.who)    setSetupCat(savedAnswers.who);
      if(savedAnswers.income) setSetupIncome(savedAnswers.income);
      if(savedAnswers.age)    setSetupAge(savedAnswers.age);
      if(savedAnswers.area)   setSetupArea(savedAnswers.area);
      if(savedAnswers.house)  setSetupHouse(savedAnswers.house);
      if(savedAnswers.caste)  setSetupCaste(savedAnswers.caste);
    }
    setStage("setup1");
  },[]);

  // ── Google sign-in: popup first (instant, no page reload).
  //    If popup is blocked by the browser, fall back to redirect. ───────────────
  const handleGoogleSignIn=()=>{
    // ⚠️ signInWithPopup MUST be called synchronously here — before any
    // setState call — so the browser recognises it as a direct user gesture.
    const provider=new GoogleAuthProvider();
    const popupPromise=signInWithPopup(auth,provider);
    setGoogleLoading(true);setAuthError("");
    popupPromise.then(async result=>{
      const user=result.user;
      setGoogleEmail(user.email||"");
      setGooglePhoto(user.photoURL||"");
      // Show welcome toast regardless of new/returning user
      setLoginToast({name:user.displayName||user.email||"",photo:user.photoURL||""});
      setTimeout(()=>setLoginToast(null),3200);
      try{
        const snap=await getDoc(doc(db,"users",user.uid));
        if(snap.exists()){
          setProfile(snap.data());setStage("dashboard");
          setGoogleLoading(false); // reset spinner — toast already shown at line above
          return;
        }
      }catch{}
      if(user.displayName) setSetupName(user.displayName);
      if(savedAnswers){
        if(savedAnswers.state){setSetupState(savedAnswers.state);setStateSearch(savedAnswers.state);}
        if(savedAnswers.who)    setSetupCat(savedAnswers.who);
        if(savedAnswers.income) setSetupIncome(savedAnswers.income);
        if(savedAnswers.age)    setSetupAge(savedAnswers.age);
        if(savedAnswers.area)   setSetupArea(savedAnswers.area);
        if(savedAnswers.house)  setSetupHouse(savedAnswers.house);
        if(savedAnswers.caste)  setSetupCaste(savedAnswers.caste);
      }
      setStage("setup1");
      setGoogleLoading(false); // reset spinner for new user entering setup flow
    }).catch(err=>{
      if(err.code==="auth/popup-blocked"||err.code==="auth/popup-closed-by-user"){
        // Popup blocked — fall back to full-page redirect
        signInWithRedirect(auth,provider).catch(e=>{
          setAuthError(e.message||"Google sign-in failed. Please try again.");
          setGoogleLoading(false);
        });
      } else if(err.code!=="auth/cancelled-popup-request"){
        setAuthError(err.message||"Google sign-in failed. Please try again.");
        setGoogleLoading(false);
      }
    });
  };

  // ── Email validation helpers ────────────────────────────────────────────────
  const isValidEmail=(v)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValidPassword=(v)=>v.length>=6;

  const afterEmailAuth=(email)=>{
    setGoogleEmail(email);
    if(savedAnswers){
      if(savedAnswers.state){setSetupState(savedAnswers.state);setStateSearch(savedAnswers.state);}
      if(savedAnswers.who)    setSetupCat(savedAnswers.who);
      if(savedAnswers.income) setSetupIncome(savedAnswers.income);
      if(savedAnswers.age)    setSetupAge(savedAnswers.age);
      if(savedAnswers.area)   setSetupArea(savedAnswers.area);
      if(savedAnswers.house)  setSetupHouse(savedAnswers.house);
      if(savedAnswers.caste)  setSetupCaste(savedAnswers.caste);
    }
    setStage("setup1");
  };

  const handleEmailSignIn=async()=>{
    if(!isValidEmail(emailInput)){setAuthError(pt.invalidEmail);return;}
    if(!isValidPassword(passwordInput)){setAuthError(pt.weakPassword);return;}
    setEmailLoading(true);setAuthError("");
    try{
      await signInWithEmailAndPassword(auth,emailInput.trim(),passwordInput);
      // ── Returning user: load existing Firestore profile ──
      const uid=auth.currentUser?.uid;
      if(uid){
        try{
          const snap=await getDoc(doc(db,"users",uid));
          if(snap.exists()){
            setProfile(snap.data());
            setStage("dashboard");
            setLoginToast({name:auth.currentUser?.displayName||emailInput.trim()||"",photo:auth.currentUser?.photoURL||""});
            setTimeout(()=>setLoginToast(null),3200);
            return;
          }
        }catch{}
      }
      afterEmailAuth(emailInput.trim());
    }catch(err){
      const code=err.code||"";
      if(code==="auth/user-not-found"||code==="auth/wrong-password"||code==="auth/invalid-credential"){
        setAuthError(isHindi?"गलत ईमेल या पासवर्ड। फिर से जाँचें।":"Wrong email or password. Please check and try again.");
        setShowForgot(true); // ← reveal "Forgot Password?" only after a failed attempt
      }else if(code==="auth/too-many-requests"){
        setAuthError(isHindi?"बहुत अधिक प्रयास। कुछ देर बाद कोशिश करें।":"Too many attempts. Please try again later.");
        setShowForgot(true);
      }else{
        setAuthError(err.message||"Sign in failed. Please try again.");
      }
    }finally{setEmailLoading(false);}
  };

  const handleEmailSignUp=async()=>{
    if(!isValidEmail(emailInput)){setAuthError(pt.invalidEmail);return;}
    if(!isValidPassword(passwordInput)){setAuthError(pt.weakPassword);return;}
    setEmailLoading(true);setAuthError("");
    try{
      await createUserWithEmailAndPassword(auth,emailInput.trim(),passwordInput);
      afterEmailAuth(emailInput.trim());
    }catch(err){
      const code=err.code||"";
      if(code==="auth/email-already-in-use"){
        setAuthError(isHindi?"यह ईमेल पहले से उपयोग में है। साइन इन करें।":"This email is already registered. Please sign in instead.");
        setEmailTab("signin");
      }else if(code==="auth/weak-password"){
        setAuthError(pt.weakPassword);
      }else{
        setAuthError(err.message||"Account creation failed. Please try again.");
      }
    }finally{setEmailLoading(false);}
  };

  // ── Forgot Password ────────────────────────────────────────────────────────
  const handleForgotPassword=async()=>{
    if(!isValidEmail(emailInput)){setAuthError(pt.invalidEmail);return;}
    setForgotLoading(true);setForgotMsg("");setAuthError("");
    try{
      await sendPasswordResetEmail(auth,emailInput.trim());
      setForgotMsg("sent");
    }catch(err){
      const code=err?.code||"";
      console.error("Password reset error:",code,err?.message);
      // auth/user-not-found → show success anyway (security: don't reveal existence)
      if(code==="auth/user-not-found"){
        setForgotMsg("sent");
      }else if(code==="auth/invalid-email"){
        setAuthError(pt.invalidEmail);
      }else{
        // Likely cause: deployment domain not added to Firebase → Auth → Settings → Authorized domains
        setForgotMsg("error");
      }
    }finally{setForgotLoading(false);}
  };

  // Matched scheme count for dashboard
  const matchedCount=useMemo(()=>{
    if(!profile)return 0;
    const ans={
      who:profile.occupation,income:profile.income,
      house:profile.house,age:profile.age,
      area:profile.area,state:profile.state,
      caste:profile.caste||"general",
      // Adaptive fields included so match() sees the full picture
      ...(profile.landHolding?{landHolding:profile.landHolding}:{}),
      ...(profile.kisanCard?{kisanCard:profile.kisanCard}:{}),
      ...(profile.ration&&profile.ration!=="none"?{rationCard:profile.ration}:{}),
      ...(profile.educationLevel?{educationLevel:profile.educationLevel}:{}),
    };
    return SCHEME_DB.filter(s=>s.match(ans)).length;
  },[profile]);

  const filteredStates=useMemo(()=>INDIA_STATES.filter(s=>s.toLowerCase().includes(stateSearch.toLowerCase())),[stateSearch]);
  const catIcon=(v)=>({farmer:"🌾",student:"📚",women:"👩",senior:"👴",business:"💼",general:"🧑"})[v]||"🧑";
  const catDisplayLabel=(v)=>pt.categories.find(c=>c.v===v)?.l||v;

  // ── STAGE: PHONE ─────────────────────────────────────────────────────────────
  if(stage==="phone") return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
      <TriHeader>
        {/* ── Independent Platform badge ── */}
        <div style={{marginBottom:14}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:5,
            background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.28)",
            borderRadius:20,padding:"4px 11px"}}>
            <AshokaChakra size={11} color="#fff"/>
            <span style={{fontSize:9,fontWeight:800,color:"#fff",letterSpacing:0.9,textTransform:"uppercase"}}>
              {isHindi?"स्वतंत्र प्लेटफ़ॉर्म":"Independent Platform"}
            </span>
          </div>
        </div>

        {/* ── App name + subtitle ── */}
        <div style={{marginBottom:8}}>
          <div style={{color:"#fff",fontSize:25,fontWeight:900,fontFamily:bf,lineHeight:1.1,letterSpacing:-0.3}}>{pt.signInTitle}</div>
          <div style={{color:"rgba(255,255,255,0.72)",fontSize:11.5,marginTop:5,fontFamily:bf,letterSpacing:0.2}}>
            🇮🇳&nbsp; Yojana Sahay · Independent Civic Platform
          </div>
        </div>
        <div style={{color:"rgba(255,255,255,0.84)",fontSize:12.5,lineHeight:1.65,fontFamily:bf,marginBottom:12}}>{pt.signInSub}</div>

        {/* ── What you unlock — 2×2 benefit grid ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {pt.loginBenefits.map((b,i)=>(
            <div key={i} style={{
              background:"rgba(0,0,0,0.20)",
              border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:12,padding:"9px 11px",
              backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
            }}>
              <div style={{fontSize:10.5,fontWeight:700,color:"#fff",lineHeight:1.3,fontFamily:bf,marginBottom:4}}>{b.title}</div>
              <div style={{fontSize:9.5,color:"rgba(255,255,255,0.58)",lineHeight:1.45,fontFamily:bf}}>{b.sub}</div>
            </div>
          ))}
        </div>
      </TriHeader>

      <Card dark={dark}>
        {/* ── Section label ── */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <div style={{flex:1,height:1,background:dark?"rgba(255,255,255,0.08)":"#eee"}}/>
          <span style={{fontSize:10,fontWeight:800,letterSpacing:0.9,textTransform:"uppercase",color:dark?"#666":"#bbb",fontFamily:bf}}>
            {isHindi?"साइन इन का तरीका चुनें":"Choose a sign-in method"}
          </span>
          <div style={{flex:1,height:1,background:dark?"rgba(255,255,255,0.08)":"#eee"}}/>
        </div>
        {/* ── Google Sign-In button (ACTIVE) ── */}
        <div onClick={!googleLoading?()=>{haptic();handleGoogleSignIn();}:undefined}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            background:googleLoading?(dark?"#2c2c2e":"#f9f9f9"):"#fff",
            border:`1.5px solid ${googleLoading?"#4285F4":(dark?"#3a3a3c":"#e0e0e0")}`,
            borderRadius:14,padding:"14px 16px",cursor:googleLoading?"default":"pointer",
            boxShadow:googleLoading?"0 0 0 3px rgba(66,133,244,0.12)":"0 3px 14px rgba(66,133,244,0.10)",
            transition:"all 0.25s",userSelect:"none",opacity:googleLoading?0.85:1}}>
          {googleLoading
            ?<div className="google-spinner"/>
            :<svg width="20" height="20" viewBox="0 0 24 24" style={{flexShrink:0}}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          }
          <span style={{fontSize:15,fontWeight:700,color:googleLoading?"#4285F4":"#3c3c3c",fontFamily:bf,transition:"color 0.2s"}}>
            {googleLoading?(isHindi?"साइन इन हो रहे हैं...":"Signing in…"):pt.googleBtn}
          </span>
        </div>
        {authError&&!emailLoading&&<div style={{marginTop:10,fontSize:12,color:"#e53e3e",textAlign:"center",fontFamily:bf,padding:"8px 12px",background:"#FFF5F5",borderRadius:10,border:"1px solid #FED7D7"}}>{authError}</div>}
      </Card>

      {/* ── OR divider ── */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 28px"}}>
        <div style={{flex:1,height:1,background:dark?"#3a3a3c":"#e0e0e0"}}/>
        <span style={{fontSize:11,fontWeight:700,color:dark?"#555":"#bbb",letterSpacing:0.7}}>OR</span>
        <div style={{flex:1,height:1,background:dark?"#3a3a3c":"#e0e0e0"}}/>
      </div>

      {/* ── Email / Password Card (ACTIVE) ── */}
      <div style={{margin:"0 16px 14px",background:dark?"#1c1c1e":"#fff",borderRadius:20,padding:20,border:`1.5px solid ${dark?"#2c2c2e":"#f0f0f0"}`,boxShadow:dark?"0 6px 28px rgba(0,0,0,0.35)":"0 6px 28px rgba(0,0,0,0.10)"}}>

        {/* Card heading */}
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#003580,#1a56db)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
          </div>
          <div style={{fontSize:13,fontWeight:800,color:dark?"#f0f0f0":"#1a1a1a",fontFamily:bf}}>
            {isHindi?"ईमेल से साइन इन करें":"Sign in with Email"}
          </div>
        </div>

        {/* Sign In / Create Account tab switcher */}
        <div style={{display:"flex",background:dark?"#2c2c2e":"#f5f5f0",borderRadius:12,padding:3,marginBottom:18,gap:3}}>
          {[{key:"signin",label:pt.signInTab},{key:"signup",label:pt.createAcctTab}].map(tab=>{
            const active=emailTab===tab.key;
            return(
              <div key={tab.key} onClick={()=>{haptic();setEmailTab(tab.key);setAuthError("");setShowForgot(false);setForgotMsg("");}}
                style={{flex:1,padding:"9px 6px",borderRadius:10,textAlign:"center",fontSize:12.5,fontWeight:active?700:500,
                  background:active?(dark?"#1c1c1e":"#fff"):"transparent",
                  color:active?(dark?"#f0f0f0":"#1a1a1a"):(dark?"#666":"#aaa"),
                  cursor:"pointer",fontFamily:bf,
                  boxShadow:active?(dark?"0 1px 6px rgba(0,0,0,0.4)":"0 1px 6px rgba(0,0,0,0.10)"):"none",
                  transition:"all 0.22s cubic-bezier(0.22,1,0.36,1)",
                }}>
                {tab.label}
              </div>
            );
          })}
        </div>

        {/* Email field */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11.5,fontWeight:700,color:dark?"#aaa":"#555",marginBottom:6,fontFamily:bf,letterSpacing:0.3}}>
            📧 {pt.emailLabel}
          </div>
          <input
            type="email" inputMode="email" autoComplete="email"
            value={emailInput}
            onChange={e=>{setEmailInput(e.target.value);setAuthError("");setShowForgot(false);setForgotMsg("");}}
            placeholder={pt.emailPh}
            style={{
              width:"100%",padding:"13px 14px",borderRadius:13,
              border:`2px solid ${emailInput&&isValidEmail(emailInput)?"#138808":emailInput?"#e53e3e":(dark?"#3a3a3c":"#e8e8e8")}`,
              fontSize:14,outline:"none",fontFamily:bf,
              background:dark?"#2c2c2e":"#fff",color:dark?"#f0f0f0":"#1a1a1a",
              boxSizing:"border-box",transition:"border-color 0.2s",
            }}/>
        </div>

        {/* Password field */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11.5,fontWeight:700,color:dark?"#aaa":"#555",marginBottom:6,fontFamily:bf,letterSpacing:0.3}}>
            🔒 {pt.passwordLabel}
          </div>
          <div style={{position:"relative"}}>
            <input
              type={showPassword?"text":"password"}
              autoComplete={emailTab==="signin"?"current-password":"new-password"}
              value={passwordInput}
              onChange={e=>{setPasswordInput(e.target.value);setAuthError("");}}
              placeholder={emailTab==="signup"?pt.passwordPh:(lang==="hi"?"पासवर्ड दर्ज करें":"Enter your password")}
              style={{
                width:"100%",padding:"13px 46px 13px 14px",borderRadius:13,
                border:`2px solid ${passwordInput&&isValidPassword(passwordInput)?"#138808":passwordInput?"#e53e3e":(dark?"#3a3a3c":"#e8e8e8")}`,
                fontSize:14,outline:"none",fontFamily:bf,
                background:dark?"#2c2c2e":"#fff",color:dark?"#f0f0f0":"#1a1a1a",
                boxSizing:"border-box",transition:"border-color 0.2s",
              }}/>
            {/* Eye toggle */}
            <div onClick={()=>{haptic(30);setShowPassword(v=>!v);}}
              style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",cursor:"pointer",lineHeight:1,color:dark?"#666":"#aaa",userSelect:"none",display:"flex",alignItems:"center"}}>
              {showPassword
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </div>
          </div>
          {/* Forgot Password + new account hint */}
          {emailTab==="signin"&&(
            <div style={{marginTop:8,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
              {/* New-account hint — professional, no emoji */}
              <div style={{fontSize:10.5,color:dark?"#666":"#999",fontFamily:bf,lineHeight:1.4}}>
                {pt.forgotHint}
              </div>
              {/* Forgot Password link — only shown after a failed sign-in attempt */}
              {showForgot&&(
              <div
                onClick={()=>{
                  if(forgotLoading)return;
                  haptic(30);
                  handleForgotPassword();
                }}
                style={{
                  fontSize:11,fontWeight:700,fontFamily:bf,cursor:"pointer",
                  color:forgotLoading?"#aaa":(dark?"#6B90FF":"#003580"),
                  letterSpacing:0.1,userSelect:"none",
                  opacity:forgotLoading?0.6:1,
                  textDecoration:"underline",textUnderlineOffset:2,
                  WebkitTapHighlightColor:"transparent",
                }}>
                {forgotLoading?(isHindi?"भेज रहे हैं...":"Sending…"):pt.forgotPassword}
              </div>
              )}
            </div>
          )}
          {/* Forgot password feedback */}
          {emailTab==="signin"&&forgotMsg==="sent"&&(
            <div style={{marginTop:7,padding:"8px 12px",background:dark?"rgba(19,136,8,0.12)":"#F0FDF4",borderRadius:8,border:`1px solid ${dark?"rgba(19,136,8,0.25)":"#BBF7D0"}`}}>
              <span style={{fontSize:10.5,color:dark?"#34D058":"#166534",fontFamily:bf,lineHeight:1.4}}>{pt.forgotSent}</span>
            </div>
          )}
          {emailTab==="signin"&&forgotMsg==="error"&&(
            <div style={{marginTop:7,padding:"8px 12px",background:"#FFF5F5",borderRadius:8,border:"1px solid #FED7D7"}}>
              <span style={{fontSize:10.5,color:"#e53e3e",fontFamily:bf,lineHeight:1.4}}>{pt.forgotFail}</span>
            </div>
          )}
          {emailTab==="signup"&&passwordInput&&!isValidPassword(passwordInput)&&(
            <div style={{marginTop:5,fontSize:10.5,color:"#e53e3e",fontFamily:bf}}>
              {pt.weakPassword}
            </div>
          )}
        </div>

        {/* Error display */}
        {authError&&(
          <div style={{marginBottom:14,fontSize:12,color:"#e53e3e",fontFamily:bf,padding:"9px 12px",background:"#FFF5F5",borderRadius:10,border:"1px solid #FED7D7",lineHeight:1.4}}>
            {authError}
          </div>
        )}

        {/* Submit button */}
        <div
          onClick={()=>{
            if(emailLoading)return;
            haptic();
            emailTab==="signin"?handleEmailSignIn():handleEmailSignUp();
          }}
          className={emailLoading?"signin-loading":""}
          style={{
            background:emailLoading
              ?"linear-gradient(270deg,#1a3a8f,#1a56db,#003580,#1a56db)"
              :"linear-gradient(135deg,#003580,#1a56db)",
            backgroundSize:emailLoading?"200% auto":"100% 100%",
            borderRadius:14,padding:"15px 18px",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            fontSize:15,fontWeight:800,
            color:"#fff",cursor:emailLoading?"default":"pointer",fontFamily:bf,
            boxShadow:emailLoading?"0 6px 22px rgba(0,53,128,0.20)":"0 6px 24px rgba(0,53,128,0.38)",
            transition:"box-shadow 0.22s,opacity 0.22s",
            opacity:emailLoading?0.92:1,
            userSelect:"none",letterSpacing:0.2,
          }}>
          {emailLoading&&<div className="btn-spinner"/>}
          <span>
            {emailLoading
              ?(isHindi?"कृपया प्रतीक्षा करें...":"Please wait…")
              :(emailTab==="signin"?pt.signInBtn:pt.createAcctBtn)}
          </span>
          {!emailLoading&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.85}}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
        </div>
      </div>

      {/* ── OR divider before Phone ── */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"2px 28px 10px"}}>
        <div style={{flex:1,height:1,background:dark?"#3a3a3c":"#e8e8e8"}}/>
        <span style={{fontSize:10,fontWeight:600,color:dark?"#444":"#ccc",letterSpacing:0.5}}>OR</span>
        <div style={{flex:1,height:1,background:dark?"#3a3a3c":"#e8e8e8"}}/>
      </div>

      {/* ── Phone Sign-In (visible but COMING SOON — remove opacity + pointerEvents when billing is enabled) ── */}
      <div style={{opacity:0.5,pointerEvents:"none",margin:"0 16px 20px"}}>
        <div style={{background:dark?"#1c1c1e":"#fff",borderRadius:20,padding:20,
          border:`1.5px solid ${dark?"#3a3a3c":"#f0e8d8"}`,
          position:"relative",overflow:"hidden",
          boxShadow:dark?"0 4px 20px rgba(0,0,0,0.25)":"0 4px 20px rgba(255,153,51,0.06)"}}>
          {/* Subtle saffron top bar */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#FF9933,#FFB347,#FF9933)",opacity:0.6}}/>
          {/* COMING SOON badge — more premium */}
          <div style={{position:"absolute",top:14,right:14,
            background:"linear-gradient(135deg,#FF9933,#FF8C00)",
            borderRadius:20,padding:"4px 10px",
            fontSize:8.5,fontWeight:900,color:"#fff",letterSpacing:1,textTransform:"uppercase",
            boxShadow:"0 2px 8px rgba(255,140,0,0.35)"}}>
            ⏳ {isHindi?"जल्द आएगा":"COMING SOON"}
          </div>
          {/* Card heading */}
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14,paddingTop:4}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#FF9933,#FF8C00)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <div style={{fontSize:13,fontWeight:800,color:dark?"#f0f0f0":"#1a1a1a",fontFamily:bf}}>
              {isHindi?"मोबाइल नंबर से साइन इन":"Sign in with Mobile"}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",border:`2px solid ${dark?"#3a3a3c":"#e8e8e8"}`,borderRadius:14,overflow:"hidden",marginBottom:14}}>
            <div style={{padding:"14px 12px",borderRight:`1.5px solid ${dark?"#3a3a3c":"#e8e8e8"}`,background:dark?"#2c2c2e":"#f9f9f9",fontSize:14,fontWeight:700,color:dark?"#888":"#aaa",flexShrink:0}}>+91</div>
            <input type="tel" inputMode="numeric" maxLength={10} value={phone}
              onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
              placeholder={pt.phonePh}
              disabled
              style={{flex:1,border:"none",outline:"none",fontSize:15,padding:"14px 14px",background:"transparent",fontFamily:bf,color:dark?"#555":"#bbb",letterSpacing:1.5}}/>
          </div>
          <div style={{background:dark?"#2c2c2e":"#f0f0f0",borderRadius:14,padding:"15px",textAlign:"center",fontSize:14,fontWeight:700,color:dark?"#555":"#bbb",fontFamily:bf}}>
            {pt.getOtpBtn}
          </div>
          {/* recaptcha-container must remain in the DOM for when phone billing is enabled */}
          <div id="recaptcha-container"/>
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,padding:"2px 16px 14px"}}>
        {[
          {icon:"🔒",label:"SSL Secured",col:"#138808"},
          {icon:"🇮🇳",label:"India Platform",col:"#FF9933"},
          {icon:"🔥",label:"Firebase Auth",col:"#1a56db"},
        ].map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px"}}>
              <span style={{fontSize:11}}>{b.icon}</span>
              <span style={{fontSize:9.5,fontWeight:700,color:dark?"#555":b.col,fontFamily:bf,letterSpacing:0.2}}>{b.label}</span>
            </div>
            {i<2&&<div style={{width:1,height:14,background:dark?"#333":"#e0e0e0"}}/>}
          </div>
        ))}
      </div>

      {/* About & Helplines — unified premium card */}
      <div style={{padding:"0 20px 36px"}}>
        <div style={{
          borderRadius:16,overflow:"hidden",
          background:dark?"rgba(0,43,110,0.10)":"rgba(0,53,128,0.04)",
          border:`1.5px solid ${dark?"rgba(0,53,128,0.28)":"rgba(0,53,128,0.14)"}`,
          boxShadow:dark?"none":"0 1px 6px rgba(0,53,128,0.07)",
        }}>
          {/* About Yojana Sahay */}
          <div
            onClick={()=>{haptic();setShowAbout(true);}}
            style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"13px 14px",cursor:"pointer",
              borderBottom:`1px solid ${dark?"rgba(0,53,128,0.18)":"rgba(0,53,128,0.10)"}`,
              WebkitTapHighlightColor:"transparent",
              transition:"transform 0.12s",
            }}
            onTouchStart={e=>e.currentTarget.style.transform="scale(0.985)"}
            onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
            onTouchCancel={e=>e.currentTarget.style.transform="scale(1)"}
          >
            {/* Icon badge */}
            <div style={{
              width:38,height:38,borderRadius:11,flexShrink:0,
              background:dark?"rgba(0,53,128,0.24)":"rgba(0,53,128,0.09)",
              border:`1.5px solid ${dark?"rgba(0,53,128,0.40)":"rgba(0,53,128,0.18)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,
            }}>ℹ️</div>
            {/* Text */}
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:700,color:th.text,fontFamily:bf,lineHeight:1.2}}>
                {isHindi?"ऐप के बारे में जानें":"About Yojana Sahay"}
              </div>
              <div style={{fontSize:11,color:th.textSub,marginTop:2,fontFamily:bf}}>
                {isHindi?"मिशन, AI, टीम और अधिक":"Mission, AI, team & more"}
              </div>
            </div>
            {/* Chevron */}
            <div style={{
              width:28,height:28,borderRadius:8,flexShrink:0,
              background:dark?"rgba(0,53,128,0.18)":"rgba(0,53,128,0.07)",
              border:`1.5px solid ${dark?"rgba(0,53,128,0.30)":"rgba(0,53,128,0.14)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:dark?"rgba(100,150,255,0.90)":"rgba(0,53,128,0.65)",fontSize:15,fontWeight:700,
            }}>›</div>
          </div>
          {/* Government Helplines */}
          <div
            onClick={()=>{haptic();setShowHelpline(true);}}
            style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"13px 14px",cursor:"pointer",
              WebkitTapHighlightColor:"transparent",
              transition:"transform 0.12s",
            }}
            onTouchStart={e=>e.currentTarget.style.transform="scale(0.985)"}
            onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
            onTouchCancel={e=>e.currentTarget.style.transform="scale(1)"}
          >
            {/* Icon badge */}
            <div style={{
              width:38,height:38,borderRadius:11,flexShrink:0,
              background:dark?"rgba(0,53,128,0.24)":"rgba(0,53,128,0.09)",
              border:`1.5px solid ${dark?"rgba(0,53,128,0.40)":"rgba(0,53,128,0.18)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,
            }}>📞</div>
            {/* Text */}
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:700,color:th.text,fontFamily:bf,lineHeight:1.2}}>
                {isHindi?"सरकारी हेल्पलाइन":"Government Helplines"}
              </div>
              <div style={{fontSize:11,color:th.textSub,marginTop:2,fontFamily:bf}}>
                {isHindi?"112, PM-KISAN, स्वास्थ्य, महिला और अधिक":"112, PM-KISAN, Health, Women & more"}
              </div>
            </div>
            {/* Chevron */}
            <div style={{
              width:28,height:28,borderRadius:8,flexShrink:0,
              background:dark?"rgba(0,53,128,0.18)":"rgba(0,53,128,0.07)",
              border:`1.5px solid ${dark?"rgba(0,53,128,0.30)":"rgba(0,53,128,0.14)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:dark?"rgba(100,150,255,0.90)":"rgba(0,53,128,0.65)",fontSize:15,fontWeight:700,
            }}>›</div>
          </div>
        </div>
      </div>

      {/* ── About Screen Overlay (phone/logged-out stage) ── */}
      {showAbout&&(
        <div
          onTouchStart={e=>e.stopPropagation()}
          onTouchMove={e=>e.stopPropagation()}
          onTouchEnd={e=>e.stopPropagation()}
          style={{
          position:"fixed",inset:0,zIndex:900,
          background:THEME[dark?"dark":"light"].appBg,
          display:"flex",flexDirection:"column",
          fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif",
        }}>
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
            <Suspense fallback={<PremiumLoader/>}>
            <AboutTab onClose={()=>setShowAbout(false)} citizensGuided={liveCheckerTotal}/>
            </Suspense>
          </div>
        </div>
      )}

      {/* ── Helpline Screen Overlay (phone/logged-out stage) ── */}
      {showHelpline&&(
        <div
          onTouchStart={e=>e.stopPropagation()}
          onTouchMove={e=>e.stopPropagation()}
          onTouchEnd={e=>e.stopPropagation()}
          style={{
          position:"fixed",inset:0,zIndex:900,
          background:THEME[dark?"dark":"light"].appBg,
          display:"flex",flexDirection:"column",
          fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif",
        }}>
          <div style={{
            position:"sticky",top:0,zIndex:10,flexShrink:0,
            background:THEME[dark?"dark":"light"].card,
            borderBottom:`1px solid ${THEME[dark?"dark":"light"].border}`,
            padding:"12px 16px",
            display:"flex",alignItems:"center",gap:10,
            boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div onClick={()=>setShowHelpline(false)} style={{
              width:34,height:34,borderRadius:10,
              background:THEME[dark?"dark":"light"].card2,
              border:`1.5px solid ${THEME[dark?"dark":"light"].border}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,cursor:"pointer",flexShrink:0,
              color:THEME[dark?"dark":"light"].text,
            }}>←</div>
            <div style={{fontSize:16,fontWeight:800,color:THEME[dark?"dark":"light"].text}}>
              {lang==="hi"?"📞 सरकारी हेल्पलाइन":"📞 Government Helplines"}
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
            <Suspense fallback={<PremiumLoader/>}>
            <Helpline lang={lang} dark={dark}/>
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );

  // ── STAGE: OTP ───────────────────────────────────────────────────────────────
  if(stage==="otp"){
    const otpFull=otp.join("").length===6;
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
        <TriHeader>
          <div onClick={()=>{haptic();setStage("phone");}}
            style={{display:"inline-flex",alignItems:"center",gap:6,color:"rgba(255,255,255,0.82)",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:18,background:"rgba(255,255,255,0.14)",borderRadius:20,padding:"5px 13px",border:"1px solid rgba(255,255,255,0.22)"}}>
            ← {isHindi?"वापस":"Back"}
          </div>
          <div style={{color:"#fff",fontSize:21,fontWeight:800,fontFamily:bf,marginBottom:5}}>{pt.otpTitle}</div>
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,fontFamily:bf}}>{pt.otpSub(phone)}</div>
        </TriHeader>

        <Card dark={dark}>
          {/* 6-box OTP input */}
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:22}} onPaste={handleOtpPaste}>
            {otp.map((digit,i)=>(
              <input key={i} ref={el=>otpRefs.current[i]=el}
                type="tel" inputMode="numeric" maxLength={1} value={digit}
                onChange={e=>handleOtpChange(i,e.target.value)}
                onKeyDown={e=>handleOtpKey(i,e)}
                autoFocus={i===0}
                style={{width:44,height:54,textAlign:"center",fontSize:22,fontWeight:700,color:th.text,border:`2px solid ${digit?"#FF9933":th.border3}`,borderRadius:13,outline:"none",background:digit?th.optionActive:th.inputBg,transition:"all 0.15s",fontFamily:"monospace"}}/>
            ))}
          </div>

          <div onClick={!authLoading?()=>{haptic();handleVerify();}:undefined}
            style={{background:otpFull&&!authLoading?"linear-gradient(135deg,#003580,#1a56db)":"#ddd",borderRadius:14,padding:15,textAlign:"center",fontSize:15,fontWeight:700,color:"#fff",cursor:otpFull&&!authLoading?"pointer":"default",fontFamily:bf,boxShadow:otpFull&&!authLoading?"0 6px 22px rgba(0,53,128,0.36)":"none",transition:"all 0.22s",marginBottom:16}}>
            {authLoading?(isHindi?"जाँच रहे हैं...":"Verifying…"):pt.verifyBtn}
          </div>

          <div style={{textAlign:"center"}}>
            {timerOn
              ?<div style={{fontSize:12,color:"#aaa",fontFamily:bf}}>{pt.resendIn(timer)}</div>
              :<div onClick={()=>{haptic();handleGetOtp();setOtp(["","","","","",""]);setTimeout(()=>otpRefs.current[0]?.focus(),0);}}
                style={{fontSize:13,fontWeight:700,color:"#FF8C00",cursor:"pointer",textDecoration:"underline",fontFamily:bf}}>{pt.resendBtn}</div>
            }
          </div>
          {authError&&<div style={{marginTop:12,fontSize:12,color:"#e53e3e",textAlign:"center",fontFamily:bf,padding:"8px 12px",background:"#FFF5F5",borderRadius:10,border:"1px solid #FED7D7"}}>{authError}</div>}
        </Card>
      </div>
    );
  }

  // ── STAGE: SETUP 1 — Name + Gender ──────────────────────────────────────────
  if(stage==="setup1"){
    const canNext=setupName.trim().length>=2&&!!setupGender;
    // Extracted from IIFE — computed once per render, not inside JSX
    const isPhoneUser=auth.currentUser?.providerData?.some(p=>p.providerId==="phone");
    const phoneValid=phone.length===0||phone.length===10;
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
        <TriHeader bg="linear-gradient(135deg,#003580 0%,#1a56db 100%)">
          {/* Progress bar — 4 steps */}
          <div style={{display:"flex",gap:6,marginBottom:18}}>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"rgba(255,255,255,0.22)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"rgba(255,255,255,0.22)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"rgba(255,255,255,0.22)"}}/>
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:10.5,fontWeight:700,letterSpacing:0.9,marginBottom:5,textTransform:"uppercase"}}>{pt.step1of4}</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:800,fontFamily:bf,marginBottom:3}}>{pt.step1Title}</div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,fontFamily:bf}}>{pt.fillOnce}</div>
        </TriHeader>

        <Card dark={dark}>
          {/* Name */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>👤 {pt.nameLabel}</div>
            <input value={setupName} onChange={e=>setSetupName(e.target.value)} placeholder={pt.namePh}
              style={{width:"100%",padding:"13px 16px",borderRadius:14,border:`2px solid ${setupName.trim().length>=2?"#138808":th.border3}`,fontSize:14,outline:"none",fontFamily:bf,background:th.inputBg,color:th.text,boxSizing:"border-box",transition:"border-color 0.2s"}}/>
          </div>

          {/* Gender */}
          <div style={{marginBottom:22}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>⚧ {pt.genderLabel}</div>
            <div style={{display:"flex",gap:8}}>
              {pt.genders.map(g=>{
                const a=setupGender===g.v;
                return(
                  <div key={g.v} onClick={()=>{haptic();setSetupGender(g.v);}}
                    style={{flex:1,padding:"12px 6px",borderRadius:13,border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,textAlign:"center",cursor:"pointer",fontSize:12,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none"}}>
                    {g.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional phone number — shown for Google/email users; read-only for phone-auth users */}
          <div style={{marginBottom:22}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{fontSize:12,fontWeight:700,color:th.textMid,fontFamily:bf,letterSpacing:0.3}}>
                    📱 {isHindi?"मोबाइल नंबर":"Mobile Number"}
                  </div>
                  {!isPhoneUser&&(
                    <span style={{fontSize:10,fontWeight:500,color:th.textSub,background:th.pillBg,borderRadius:20,padding:"1px 8px",border:`1px solid ${th.border3}`}}>
                      {isHindi?"वैकल्पिक":"optional"}
                    </span>
                  )}
                </div>
                {!isPhoneUser&&(
                  <div style={{fontSize:10.5,color:th.textSub,marginBottom:8,fontFamily:bf,lineHeight:1.45}}>
                    {isHindi?"योजना की समय-सीमा के SMS अलर्ट पाने के लिए जोड़ें":"Add to receive SMS alerts about scheme deadlines"}
                  </div>
                )}
                {isPhoneUser?(
                  /* Phone-auth users: show their number read-only */
                  <div style={{display:"flex",alignItems:"center",border:`2px solid ${th.border3}`,borderRadius:14,overflow:"hidden",background:th.card2,opacity:0.75}}>
                    <div style={{padding:"13px 12px",borderRight:`1.5px solid ${th.border3}`,fontSize:14,fontWeight:700,color:th.textMid,flexShrink:0}}>+91</div>
                    <div style={{flex:1,padding:"13px 14px",fontSize:15,color:th.text,fontFamily:"monospace",letterSpacing:1}}>
                      {phone||"—"}
                    </div>
                    <div style={{paddingRight:12,fontSize:13,fontWeight:700,color:"#138808"}}>🔒</div>
                  </div>
                ):(
                  /* Google/email users: optional editable field */
                  <div style={{display:"flex",alignItems:"center",border:`2px solid ${phone.length===10?"#138808":phone.length>0&&!phoneValid?"#e53e3e":th.border3}`,borderRadius:14,overflow:"hidden",transition:"border-color 0.2s"}}>
                    <div style={{padding:"13px 12px",borderRight:`1.5px solid ${th.border3}`,background:th.card2,fontSize:14,fontWeight:700,color:th.textMid,flexShrink:0}}>+91</div>
                    <input
                      type="tel" inputMode="numeric" maxLength={10}
                      value={phone}
                      onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                      placeholder={isHindi?"10 अंकों का नंबर":"10-digit number"}
                      style={{flex:1,border:"none",outline:"none",fontSize:15,padding:"13px 14px",background:"transparent",fontFamily:bf,color:th.text,letterSpacing:1}}
                    />
                    {phone.length===10&&<div style={{paddingRight:12,fontSize:16,color:"#138808"}}>✓</div>}
                  </div>
                )}
              </div>

          <div onClick={()=>{if(canNext)haptic();handleSetup1Next();}}
            style={{background:canNext?"linear-gradient(135deg,#FF9933,#FF8C00)":"#ddd",borderRadius:14,padding:15,textAlign:"center",fontSize:15,fontWeight:700,color:"#fff",cursor:canNext?"pointer":"default",fontFamily:bf,boxShadow:canNext?"0 6px 22px rgba(255,153,51,0.42)":"none",transition:"all 0.22s"}}>
            {pt.nextBtn}
          </div>
        </Card>
      </div>
    );
  }

  // ── STAGE: SETUP 2 — State + Category ────────────────────────────────────────
  if(stage==="setup2"){
    const canSave=!!setupState&&!!setupCat;
    const hasPrefill=!!(savedAnswers?.state||savedAnswers?.who);
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
        <TriHeader bg="linear-gradient(135deg,#003580 0%,#1a56db 100%)">
          <div style={{display:"flex",gap:6,marginBottom:18}}>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"rgba(255,255,255,0.22)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"rgba(255,255,255,0.22)"}}/>
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:10.5,fontWeight:700,letterSpacing:0.9,marginBottom:5,textTransform:"uppercase"}}>{pt.step2of4}</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:800,fontFamily:bf,marginBottom:3}}>{pt.step2Title}</div>
          {hasPrefill&&<div style={{color:"rgba(255,220,100,0.92)",fontSize:11,fontFamily:bf,marginTop:4}}>✓ {pt.prefilled}</div>}
        </TriHeader>

        <Card dark={dark}>
          {/* State — tap-to-select scrollable list (no typing) */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>📍 {pt.stateLabel}</div>
            {setupState&&(
              <div style={{fontSize:11.5,color:"#138808",fontWeight:700,fontFamily:bf,marginBottom:7,display:"flex",alignItems:"center",gap:5}}>
                <span>✓</span><span>{setupState}</span>
              </div>
            )}
            <div style={{
              background:th.card,borderRadius:13,
              border:`2px solid ${setupState?"#138808":"#FF9933"}`,
              maxHeight:216,overflowY:"auto",
              boxShadow:"0 4px 16px rgba(0,0,0,0.09)",
              WebkitOverflowScrolling:"touch",
            }}>
              {INDIA_STATES.map((s,i)=>{
                const sel=setupState===s;
                return(
                  <div key={s} onClick={()=>{haptic();setSetupState(s);setStateSearch(s);}}
                    style={{
                      padding:"11px 14px",
                      borderBottom:i<INDIA_STATES.length-1?`1px solid ${th.divider}`:"none",
                      cursor:"pointer",fontSize:13,fontFamily:bf,
                      background:sel?(dark?"#2d1800":"#FFF7ED"):th.card,
                      color:sel?"#CC6600":th.text,
                      fontWeight:sel?700:400,
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      transition:"background 0.15s",
                    }}>
                    <span>{s}</span>
                    {sel&&<span style={{color:"#138808",fontSize:15,fontWeight:700}}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div style={{marginBottom:22}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>💼 {pt.catLabel}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {pt.categories.map(c=>{
                const a=setupCat===c.v;
                return(
                  <div key={c.v} onClick={()=>{haptic();setSetupCat(c.v);}}
                    style={{padding:"11px 10px",borderRadius:13,border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,cursor:"pointer",fontSize:12,fontWeight:a?700:400,color:a?"#CC6600":th.text,fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none",textAlign:"center"}}>
                    {c.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Caste Category */}
          <div style={{marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:th.textMid,fontFamily:bf,letterSpacing:0.3}}>🪪 {T[lang].fields.caste}</div>
              <span style={{fontSize:10,fontWeight:500,color:th.textSub,background:th.pillBg,borderRadius:20,padding:"1px 8px",border:`1px solid ${th.border3}`}}>
                {isHindi?"पात्रता मिलान के लिए":"For scheme matching"}
              </span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {T[lang].fields.castes.map(c=>{
                const a=setupCaste===c.v;
                const accentColor=c.v==="sc"||c.v==="st"?"#7C3AED":c.v==="obc"?"#1D4ED8":c.v==="ews"?"#D97706":"#138808";
                return(
                  <div key={c.v} onClick={()=>{haptic();setSetupCaste(c.v);}}
                    style={{
                      padding:"11px 10px",borderRadius:13,cursor:"pointer",
                      border:`2px solid ${a?accentColor:th.border3}`,
                      background:a?(dark?`${accentColor}22`:`${accentColor}10`):th.optionBg,
                      fontSize:12,fontWeight:a?700:400,
                      color:a?(dark?`${accentColor}ee`:accentColor):th.text,
                      fontFamily:bf,transition:"all 0.18s",
                      boxShadow:a?`0 4px 14px ${accentColor}33`:"none",textAlign:"center",
                    }}>
                    {c.l}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{display:"flex",gap:8}}>
            <div onClick={()=>{haptic();setStage("setup1");}}
              style={{flex:1,padding:14,borderRadius:14,border:`1.5px solid ${th.border3}`,background:th.card,textAlign:"center",fontSize:13,fontWeight:600,color:th.textMid,cursor:"pointer",fontFamily:bf}}>
              {pt.backBtn}
            </div>
            <div onClick={()=>{if(canSave)haptic();handleSetup2Next();}}
              style={{flex:2,background:canSave?"linear-gradient(135deg,#FF9933,#FF8C00)":"#ddd",borderRadius:14,padding:14,textAlign:"center",fontSize:14,fontWeight:700,color:"#fff",cursor:canSave?"pointer":"default",fontFamily:bf,boxShadow:canSave?"0 6px 22px rgba(255,153,51,0.42)":"none",transition:"all 0.22s"}}>
              {pt.nextBtn}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── STAGE: SETUP 3 — Ration Card + Disability + Marital Status ──────────────
  if(stage==="setup3"){
    const hasDisability=setupDisability!=="none"&&setupDisability!=="";
    const fields=T[lang].fields; // reuse existing T translations for income/age/area/house labels
    const canSave=!!setupIncome&&!!setupAge&&!!setupArea&&!!setupHouse&&!!setupRation&&!!setupDisability&&!!setupMarital;
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
        <TriHeader bg="linear-gradient(135deg,#138808 0%,#16a34a 60%,#003580 100%)">
          {/* Progress bar — 3 of 4 filled */}
          <div style={{display:"flex",gap:6,marginBottom:18}}>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            <div style={{height:4,flex:1,borderRadius:4,background:"rgba(255,255,255,0.22)"}}/>
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:10.5,fontWeight:700,letterSpacing:0.9,marginBottom:5,textTransform:"uppercase"}}>{pt.step3of4}</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:800,fontFamily:bf,marginBottom:3}}>{pt.step3Title}</div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,fontFamily:bf}}>
            {isHindi?"ये जानकारी सटीक योजना मिलान के लिए ज़रूरी है":"Required for accurate scheme matching"}
          </div>
        </TriHeader>

        <Card dark={dark}>

          {/* ── Annual Income (Bug 4 fix: collected here, not assumed from eligibility checker) ── */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>💰 {fields.income}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {fields.incomes.map(o=>{
                const a=setupIncome===o.v;
                return(
                  <div key={o.v} onClick={()=>{haptic();setSetupIncome(o.v);}}
                    style={{padding:"11px 8px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,fontSize:11.5,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 12px rgba(255,153,51,0.22)":"none",lineHeight:1.35}}>
                    {o.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Age Group ── */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>🎂 {fields.age}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {fields.ages.map(o=>{
                const a=setupAge===o.v;
                return(
                  <div key={o.v} onClick={()=>{haptic();setSetupAge(o.v);}}
                    style={{padding:"11px 8px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#003580":th.border3}`,background:a?(dark?"rgba(0,53,128,0.22)":"rgba(0,53,128,0.1)"):th.optionBg,fontSize:11.5,fontWeight:a?700:400,color:a?(dark?"#7ba7f0":"#003580"):th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 12px rgba(0,53,128,0.22)":"none",lineHeight:1.35}}>
                    {o.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Area Type ── */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>📍 {fields.area}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {fields.areas.map(o=>{
                const a=setupArea===o.v;
                return(
                  <div key={o.v} onClick={()=>{haptic();setSetupArea(o.v);}}
                    style={{padding:"11px 6px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#138808":th.border3}`,background:a?(dark?"rgba(19,136,8,0.22)":"rgba(19,136,8,0.1)"):th.optionBg,fontSize:11,fontWeight:a?700:400,color:a?(dark?"#4ade80":"#138808"):th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 12px rgba(19,136,8,0.22)":"none",lineHeight:1.45}}>
                    {o.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Pucca House ── */}
          <div style={{marginBottom:22}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>🏠 {fields.house}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {fields.houses.map(o=>{
                const a=setupHouse===o.v;
                return(
                  <div key={o.v} onClick={()=>{haptic();setSetupHouse(o.v);}}
                    style={{padding:"11px 6px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,fontSize:11,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 12px rgba(255,153,51,0.22)":"none",lineHeight:1.45}}>
                    {o.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Ration Card ── */}
          <div style={{marginBottom:22}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:10,fontFamily:bf,letterSpacing:0.3}}>
              🪪 {pt.rationLabel}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {pt.rations.map(r=>{
                const a=setupRation===r.v;
                const accentColor=r.v==="aay"?"#DC2626":r.v==="bpl"?"#D97706":r.v==="apl"?"#2563EB":"#6B7280";
                return(
                  <div key={r.v} onClick={()=>{haptic();setSetupRation(r.v);}}
                    style={{
                      padding:"12px 10px",borderRadius:13,cursor:"pointer",fontFamily:bf,
                      border:`2px solid ${a?accentColor:th.border3}`,
                      background:a?(dark?`${accentColor}22`:`${accentColor}10`):th.optionBg,
                      fontSize:11.5,fontWeight:a?700:400,
                      color:a?accentColor:th.textMid,
                      transition:"all 0.18s",
                      boxShadow:a?`0 4px 14px ${accentColor}33`:"none",
                      textAlign:"center",lineHeight:1.4,
                    }}>
                    {r.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Disability ── */}
          <div style={{marginBottom:22}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:10,fontFamily:bf,letterSpacing:0.3}}>
              ♿ {pt.disabilityLabel}
            </div>
            {/* Yes / No toggle */}
            <div style={{display:"flex",gap:8,marginBottom: hasDisability?12:0}}>
              {[
                {v:"none", l:pt.disabilityNone, color:"#138808"},
                {v:"_yes", l:pt.disabilityYes,  color:"#7C3AED"},
              ].map(opt=>{
                const isYes=opt.v==="_yes";
                const isActive=isYes?hasDisability:setupDisability==="none";
                return(
                  <div key={opt.v} onClick={()=>{haptic();if(isYes){if(!hasDisability)setSetupDisability("physical");}else{setSetupDisability("none");}}}
                    style={{
                      flex:1,padding:"12px 8px",borderRadius:13,cursor:"pointer",
                      border:`2px solid ${isActive?opt.color:th.border3}`,
                      background:isActive?(dark?`${opt.color}22`:`${opt.color}12`):th.optionBg,
                      fontSize:12,fontWeight:isActive?700:400,
                      color:isActive?opt.color:th.textMid,
                      fontFamily:bf,transition:"all 0.18s",
                      boxShadow:isActive?`0 4px 14px ${opt.color}33`:"none",
                      textAlign:"center",
                    }}>
                    {opt.l}
                  </div>
                );
              })}
            </div>
            {/* Disability type — shown only when "Yes" */}
            {hasDisability&&(
              <div style={{
                background:dark?"rgba(124,58,237,0.1)":"rgba(124,58,237,0.05)",
                border:`1.5px solid ${dark?"rgba(124,58,237,0.4)":"rgba(124,58,237,0.2)"}`,
                borderRadius:14,padding:"12px 12px 10px",
              }}>
                <div style={{fontSize:11,fontWeight:700,color:"#7C3AED",marginBottom:10,fontFamily:bf,letterSpacing:0.4}}>
                  {pt.disabilityTypeLabel}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  {pt.disabilityTypes.map(dt=>{
                    const a=setupDisability===dt.v;
                    return(
                      <div key={dt.v} onClick={()=>{haptic();setSetupDisability(dt.v);}}
                        style={{
                          padding:"10px 8px",borderRadius:11,cursor:"pointer",fontFamily:bf,
                          border:`2px solid ${a?"#7C3AED":th.border3}`,
                          background:a?(dark?"rgba(124,58,237,0.22)":"rgba(124,58,237,0.1)"):th.optionBg,
                          fontSize:11.5,fontWeight:a?700:400,
                          color:a?"#7C3AED":th.textMid,
                          transition:"all 0.18s",textAlign:"center",lineHeight:1.4,
                          boxShadow:a?"0 4px 12px rgba(124,58,237,0.28)":"none",
                        }}>
                        {dt.l}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Marital Status ── */}
          <div style={{marginBottom:26}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:10,fontFamily:bf,letterSpacing:0.3}}>
              💍 {pt.maritalLabel}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {pt.maritals.map(m=>{
                const a=setupMarital===m.v;
                const accentColor=m.v==="widowed"?"#DC2626":m.v==="married"?"#FF9933":"#003580";
                return(
                  <div key={m.v} onClick={()=>{haptic();setSetupMarital(m.v);}}
                    style={{
                      padding:"12px 10px",borderRadius:13,cursor:"pointer",fontFamily:bf,
                      border:`2px solid ${a?accentColor:th.border3}`,
                      background:a?(dark?`${accentColor}22`:`${accentColor}10`):th.optionBg,
                      fontSize:12,fontWeight:a?700:400,
                      color:a?accentColor:th.textMid,
                      transition:"all 0.18s",
                      boxShadow:a?`0 4px 14px ${accentColor}33`:"none",
                      textAlign:"center",lineHeight:1.4,
                    }}>
                    {m.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{display:"flex",gap:8}}>
            <div onClick={()=>{haptic();setStage("setup2");}}
              style={{flex:1,padding:14,borderRadius:14,border:`1.5px solid ${th.border3}`,background:th.card,textAlign:"center",fontSize:13,fontWeight:600,color:th.textMid,cursor:"pointer",fontFamily:bf}}>
              {pt.backBtn}
            </div>
            <div onClick={()=>{if(canSave)haptic();handleSetup3Next();}}
              style={{flex:2,background:canSave?"linear-gradient(135deg,#FF9933,#FF8C00)":"#ddd",borderRadius:14,padding:14,textAlign:"center",fontSize:14,fontWeight:700,color:"#fff",cursor:canSave?"pointer":"default",fontFamily:bf,boxShadow:canSave?"0 6px 22px rgba(255,153,51,0.38)":"none",transition:"all 0.22s"}}>
              {pt.nextBtn}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── STAGE: SETUP 4 — Occupation-conditional + Children ──────────────────────
  if(stage==="setup4"){
    const isFarmer=setupCat==="farmer";
    const isStudent=setupCat==="student";
    const hasChildren=setupNumChildren&&setupNumChildren!=="0";
    const occupationValid=
      isFarmer?(setupLandHolding&&setupKisanCard):
      isStudent?(setupEducationLevel&&setupInstitutionType):
      true;
    const canSave=occupationValid&&setupNumChildren&&(hasChildren?!!setupHasGirls:true);
    return(
      <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>
        <TriHeader bg="linear-gradient(135deg,#138808 0%,#16a34a 60%,#003580 100%)">
          {/* Progress bar — all 4 filled */}
          <div style={{display:"flex",gap:6,marginBottom:18}}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{height:4,flex:1,borderRadius:4,background:"#FF9933",boxShadow:"0 0 8px rgba(255,153,51,0.5)"}}/>
            ))}
          </div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:10.5,fontWeight:700,letterSpacing:0.9,marginBottom:5,textTransform:"uppercase"}}>{pt.step4of4}</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:800,fontFamily:bf,marginBottom:3}}>{pt.step4Title}</div>
          <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,fontFamily:bf}}>
            {isHindi?"AI को सटीक योजनाएं सुझाने में मदद करता है":"Helps AI suggest the most accurate schemes"}
          </div>
        </TriHeader>

        <Card dark={dark}>
          {/* ── Farmer: Land Holding ── */}
          {isFarmer&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>🌾 {pt.landHoldingLabel}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {pt.landHoldings.map(o=>{
                  const a=setupLandHolding===o.v;
                  return(
                    <div key={o.v} onClick={()=>{haptic();setSetupLandHolding(o.v);}}
                      style={{padding:"12px 10px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,fontSize:12.5,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none"}}>
                      {o.l}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Farmer: Kisan Credit Card ── */}
          {isFarmer&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>💳 {pt.kisanCardLabel}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {pt.kisanCards.map(o=>{
                  const a=setupKisanCard===o.v;
                  return(
                    <div key={o.v} onClick={()=>{haptic();setSetupKisanCard(o.v);}}
                      style={{padding:"12px 10px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,fontSize:12.5,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none"}}>
                      {o.l}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Student: Education Level ── */}
          {isStudent&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>📚 {pt.educationLevelLabel}</div>
              {pt.educationLevels.map(o=>{
                const a=setupEducationLevel===o.v;
                return(
                  <div key={o.v} onClick={()=>{haptic();setSetupEducationLevel(o.v);}}
                    style={{padding:"12px 14px",borderRadius:13,cursor:"pointer",marginBottom:8,border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,fontSize:12.5,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none"}}>
                    {o.l}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Student: Institution Type ── */}
          {isStudent&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:8,fontFamily:bf,letterSpacing:0.3}}>🏫 {pt.institutionTypeLabel}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {pt.institutionTypes.map(o=>{
                  const a=setupInstitutionType===o.v;
                  return(
                    <div key={o.v} onClick={()=>{haptic();setSetupInstitutionType(o.v);}}
                      style={{padding:"12px 10px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,fontSize:12.5,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none"}}>
                      {o.l}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Number of Children (all occupations) ── */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:4,fontFamily:bf,letterSpacing:0.3}}>👶 {pt.numChildrenLabel}</div>
            <div style={{fontSize:10.5,color:th.textSub,marginBottom:8,fontFamily:bf}}>
              {isHindi?"सुकन्या समृद्धि, बेटी बचाओ, लाडली योजनाओं के लिए":"Unlocks Sukanya Samriddhi, Beti Bachao, Ladli & more"}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {pt.numChildrenOpts.map(o=>{
                const a=setupNumChildren===o.v;
                return(
                  <div key={o.v} onClick={()=>{haptic();setSetupNumChildren(o.v);if(o.v==="0")setSetupHasGirls("no");}}
                    style={{padding:"12px 10px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,fontSize:12.5,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none"}}>
                    {o.l}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Has Girl Children (shown only when numChildren > 0) ── */}
          {hasChildren&&(
            <div style={{marginBottom:24}}>
              <div style={{fontSize:12,fontWeight:700,color:th.textMid,marginBottom:4,fontFamily:bf,letterSpacing:0.3}}>👧 {pt.hasGirlsLabel}</div>
              <div style={{fontSize:10.5,color:th.textSub,marginBottom:8,fontFamily:bf}}>
                {isHindi?"NSP, किशोरी शक्ति योजना की पात्रता के लिए":"For NSP, Kishori Shakti Yojana eligibility"}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {pt.hasGirlsOpts.map(o=>{
                  const a=setupHasGirls===o.v;
                  return(
                    <div key={o.v} onClick={()=>{haptic();setSetupHasGirls(o.v);}}
                      style={{padding:"12px 10px",borderRadius:13,cursor:"pointer",border:`2px solid ${a?"#FF9933":th.border3}`,background:a?th.optionActive:th.optionBg,fontSize:12.5,fontWeight:a?700:400,color:a?"#CC6600":th.textMid,textAlign:"center",fontFamily:bf,transition:"all 0.18s",boxShadow:a?"0 4px 14px rgba(255,153,51,0.22)":"none"}}>
                      {o.l}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back + Save buttons */}
          <div style={{display:"flex",gap:8}}>
            <div onClick={()=>{haptic();setStage("setup3");}}
              style={{flex:1,padding:14,borderRadius:14,border:`1.5px solid ${th.border3}`,background:th.card,textAlign:"center",fontSize:13,fontWeight:600,color:th.textMid,cursor:"pointer",fontFamily:bf}}>
              {pt.backBtn}
            </div>
            <div onClick={()=>{if(canSave){haptic([50,60,50]);handleSetup4Save();}}}
              style={{flex:2,background:canSave?"linear-gradient(135deg,#138808,#16a34a)":"#ddd",borderRadius:14,padding:14,textAlign:"center",fontSize:14,fontWeight:700,color:"#fff",cursor:canSave?"pointer":"default",fontFamily:bf,boxShadow:canSave?"0 6px 22px rgba(19,136,8,0.38)":"none",transition:"all 0.22s"}}>
              {pt.saveBtn}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── STAGE: DASHBOARD ─────────────────────────────────────────────────────────
  const initials=(profile?.name||"U").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  const maskedPhone=
    profile?.phone
      ?`+91 ${profile.phone.slice(0,5)} ••••••`
      :profile?.email
        ?profile.email
        :null;  // nothing to show if no phone and no email

  // Profile completeness score
  const profileFields=[profile?.name,profile?.gender,profile?.state,profile?.occupation,profile?.caste,profile?.income,profile?.age,profile?.area,profile?.house,profile?.ration,profile?.marital];
  const completeness=Math.round((profileFields.filter(Boolean).length/profileFields.length)*100);
  const incomeLabel=T[lang].fields.incomes.find(i=>i.v===profile?.income)?.l||profile?.income||"—";
  const ageLabel=T[lang].fields.ages.find(a=>a.v===profile?.age)?.l||profile?.age||"—";
  const areaLabel=T[lang].fields.areas.find(a=>a.v===profile?.area)?.l||profile?.area||"—";
  const houseVal=profile?.house==="yes"?(isHindi?"पक्का मकान":"Pucca House"):profile?.house==="no"?(isHindi?"मकान नहीं":"No House"):(isHindi?"कच्चा":"Kutcha");

  // Welfare card variables — extracted from IIFE so they're computed once, not inside JSX
  const welfareRationLabel=pt.rations.find(r=>r.v===profile?.ration)?.l||null;
  const welfareMaritalLabel=pt.maritals.find(m=>m.v===profile?.marital)?.l||null;
  const welfareDisabilityLabel=profile?.disability==="none"
    ?pt.disabilityNone
    :(pt.disabilityTypes.find(d=>d.v===profile?.disability)?.l||pt.disabilityYes);
  const welfareRationColor=profile?.ration==="aay"?"#DC2626":profile?.ration==="bpl"?"#D97706":profile?.ration==="apl"?"#2563EB":"#6B7280";
  const welfareMaritalColor=profile?.marital==="widowed"?"#DC2626":profile?.marital==="married"?"#FF9933":"#003580";
  const welfareDisabilityColor=profile?.disability==="none"?"#138808":"#7C3AED";

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:th.appBg,overflowY:"auto"}}>

      {/* ── OFFICIAL PROFILE HEADER ── */}
      <div style={{
        background:"linear-gradient(160deg,#002060 0%,#003580 50%,#06038D 100%)",
        padding:"44px 20px 0",position:"relative",overflow:"hidden",flexShrink:0,
      }}>
        {/* Tricolor accent bar at top */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,display:"flex",zIndex:2}}>
          <div style={{flex:1,background:"#FF9933"}}/>
          <div style={{flex:1,background:"#fff"}}/>
          <div style={{flex:1,background:"#138808"}}/>
        </div>
        {/* Ashoka Chakra watermarks */}
        <div style={{position:"absolute",right:-35,top:5,opacity:0.06,pointerEvents:"none"}}>
          <AshokaChakra size={190} color="#ffffff"/>
        </div>
        <div style={{position:"absolute",left:-55,bottom:-15,opacity:0.04,pointerEvents:"none"}}>
          <AshokaChakra size={160} color="#ffffff"/>
        </div>

        {/* Verified Citizen badge */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:7,
          background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.22)",
          borderRadius:20,padding:"4px 12px 4px 8px",marginBottom:18,backdropFilter:"blur(8px)",
        }}>
          <AshokaChakra size={13} color="#FF9933"/>
          <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.9)",letterSpacing:0.9,textTransform:"uppercase"}}>
            {isHindi?"सत्यापित नागरिक":"Verified Citizen"}
          </span>
          <span style={{fontSize:11,color:"#4ade80",fontWeight:800}}>✓</span>
        </div>

        {/* Avatar + Identity row */}
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:20}}>
          {/* Avatar with completeness ring */}
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{
              width:74,height:74,borderRadius:"50%",overflow:"hidden",
              background:"linear-gradient(135deg,#FF9933 0%,#FF8C00 100%)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:26,fontWeight:800,color:"#fff",letterSpacing:-1,
              border:"3px solid rgba(255,255,255,0.45)",
              boxShadow:"0 0 0 4px rgba(255,153,51,0.28), 0 8px 24px rgba(0,0,0,0.32)",
            }}>
              {(profile?.photo||googlePhoto||auth.currentUser?.photoURL)
                ?<img src={profile?.photo||googlePhoto||auth.currentUser?.photoURL} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                :initials}
            </div>
            {/* SVG completeness ring */}
            <svg style={{position:"absolute",inset:-5,pointerEvents:"none"}} width={84} height={84} viewBox="0 0 84 84">
              <circle cx={42} cy={42} r={38} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={3}/>
              <circle cx={42} cy={42} r={38} fill="none" stroke="#FF9933" strokeWidth={3}
                strokeDasharray={`${2*Math.PI*38*completeness/100} ${2*Math.PI*38*(1-completeness/100)}`}
                strokeDashoffset={2*Math.PI*38*0.25} strokeLinecap="round"/>
            </svg>
          </div>

          <div style={{flex:1,minWidth:0,paddingTop:4}}>
            <div style={{
              color:"#fff",fontSize:20,fontWeight:800,fontFamily:bf,lineHeight:1.2,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:-0.3,
            }}>{profile?.name}</div>
            {maskedPhone&&(
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:12,marginTop:5,fontFamily:"monospace",letterSpacing:0.5,display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:10}}>📱</span>{maskedPhone}
              </div>
            )}
            {/* Completeness bar */}
            <div style={{marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:9.5,color:"rgba(255,255,255,0.58)",fontWeight:600,letterSpacing:0.6,textTransform:"uppercase"}}>
                  {isHindi?"प्रोफाइल":"Profile Completeness"}
                </span>
                <span style={{fontSize:10.5,fontWeight:800,color:completeness>=80?"#4ade80":"#FF9933"}}>{completeness}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.15)",borderRadius:4,overflow:"hidden"}}>
                <div style={{
                  height:"100%",width:`${completeness}%`,borderRadius:4,
                  background:completeness>=80?"linear-gradient(90deg,#4ade80,#22c55e)":"linear-gradient(90deg,#FF9933,#FF8C00)",
                  boxShadow:completeness>=80?"0 0 8px rgba(74,222,128,0.5)":"0 0 8px rgba(255,153,51,0.5)",
                }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row — tabs merged with header bottom */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr 1.6fr",gap:8}}>
          {[
            {value:matchedCount,label:isHindi?"योजनाएं":"Schemes",isNum:true,icon:"🎯"},
            {value:profile?.state||"—",label:isHindi?"राज्य":"State",isNum:false,icon:"📍"},
            {value:(catDisplayLabel(profile?.occupation)||"").split(" ")[0]||"—",label:isHindi?"श्रेणी":"Category",isNum:false,icon:catIcon(profile?.occupation)},
          ].map((stat,i)=>(
            <div key={i} style={{
              background:"rgba(255,255,255,0.09)",borderRadius:"13px 13px 0 0",
              padding:"12px 10px 16px",textAlign:"center",
              border:"1px solid rgba(255,255,255,0.14)",borderBottom:"none",
              backdropFilter:"blur(8px)",
            }}>
              <div style={{
                fontSize:stat.isNum?24:11,fontWeight:800,color:"#fff",
                lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                fontFamily:bf,marginBottom:3,
              }}>
                {stat.isNum?stat.value:`${stat.icon} ${stat.value}`}
              </div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.58)",letterSpacing:0.7,fontWeight:600,textTransform:"uppercase",fontFamily:bf}}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 16px 56px"}}>

        {/* ── View Matched Schemes CTA ── */}
        <div onClick={()=>{haptic();onViewChecker();}}
          style={{
            background:"linear-gradient(135deg,#138808 0%,#16a34a 55%,#0a4d1a 100%)",
            borderRadius:18,padding:"18px 20px",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            cursor:"pointer",marginBottom:14,position:"relative",overflow:"hidden",
            boxShadow:"0 8px 28px rgba(19,136,8,0.36), inset 0 1px 0 rgba(255,255,255,0.14)",
            border:"1px solid rgba(255,255,255,0.07)",
          }}>
          <div style={{position:"absolute",right:58,top:"50%",transform:"translateY(-50%)",opacity:0.1,pointerEvents:"none"}}>
            <AshokaChakra size={68} color="#ffffff"/>
          </div>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{color:"#fff",fontSize:15,fontWeight:800,fontFamily:bf,letterSpacing:-0.2}}>{pt.viewSchemes}</div>
            <div style={{color:"rgba(255,255,255,0.8)",fontSize:11.5,marginTop:4,fontFamily:bf,display:"flex",alignItems:"center",gap:5}}>
              <span style={{background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"1px 8px",fontSize:10.5,fontWeight:700,color:"#fff"}}>{matchedCount}</span>
              <span>{isHindi?"योजनाएं मिलान हुईं":"schemes matched for you"}</span>
            </div>
          </div>
          <div style={{
            width:42,height:42,background:"rgba(255,255,255,0.18)",borderRadius:13,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20,color:"#fff",fontWeight:700,
            border:"1.5px solid rgba(255,255,255,0.28)",flexShrink:0,position:"relative",zIndex:1,
          }}>→</div>
        </div>

        {/* ── Incomplete Profile Nudge — shown when key eligibility fields are missing ── */}
        {(!profile?.caste||completeness<80)&&(
          <div onClick={()=>{haptic();handleEdit();}}
            style={{
              display:"flex",alignItems:"center",gap:12,
              background:dark?"rgba(255,153,51,0.10)":"rgba(255,153,51,0.07)",
              border:`1.5px solid ${dark?"rgba(255,153,51,0.35)":"rgba(255,153,51,0.30)"}`,
              borderRadius:16,padding:"13px 16px",marginBottom:14,cursor:"pointer",
              boxShadow:"0 2px 12px rgba(255,153,51,0.10)",
            }}>
            <div style={{
              width:40,height:40,borderRadius:12,flexShrink:0,
              background:"linear-gradient(135deg,#FF9933,#FF8C00)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
              boxShadow:"0 4px 12px rgba(255,153,51,0.30)",
            }}>⚡</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12.5,fontWeight:800,color:dark?"#FFB347":SAFFRON,fontFamily:bf,lineHeight:1.3}}>
                {isHindi?"प्रोफाइल पूरा करें — और योजनाएं पाएं":"Complete Profile · Unlock More Schemes"}
              </div>
              <div style={{fontSize:10.5,color:th.textSub,marginTop:2,fontFamily:bf}}>
                {!profile?.caste
                  ?(isHindi?"सामाजिक वर्ग जोड़ें — SC/ST/OBC योजनाएं अनलॉक होंगी":"Add social category to unlock SC/ST/OBC reserved schemes")
                  :(isHindi?`${completeness}% पूर्ण — शेष जानकारी भरें`:`${completeness}% complete — fill remaining details`)}
              </div>
            </div>
            <div style={{fontSize:13,color:SAFFRON,fontWeight:700,flexShrink:0}}>→</div>
          </div>
        )}

        {/* ── Citizen Profile Details Card ── */}
        <div style={{
          background:th.card,borderRadius:18,overflow:"hidden",marginBottom:14,
          border:`1.5px solid ${th.border}`,
          boxShadow:dark?"0 2px 16px rgba(0,0,0,0.3)":"0 2px 18px rgba(0,0,0,0.07)",
        }}>
          <div style={{
            background:dark?"rgba(0,53,128,0.22)":"rgba(0,53,128,0.05)",
            borderBottom:`1.5px solid ${dark?"rgba(0,53,128,0.28)":"rgba(0,53,128,0.10)"}`,
            padding:"11px 16px",display:"flex",alignItems:"center",gap:8,
          }}>
            <AshokaChakra size={14} color={ASHOKA_BLUE}/>
            <div style={{fontSize:10.5,fontWeight:700,color:dark?"#7ba7f0":ASHOKA_BLUE,letterSpacing:0.9,textTransform:"uppercase",fontFamily:bf}}>
              {isHindi?"नागरिक प्रोफाइल विवरण":"Citizen Profile Details"}
            </div>
          </div>
          <div style={{padding:"14px 16px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {icon:"💰",label:isHindi?"आय वर्ग":"Income",value:incomeLabel,color:"#D97706"},
                {icon:"🎂",label:isHindi?"आयु वर्ग":"Age Group",value:ageLabel,color:ASHOKA_BLUE},
                {icon:"🏘️",label:isHindi?"क्षेत्र":"Area",value:areaLabel,color:IND_GREEN},
                {icon:"🏠",label:isHindi?"मकान":"Housing",value:houseVal,color:SAFFRON},
                {icon:"🪪",label:isHindi?"सामाजिक वर्ग":"Social Category",
                  value:T[lang].fields.castes.find(c=>c.v===profile?.caste)?.l||profile?.caste||"—",
                  color:"#7C3AED"},
              ].map((item,i)=>(
                <div key={i} style={{
                  background:dark?th.card2:`${item.color}09`,
                  border:dark?`1.5px solid ${th.border2}`:`1.5px solid ${item.color}28`,
                  borderRadius:13,padding:"12px 13px",
                }}>
                  <div style={{fontSize:17,marginBottom:5}}>{item.icon}</div>
                  <div style={{fontSize:9.5,color:th.textSub,fontFamily:bf,letterSpacing:0.5,textTransform:"uppercase",marginBottom:3,fontWeight:600}}>{item.label}</div>
                  <div style={{fontSize:12.5,fontWeight:700,
                    color:dark&&item.color===ASHOKA_BLUE?"#6B90FF":dark&&item.color===IND_GREEN?"#34D058":item.color,
                    fontFamily:bf,lineHeight:1.3}}>{item.value||"—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Welfare Profile Summary ── */}
        {(profile?.ration||profile?.marital||profile?.disability)&&(
            <div style={{
              background:th.card,borderRadius:18,overflow:"hidden",marginBottom:14,
              border:`1.5px solid ${th.border}`,
              boxShadow:dark?"0 2px 16px rgba(0,0,0,0.3)":"0 2px 18px rgba(0,0,0,0.07)",
            }}>
              <div style={{
                background:dark?"rgba(124,58,237,0.14)":"rgba(124,58,237,0.04)",
                borderBottom:`1.5px solid ${dark?"rgba(124,58,237,0.28)":"rgba(124,58,237,0.10)"}`,
                padding:"11px 16px",display:"flex",alignItems:"center",gap:8,
              }}>
                <span style={{fontSize:15}}>🛡️</span>
                <div style={{fontSize:10.5,fontWeight:700,color:dark?"#c084fc":"#7C3AED",letterSpacing:0.9,textTransform:"uppercase",fontFamily:bf}}>
                  {isHindi?"कल्याण और सामाजिक प्रोफाइल":"Welfare & Social Profile"}
                </div>
              </div>
              <div style={{padding:"8px 16px"}}>
                {welfareRationLabel&&(
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${th.divider}`}}>
                    <div style={{width:38,height:38,borderRadius:11,background:`${welfareRationColor}15`,border:`1.5px solid ${welfareRationColor}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🪪</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:9.5,color:th.textSub,fontFamily:bf,letterSpacing:0.5,textTransform:"uppercase",fontWeight:600}}>{pt.rationLabel}</div>
                      <div style={{fontSize:13.5,fontWeight:700,color:welfareRationColor,fontFamily:bf,marginTop:2}}>{welfareRationLabel}</div>
                    </div>
                    <div style={{width:8,height:8,borderRadius:"50%",background:welfareRationColor,boxShadow:`0 0 8px ${welfareRationColor}70`,flexShrink:0}}/>
                  </div>
                )}
                {welfareMaritalLabel&&(
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${th.divider}`}}>
                    <div style={{width:38,height:38,borderRadius:11,background:`${welfareMaritalColor}15`,border:`1.5px solid ${welfareMaritalColor}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>💍</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:9.5,color:th.textSub,fontFamily:bf,letterSpacing:0.5,textTransform:"uppercase",fontWeight:600}}>{pt.maritalLabel}</div>
                      <div style={{fontSize:13.5,fontWeight:700,color:welfareMaritalColor,fontFamily:bf,marginTop:2}}>{welfareMaritalLabel}</div>
                    </div>
                    <div style={{width:8,height:8,borderRadius:"50%",background:welfareMaritalColor,boxShadow:`0 0 8px ${welfareMaritalColor}70`,flexShrink:0}}/>
                  </div>
                )}
                {profile.disability!==undefined&&(
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0"}}>
                    <div style={{width:38,height:38,borderRadius:11,background:`${welfareDisabilityColor}15`,border:`1.5px solid ${welfareDisabilityColor}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>♿</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:9.5,color:th.textSub,fontFamily:bf,letterSpacing:0.5,textTransform:"uppercase",fontWeight:600}}>{pt.disabilityLabel}</div>
                      <div style={{fontSize:13.5,fontWeight:700,color:welfareDisabilityColor,fontFamily:bf,marginTop:2}}>{welfareDisabilityLabel}</div>
                    </div>
                    <div style={{width:8,height:8,borderRadius:"50%",background:welfareDisabilityColor,boxShadow:`0 0 8px ${welfareDisabilityColor}70`,flexShrink:0}}/>
                  </div>
                )}
              </div>
            </div>
        )}

        {/* ── Settings Card ── */}
        <div style={{
          background:th.card,borderRadius:18,overflow:"hidden",
          border:`1.5px solid ${th.border}`,
          boxShadow:dark?"0 2px 16px rgba(0,0,0,0.3)":"0 2px 18px rgba(0,0,0,0.07)",
        }}>
          <div style={{
            padding:"12px 18px 11px",borderBottom:`1px solid ${th.divider}`,
            display:"flex",alignItems:"center",gap:8,
            background:dark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.015)",
          }}>
            <span style={{fontSize:14}}>⚙️</span>
            <div style={{fontSize:10.5,fontWeight:700,color:th.textSub,letterSpacing:0.9,textTransform:"uppercase",fontFamily:bf}}>{pt.settingsTitle}</div>
          </div>

          {/* Language */}
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,background:dark?"rgba(59,130,246,0.14)":"#EFF6FF",border:`1.5px solid ${dark?"rgba(59,130,246,0.28)":"#BFDBFE"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🌐</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>{pt.langLabel}</div>
                <div style={{fontSize:11,color:th.textSub,marginTop:1}}>{lang==="en"?"English / अंग्रेज़ी":"हिंदी / Hindi"}</div>
              </div>
            </div>
            <LangToggle lang={lang} onToggle={toggleLang} dark={dark}/>
          </div>

          {/* Dark Mode */}
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,background:dark?"#1c1c2e":"#F5F3FF",border:`1.5px solid ${dark?"#4c3a8a":"#DDD6FE"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{dark?"🌙":"☀️"}</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>{pt.darkLabel}</div>
                <div style={{fontSize:11,color:th.textSub,marginTop:1}}>{pt.darkSub(dark)}</div>
              </div>
            </div>
            <div onClick={()=>{haptic();toggleDark();}}
              style={{width:48,height:27,borderRadius:14,background:dark?"#003580":"#e0e0e0",position:"relative",cursor:"pointer",transition:"background 0.25s",flexShrink:0,border:`1.5px solid ${dark?"#1a56db":"#ccc"}`,boxShadow:dark?"0 0 12px rgba(0,53,128,0.35)":"none"}}>
              <div style={{position:"absolute",top:2,left:dark?22:2,width:21,height:21,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 5px rgba(0,0,0,0.2)",transition:"left 0.25s"}}/>
            </div>
          </div>

          {/* Edit Profile */}
          <div onClick={()=>{haptic();handleEdit();}}
            style={{padding:"14px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,background:dark?"rgba(255,153,51,0.14)":"#FFF7ED",border:`1.5px solid ${dark?"rgba(255,153,51,0.28)":"#FED7AA"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>✏️</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>{pt.editProfile}</div>
                <div style={{fontSize:11,color:th.textSub,marginTop:1}}>{isHindi?"जानकारी अपडेट करें":"Update your information"}</div>
              </div>
            </div>
            <div style={{width:28,height:28,borderRadius:8,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1.5px solid ${th.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.textMid,fontSize:15,fontWeight:700}}>›</div>
          </div>

          {/* Report / Query — visible to all logged-in users */}
          {auth.currentUser&&(
            <div onClick={()=>{haptic();setReportTab("my");setShowReport(true);}}
              style={{padding:"14px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:11,
                  background:"linear-gradient(135deg,rgba(255,153,51,0.14),rgba(0,53,128,0.10))",
                  border:"1.5px solid rgba(255,153,51,0.25)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>📬</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>{pt.reportLabel}</div>
                  <div style={{fontSize:11,color:th.textSub,marginTop:1}}>{pt.reportSub}</div>
                </div>
              </div>
              <div style={{width:28,height:28,borderRadius:8,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1.5px solid ${th.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.textMid,fontSize:15,fontWeight:700}}>›</div>
            </div>
          )}

          {/* Admin Panel — only visible to admin */}
          {isAdmin&&(
            <div onClick={()=>{haptic();window.open("/admin","_blank");}}
              style={{padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",borderBottom:`1px solid ${th.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:11,
                  background:"linear-gradient(135deg,#002060,rgba(255,153,51,0.85))",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,
                  boxShadow:"0 2px 8px rgba(0,32,96,0.22)"}}>🛡️</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:th.text,fontFamily:bf}}>Admin Dashboard</div>
                  <div style={{fontSize:11,color:th.textSub,marginTop:1}}>View users, stats & export data</div>
                </div>
              </div>
              <div style={{width:28,height:28,borderRadius:8,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1.5px solid ${th.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.textMid,fontSize:15,fontWeight:700}}>›</div>
            </div>
          )}

          {/* About Yojana Sahay */}
          <div onClick={()=>{haptic();setShowAbout(true);}}
            style={{padding:"14px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,
                background:dark?"rgba(0,53,128,0.18)":"rgba(0,53,128,0.06)",
                border:`1.5px solid ${dark?"rgba(0,53,128,0.32)":"rgba(0,53,128,0.16)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>ℹ️</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>
                  {isHindi?"ऐप के बारे में":"About Yojana Sahay"}
                </div>
                <div style={{fontSize:11,color:th.textSub,marginTop:1}}>
                  {isHindi?"मिशन, AI, टीम और अधिक":"Mission, AI, team & more"}
                </div>
              </div>
            </div>
            <div style={{width:28,height:28,borderRadius:8,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1.5px solid ${th.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.textMid,fontSize:15,fontWeight:700}}>›</div>
          </div>

          {/* Government Helplines */}
          <div onClick={()=>{haptic();setShowHelpline(true);}}
            style={{padding:"14px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,
                background:dark?"rgba(255,153,51,0.12)":"rgba(255,153,51,0.08)",
                border:`1.5px solid ${dark?"rgba(255,153,51,0.28)":"rgba(255,153,51,0.22)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>📞</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>
                  {isHindi?"सरकारी हेल्पलाइन":"Government Helplines"}
                </div>
                <div style={{fontSize:11,color:th.textSub,marginTop:1}}>
                  {isHindi?"112, PM-KISAN, स्वास्थ्य, महिला और अधिक":"112, PM-KISAN, Health, Women & more"}
                </div>
              </div>
            </div>
            <div style={{width:28,height:28,borderRadius:8,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1.5px solid ${th.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.textMid,fontSize:15,fontWeight:700}}>›</div>
          </div>

          {/* FAQ */}
          <div onClick={()=>{haptic();setShowFAQ(true);}}
            style={{padding:"14px 18px",borderBottom:`1px solid ${th.divider}`,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{
                width:38,height:38,borderRadius:11,
                background:dark?"rgba(107,144,255,0.12)":"rgba(0,53,128,0.06)",
                border:`1.5px solid ${dark?"rgba(107,144,255,0.28)":"rgba(0,53,128,0.16)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:14,fontWeight:800,color:dark?"#6B90FF":"#003580",fontFamily:bf,
              }}>?</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:th.text,fontFamily:bf}}>
                  {isHindi?"योजना सहाय FAQ":"YojanaSahay FAQ"}
                </div>
                <div style={{fontSize:11,color:th.textSub,marginTop:1}}>
                  {isHindi?"अक्सर पूछे जाने वाले सवाल":"Frequently asked questions"}
                </div>
              </div>
            </div>
            <div style={{width:28,height:28,borderRadius:8,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1.5px solid ${th.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.textMid,fontSize:15,fontWeight:700}}>›</div>
          </div>

          {/* Sign Out */}
          <div onClick={()=>{haptic([50,60,50]);setShowSignOutModal(true);}}
            style={{padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:11,background:dark?"rgba(220,38,38,0.14)":"#FEF2F2",border:`1.5px solid ${dark?"rgba(220,38,38,0.28)":"#FECACA"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🚪</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#DC2626",fontFamily:bf}}>{pt.signOut}</div>
                <div style={{fontSize:11,color:dark?"#f87171":"#ef4444",marginTop:1}}>{isHindi?"सुरक्षित साइन आउट":"Sign out securely"}</div>
              </div>
            </div>
            <div style={{width:28,height:28,borderRadius:8,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1.5px solid ${th.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.textMid,fontSize:15,fontWeight:700}}>›</div>
          </div>
        </div>
      </div>

      {/* ── Sign Out Confirmation Modal ── */}
      {showSignOutModal&&(
        <div
          onClick={()=>{if(!signOutLoading)setShowSignOutModal(false);}}
          style={{
            position:"fixed",inset:0,zIndex:1000,
            background:dark?"rgba(0,0,0,0.80)":"rgba(8,14,36,0.60)",
            backdropFilter:"blur(20px) saturate(180%)",
            WebkitBackdropFilter:"blur(20px) saturate(180%)",
            display:"flex",alignItems:"center",justifyContent:"center",
            padding:"20px",
            animation:"so_bd 0.25s ease both",
          }}>

          <div
            onClick={e=>e.stopPropagation()}
            style={{
              width:"100%",maxWidth:348,
              borderRadius:32,
              overflow:"hidden",
              animation:"so_in 0.48s cubic-bezier(0.22,1,0.36,1) both",
              position:"relative",
              /* Layered glass card */
              background:dark
                ?"linear-gradient(145deg,rgba(30,30,36,0.97) 0%,rgba(20,20,25,0.99) 100%)"
                :"linear-gradient(145deg,rgba(255,255,255,0.98) 0%,rgba(248,246,255,0.99) 100%)",
              boxShadow:dark
                ?`0 0 0 1px rgba(255,255,255,0.08),
                  0 8px 16px rgba(0,0,0,0.4),
                  0 40px 80px rgba(0,0,0,0.65),
                  inset 0 1px 0 rgba(255,255,255,0.07)`
                :`0 0 0 1px rgba(0,0,0,0.07),
                  0 8px 20px rgba(15,23,42,0.10),
                  0 40px 80px rgba(15,23,42,0.18),
                  inset 0 1px 0 rgba(255,255,255,1)`,
            }}>

            {/* ── Decorative top gradient strip ── */}
            <div style={{
              height:4,
              background:"linear-gradient(90deg,#FF9933 0%,#f97316 30%,#ef4444 60%,#dc2626 100%)",
              boxShadow:"0 2px 12px rgba(239,68,68,0.5)",
            }}/>

            {/* ── Ambient glow blobs ── */}
            <div style={{
              position:"absolute",top:-40,left:"50%",transform:"translateX(-50%)",
              width:220,height:120,
              background:"radial-gradient(ellipse,rgba(220,38,38,0.18) 0%,transparent 70%)",
              pointerEvents:"none",filter:"blur(2px)",
            }}/>
            <div style={{
              position:"absolute",bottom:60,right:-30,
              width:140,height:140,
              background:dark
                ?"radial-gradient(circle,rgba(255,153,51,0.08) 0%,transparent 70%)"
                :"radial-gradient(circle,rgba(0,53,128,0.05) 0%,transparent 70%)",
              pointerEvents:"none",
            }}/>

            {/* ── Content ── */}
            <div style={{padding:"30px 26px 26px",position:"relative"}}>

              {/* Close button */}
              <div
                onClick={()=>{if(!signOutLoading){haptic(30);setShowSignOutModal(false);}}}
                style={{
                  position:"absolute",top:16,right:16,
                  width:32,height:32,borderRadius:"50%",
                  background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)",
                  border:`1px solid ${dark?"rgba(255,255,255,0.11)":"rgba(0,0,0,0.09)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",WebkitTapHighlightColor:"transparent",flexShrink:0,
                }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke={dark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.35)"} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>

              {/* ── Icon with pulsing rings ── */}
              <div style={{display:"flex",justifyContent:"center",marginBottom:22,animation:"so_fadeslide 0.4s 0.1s ease both"}}>
                <div style={{position:"relative",width:90,height:90,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {/* Ring 2 — outermost */}
                  <div style={{
                    position:"absolute",inset:-14,borderRadius:"50%",
                    border:`1.5px solid ${dark?"rgba(220,38,38,0.22)":"rgba(220,38,38,0.15)"}`,
                    animation:"so_ring2 2.8s ease-in-out 0.3s infinite",
                  }}/>
                  {/* Ring 1 */}
                  <div style={{
                    position:"absolute",inset:-6,borderRadius:"50%",
                    border:`1.5px solid ${dark?"rgba(220,38,38,0.38)":"rgba(220,38,38,0.25)"}`,
                    animation:"so_ring1 2.8s ease-in-out infinite",
                  }}/>
                  {/* Icon circle */}
                  <div style={{
                    width:90,height:90,borderRadius:"50%",
                    background:dark
                      ?"linear-gradient(145deg,#2c1414 0%,#3d1919 60%,#2a1212 100%)"
                      :"linear-gradient(145deg,#fff0f0 0%,#ffe2e2 60%,#ffd6d6 100%)",
                    border:`1.5px solid ${dark?"rgba(239,68,68,0.30)":"rgba(239,68,68,0.20)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    animation:"so_iconbob 3s ease-in-out infinite",
                    boxShadow:dark
                      ?"0 0 0 0 rgba(220,38,38,0),0 12px 32px rgba(220,38,38,0.28),inset 0 1px 0 rgba(255,255,255,0.07)"
                      :"0 0 0 0 rgba(220,38,38,0),0 12px 32px rgba(220,38,38,0.18),inset 0 2px 0 rgba(255,255,255,0.9)",
                  }}>
                    {/* SVG logout icon */}
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                      stroke={dark?"#f87171":"#dc2626"} strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* ── Heading ── */}
              <div style={{textAlign:"center",marginBottom:20,animation:"so_fadeslide 0.4s 0.15s ease both"}}>
                <div style={{
                  fontSize:22,fontWeight:800,fontFamily:bf,letterSpacing:-0.5,
                  color:th.text,lineHeight:1.15,marginBottom:8,
                }}>
                  {isHindi?"साइन आउट करें?":"Sign Out?"}
                </div>
                <div style={{
                  fontSize:13,lineHeight:1.65,fontFamily:bf,
                  color:dark?"rgba(180,180,190,0.85)":"rgba(80,80,100,0.80)",
                  maxWidth:250,margin:"0 auto",
                }}>
                  {isHindi
                    ?"आपकी प्रोफाइल और प्रगति सुरक्षित रहेगी।"
                    :"Your profile & progress stays safe. Everything will be right here when you return."}
                </div>
              </div>

              {/* ── User card ── */}
              {auth.currentUser&&(
                <div style={{
                  animation:"so_fadeslide 0.4s 0.22s ease both",
                  marginBottom:18,
                  padding:"13px 14px",
                  borderRadius:20,
                  display:"flex",alignItems:"center",gap:12,
                  background:dark
                    ?"linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.02) 100%)"
                    :"linear-gradient(135deg,rgba(0,53,128,0.04) 0%,rgba(0,53,128,0.02) 100%)",
                  border:`1px solid ${dark?"rgba(255,255,255,0.09)":"rgba(0,53,128,0.12)"}`,
                  boxShadow:dark?"inset 0 1px 0 rgba(255,255,255,0.04)":"inset 0 1px 0 rgba(255,255,255,0.8)",
                }}>
                  {/* Avatar */}
                  <div style={{position:"relative",flexShrink:0}}>
                    {auth.currentUser.photoURL
                      ?<img src={auth.currentUser.photoURL} alt="" style={{
                          width:46,height:46,borderRadius:"50%",objectFit:"cover",display:"block",
                          animation:"so_avatarring 2.5s ease-in-out infinite",
                        }}/>
                      :<div style={{
                          width:46,height:46,borderRadius:"50%",
                          background:"linear-gradient(135deg,#FF9933 0%,#f97316 50%,#ea580c 100%)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:18,fontWeight:800,color:"#fff",
                          animation:"so_avatarring 2.5s ease-in-out infinite",
                          boxShadow:"0 4px 14px rgba(249,115,22,0.45)",
                        }}>
                        {(profile?.name||auth.currentUser.displayName||auth.currentUser.email||"U").charAt(0).toUpperCase()}
                      </div>
                    }
                    {/* Online dot */}
                    <div style={{
                      position:"absolute",bottom:1,right:1,
                      width:12,height:12,borderRadius:"50%",
                      background:"#22c55e",
                      border:`2px solid ${dark?"#1e1e22":"#fff"}`,
                      boxShadow:"0 0 6px rgba(34,197,94,0.6)",
                    }}/>
                  </div>

                  {/* Name + email */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{
                      fontSize:14,fontWeight:700,color:th.text,fontFamily:bf,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                      lineHeight:1.3,marginBottom:3,
                    }}>
                      {profile?.name||auth.currentUser.displayName||(isHindi?"नागरिक":"Citizen")}
                    </div>
                    <div style={{
                      fontSize:11.5,color:th.textSub,fontFamily:bf,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                    }}>
                      {auth.currentUser.email||auth.currentUser.phoneNumber||""}
                    </div>
                  </div>

                  {/* Verified pill */}
                  <div style={{
                    flexShrink:0,display:"flex",alignItems:"center",gap:4,
                    padding:"4px 10px",borderRadius:20,
                    background:dark?"rgba(34,197,94,0.14)":"rgba(22,163,74,0.09)",
                    border:"1.5px solid rgba(34,197,94,0.28)",
                  }}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 5px rgba(34,197,94,0.7)"}}/>
                    <span style={{fontSize:10.5,fontWeight:700,color:"#16a34a",fontFamily:bf,letterSpacing:0.2}}>
                      {isHindi?"सत्यापित":"Verified"}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Buttons ── */}
              <div style={{display:"flex",flexDirection:"column",gap:10,animation:"so_fadeslide 0.4s 0.28s ease both"}}>

                {/* Sign Out */}
                <div
                  onClick={async()=>{
                    if(signOutLoading)return;
                    haptic([50,60,50]);
                    setSignOutLoading(true);
                    await handleSignOut();
                    setSignOutLoading(false);
                    setShowSignOutModal(false);
                  }}
                  style={{
                    position:"relative",overflow:"hidden",
                    background:signOutLoading
                      ?"linear-gradient(135deg,#b91c1c,#991b1b)"
                      :"linear-gradient(135deg,#ef4444 0%,#dc2626 40%,#b91c1c 100%)",
                    borderRadius:18,padding:"16px",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:9,
                    cursor:signOutLoading?"default":"pointer",
                    boxShadow:signOutLoading
                      ?"0 4px 12px rgba(185,28,28,0.25)"
                      :"0 4px 8px rgba(239,68,68,0.20),0 12px 28px rgba(185,28,28,0.42),inset 0 1px 0 rgba(255,255,255,0.18)",
                    transition:"box-shadow 0.25s,transform 0.15s",
                    WebkitTapHighlightColor:"transparent",
                    userSelect:"none",
                  }}>
                  {/* Shine sweep */}
                  {!signOutLoading&&(
                    <div style={{
                      position:"absolute",top:0,bottom:0,width:"55%",
                      background:"linear-gradient(105deg,transparent 0%,rgba(255,255,255,0.14) 50%,transparent 100%)",
                      animation:"so_btnshine 2.8s ease-in-out 0.6s infinite",
                      pointerEvents:"none",
                    }}/>
                  )}
                  {signOutLoading
                    ?<div className="btn-spinner"/>
                    :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  }
                  <span style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:bf,letterSpacing:0.15,position:"relative"}}>
                    {signOutLoading?(isHindi?"साइन आउट हो रहा है...":"Signing out…"):(isHindi?"हाँ, साइन आउट करें":"Yes, Sign Out")}
                  </span>
                </div>

                {/* Cancel */}
                <div
                  onClick={()=>{if(!signOutLoading){haptic();setShowSignOutModal(false);}}}
                  style={{
                    borderRadius:18,padding:"15px",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    cursor:signOutLoading?"default":"pointer",
                    background:"transparent",
                    border:`1.5px solid ${dark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.09)"}`,
                    WebkitTapHighlightColor:"transparent",
                    userSelect:"none",
                    opacity:signOutLoading?0.4:1,
                    transition:"opacity 0.2s",
                  }}>
                  <span style={{fontSize:14,fontWeight:600,fontFamily:bf,color:dark?"rgba(200,200,210,0.7)":"rgba(80,80,100,0.65)"}}>
                    {isHindi?"रद्द करें":"Cancel"}
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── About Screen Overlay ── */}
      {showAbout&&(
        <div
          onTouchStart={e=>e.stopPropagation()}
          onTouchMove={e=>e.stopPropagation()}
          onTouchEnd={e=>e.stopPropagation()}
          style={{
          position:"fixed",inset:0,zIndex:900,
          background:THEME[dark?"dark":"light"].appBg,
          display:"flex",flexDirection:"column",
          fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif",
        }}>
          {/* Scrollable content */}
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
            <Suspense fallback={<PremiumLoader/>}>
            <AboutTab onClose={()=>setShowAbout(false)} citizensGuided={liveCheckerTotal}/>
            </Suspense>
          </div>
        </div>
      )}

      {/* ── Helpline Screen Overlay (logged-in dashboard stage) ── */}
      {showHelpline&&(
        <div
          onTouchStart={e=>e.stopPropagation()}
          onTouchMove={e=>e.stopPropagation()}
          onTouchEnd={e=>e.stopPropagation()}
          style={{
          position:"fixed",inset:0,zIndex:900,
          background:THEME[dark?"dark":"light"].appBg,
          display:"flex",flexDirection:"column",
          fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif",
        }}>
          <div style={{
            position:"sticky",top:0,zIndex:10,flexShrink:0,
            background:THEME[dark?"dark":"light"].card,
            borderBottom:`1px solid ${THEME[dark?"dark":"light"].border}`,
            padding:"12px 16px",
            display:"flex",alignItems:"center",gap:10,
            boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div onClick={()=>setShowHelpline(false)} style={{
              width:34,height:34,borderRadius:10,
              background:THEME[dark?"dark":"light"].card2,
              border:`1.5px solid ${THEME[dark?"dark":"light"].border}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,cursor:"pointer",flexShrink:0,
              color:THEME[dark?"dark":"light"].text,
            }}>←</div>
            <div style={{fontSize:16,fontWeight:800,color:THEME[dark?"dark":"light"].text}}>
              {lang==="hi"?"📞 सरकारी हेल्पलाइन":"📞 Government Helplines"}
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
            <Suspense fallback={<PremiumLoader/>}>
            <Helpline lang={lang} dark={dark}/>
            </Suspense>
          </div>
        </div>
      )}

      {/* ── FAQ Screen Overlay ── */}
      {showFAQ&&(
        <div
          onTouchStart={e=>e.stopPropagation()}
          onTouchMove={e=>e.stopPropagation()}
          onTouchEnd={e=>e.stopPropagation()}
          style={{
          position:"fixed",inset:0,zIndex:900,
          background:dark?"#000":"#f2f2f7",
          display:"flex",flexDirection:"column",
          fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif",
        }}>
          <div style={{
            display:"flex",alignItems:"center",gap:10,
            padding:"14px 14px 12px",flexShrink:0,
            background:dark?"#0c0c0e":"#fff",
            borderBottom:`1px solid ${dark?"#2c2c2e":"#f0f0f0"}`,
          }}>
            <div
              onClick={()=>{haptic();setShowFAQ(false);}}
              style={{
                width:34,height:34,borderRadius:10,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",
                cursor:"pointer",WebkitTapHighlightColor:"transparent",
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={dark?"#f0f0f0":"#1a1a1a"} strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </div>
            <div style={{fontSize:15.5,fontWeight:800,color:dark?"#f0f0f0":"#1a1a1a",fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif"}}>
              {lang==="hi"?"योजना सहाय FAQ":"YojanaSahay FAQ"}
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 16px 32px"}}>
            <Suspense fallback={<PremiumLoader/>}>
            <HomeFAQSection lang={lang} dark={dark}/>
            </Suspense>
          </div>
        </div>
      )}

      {/* ── Report / Query Screen — two-tab: My Reports + New Report ── */}
      {showReport&&(
        <div
          onTouchStart={e=>e.stopPropagation()}
          onTouchMove={e=>e.stopPropagation()}
          onTouchEnd={e=>e.stopPropagation()}
          style={{
          position:"fixed",inset:0,zIndex:900,
          background:THEME[dark?"dark":"light"].appBg,
          display:"flex",flexDirection:"column",
          fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif",
        }}>
          {/* Header */}
          <div style={{
            background:THEME[dark?"dark":"light"].card,
            borderBottom:`1px solid ${THEME[dark?"dark":"light"].border}`,
            padding:"14px 16px 0",
            flexShrink:0,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div onClick={()=>setShowReport(false)} style={{
                width:34,height:34,borderRadius:10,
                background:THEME[dark?"dark":"light"].card2,
                border:`1.5px solid ${THEME[dark?"dark":"light"].border}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:16,cursor:"pointer",flexShrink:0,
              }}>←</div>
              <div style={{fontSize:16,fontWeight:800,color:THEME[dark?"dark":"light"].text}}>
                📬 {lang==="hi"?"रिपोर्ट / सवाल":"Report / Query"}
              </div>
            </div>

            {/* Tab bar */}
            <div style={{display:"flex",gap:0}}>
              {[
                {key:"my",  labelEn:"My Reports",  labelHi:"मेरी रिपोर्ट"},
                {key:"new", labelEn:"+ New Report", labelHi:"+ नई रिपोर्ट"},
              ].map(tab=>(
                <div key={tab.key} onClick={()=>setReportTab(tab.key)} style={{
                  flex:1,textAlign:"center",
                  padding:"9px 0 10px",
                  fontSize:13,fontWeight:reportTab===tab.key?800:600,
                  color:reportTab===tab.key?"#FF9933":THEME[dark?"dark":"light"].textSub,
                  borderBottom:`2.5px solid ${reportTab===tab.key?"#FF9933":"transparent"}`,
                  cursor:"pointer",
                  transition:"all 0.18s",
                }}>
                  {lang==="hi"?tab.labelHi:tab.labelEn}
                </div>
              ))}
            </div>
          </div>

          {/* Tab body */}
          <div style={{flex:1,overflowY:"auto"}}>
            {reportTab==="my"?(
              <UserReportsTab
                lang={lang}
                dark={dark}
                userProfile={profile}
                onNewReport={()=>setReportTab("new")}
              />
            ):(
              <ReportIssueSheet
                lang={lang}
                dark={dark}
                userProfile={profile}
                onClose={()=>{
                  // After submitting, go back to My Reports to see it
                  setReportTab("my");
                }}
                embeddedMode={true}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Login Success Toast ── */}
      {loginToast&&(
        <div style={{
          position:"fixed",
          bottom:96,
          left:"50%",
          transform:"translateX(-50%)",
          zIndex:9999,
          display:"flex",
          alignItems:"center",
          gap:10,
          background:dark?"rgba(30,30,32,0.96)":"rgba(255,255,255,0.97)",
          border:`1px solid ${dark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)"}`,
          borderRadius:18,
          padding:"10px 16px 10px 10px",
          boxShadow:dark
            ?"0 8px 32px rgba(0,0,0,0.45)"
            :"0 8px 32px rgba(0,0,0,0.12)",
          minWidth:220,
          maxWidth:"86vw",
          animation:"toastSlideIn 0.38s cubic-bezier(0.22,1,0.36,1) forwards",
        }}>
          {/* Avatar */}
          {loginToast.photo
            ?<img src={loginToast.photo} alt=""
                style={{width:36,height:36,borderRadius:"50%",flexShrink:0,objectFit:"cover",border:`1.5px solid ${dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.08)"}`}}/>
            :<div style={{
                width:36,height:36,borderRadius:"50%",flexShrink:0,
                background:dark?"#2c2c2e":"#f0f0f0",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:17,
              }}>🙏</div>
          }

          {/* Text */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{
              fontSize:12.5,fontWeight:700,
              color:dark?"#f0f0f0":"#1a1a1a",
              fontFamily:bf,lineHeight:1.3,
            }}>
              {isHindi?"साइन इन सफल":"Signed in successfully"} ✓
            </div>
            <div style={{
              fontSize:11,
              color:dark?"#888":"#888",
              fontFamily:bf,
              marginTop:2,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
            }}>
              {isHindi?"स्वागत है,":"Welcome,"} {loginToast.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoised so it only re-renders when its own props actually change.
// All function props passed to it must be stable (useCallback) for this to work.
const ProfileTabMemo = memo(ProfileTab);

// ─── BENEFIT CALCULATOR CARD ───────────────────────────────────────────────────
function BenefitCalculatorCard({ allMatchedSchemes, lang, dark, onSchemeOpen }) {
  const th = THEME[dark ? "dark" : "light"];
  const isHindi = lang === "hi";
  const bf = fontFamily(lang);
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  // Tracks whether the [totalAnnual] effect has fired once on mount.
  // First fire: stay as pill (home screen load intended design).
  // Subsequent fires: profile edit / recheck → auto-open + re-animate.
  const isFirstTotalAnnualRun = useRef(true);

  const schemesWithBenefit = useMemo(
    () => allMatchedSchemes.filter(s => s.annual > 0).sort((a, b) => b.annual - a.annual),
    [allMatchedSchemes]
  );
  const totalAnnual = useMemo(
    () => schemesWithBenefit.reduce((sum, s) => sum + s.annual, 0),
    [schemesWithBenefit]
  );

  const [animTotal] = useCountUp([totalAnnual], revealed, 2200);

  // Prepares count-up in background so it is ready when user taps the pill.
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 350);
    return () => clearTimeout(t);
  }, []);

  // Auto-open + re-animate ONLY when totalAnnual changes after mount.
  // Skips first fire so the card stays as a pill on page load.
  useEffect(() => {
    if (isFirstTotalAnnualRun.current) {
      isFirstTotalAnnualRun.current = false;
      return; // first mount → stay as pill
    }
    if (totalAnnual > 0) {
      setOpen(true);
      setExpanded(false);   // reset show-more when results change
      setRevealed(false);   // reset animTotal to 0 ...
      const t = setTimeout(() => setRevealed(true), 80); // ... then count-up to new total
      return () => clearTimeout(t);
    }
  }, [totalAnnual]);

  if (schemesWithBenefit.length === 0 || totalAnnual === 0) return null;

  const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;
  const visibleSchemes = expanded ? schemesWithBenefit : schemesWithBenefit.slice(0, 3);

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  if (!open) return (
    <div onClick={() => { haptic(); setRevealed(false); setOpen(true); setTimeout(() => setRevealed(true), 50); }} style={{
      display:"flex", alignItems:"center", gap:10,
      background:"linear-gradient(135deg,#0c1445,#0f2a5c)",
      border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:50, padding:"10px 14px", marginBottom:12,
      cursor:"pointer", WebkitTapHighlightColor:"transparent",
      boxShadow:"0 4px 16px rgba(6,3,141,0.22)",
      transition:"transform 0.14s", willChange:"transform",
    }}
    onTouchStart={e=>e.currentTarget.style.transform="scale(0.97)"}
    onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
    onTouchCancel={e=>e.currentTarget.style.transform="scale(1)"}>
      <div style={{width:34,height:34,background:"rgba(255,153,51,0.2)",border:"1.5px solid rgba(255,153,51,0.45)",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>💰</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:"rgba(255,255,255,0.55)",fontSize:9,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",fontFamily:bf}}>{isHindi?"सरकारी योजना":"Govt. Money You Can Receive"}</div>
        <div style={{color:"#FFD700",fontSize:13,fontWeight:900,letterSpacing:-0.3,fontVariantNumeric:"tabular-nums",lineHeight:1.2}}>
          {formatINR(totalAnnual)}<span style={{fontSize:8.5,fontWeight:600,color:"rgba(255,215,0,0.55)",fontFamily:bf}}>/yr</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <div style={{background:"rgba(74,222,128,0.14)",border:"1px solid rgba(74,222,128,0.3)",borderRadius:20,padding:"3px 8px",color:"#4ade80",fontSize:8,fontWeight:800,letterSpacing:0.4}}>
          {schemesWithBenefit.length} {isHindi?"योजनाएं":"schemes"}
        </div>
        <span style={{color:"rgba(255,255,255,0.35)",fontSize:16,lineHeight:1,marginTop:1}}>›</span>
      </div>
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(145deg, #0c1445 0%, #0f2a5c 45%, #0d3b6e 100%)",
      borderRadius: 20,
      padding: "18px 18px 14px",
      marginBottom: 16,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(6, 3, 141, 0.28), 0 2px 8px rgba(0,0,0,0.2)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      {/* Decorative orbs */}
      <div style={{ position:"absolute", right:-40, top:-40, width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,153,51,0.12) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", left:-20, bottom:-30, width:100, height:100, borderRadius:"50%", background:"radial-gradient(circle, rgba(19,136,8,0.12) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", right:30, bottom:-10, width:60, height:60, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)", pointerEvents:"none" }}/>

      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, position:"relative" }}>
        <div style={{ width:38, height:38, background:"linear-gradient(135deg,rgba(255,153,51,0.3),rgba(255,153,51,0.12))", border:"1.5px solid rgba(255,153,51,0.45)", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          💰
        </div>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontSize:13, fontWeight:800, fontFamily:bf, lineHeight:1.2 }}>
            {isHindi ? "सरकारी पैसा जो आप पा सकते हैं" : "Govt. Money You Can Receive"}
          </div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, marginTop:2 }}>
            {isHindi
              ? `${schemesWithBenefit.length} योजनाओं में आप पात्र हो सकते हैं`
              : `You may qualify for ${schemesWithBenefit.length} scheme${schemesWithBenefit.length !== 1 ? "s" : ""}`}
          </div>
        </div>
        {/* Live indicator + collapse */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.35)", borderRadius:20, padding:"4px 9px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", animation:"calc-pulse 1.6s ease-in-out infinite" }}/>
            <span style={{ color:"#4ade80", fontSize:9, fontWeight:800, letterSpacing:0.7 }}>
              {isHindi ? "परिणाम" : "YOUR RESULT"}
            </span>
          </div>
          <div onClick={(e)=>{e.stopPropagation();haptic();setOpen(false);}} style={{width:24,height:24,borderRadius:12,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            <span style={{color:"rgba(255,255,255,0.6)",fontSize:13,lineHeight:1,marginTop:-1}}>×</span>
          </div>
        </div>
      </div>

      {/* Animated total */}
      <div style={{ textAlign:"center", padding:"8px 0 14px", position:"relative" }}>
        {/* Ambient glow behind number */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:220, height:70, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,153,51,0.14) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.4, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", marginBottom:5, fontFamily:bf }}>
          {isHindi ? "आपको मिल सकता है" : "You May Receive Up To"}
        </div>
        <div style={{
          fontSize: 40, fontWeight: 900,
          fontFamily: "'Noto Sans', sans-serif",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          background: "linear-gradient(90deg, #FF9933 0%, #FFD700 40%, #FFA500 70%, #FF9933 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          backgroundSize: "300% 100%",
          animation: revealed ? "calc-shimmer 3.5s linear infinite" : "none",
          letterSpacing: -1,
          transition: "all 0.3s",
          display: "inline-block",
        }}>
          {`₹${animTotal.toLocaleString("en-IN")}`}
        </div>
        <div style={{ marginTop:6, fontSize:10.5, color:"rgba(255,255,255,0.38)", fontFamily:bf, letterSpacing:0.3 }}>
          {isHindi ? "हर साल — सरकारी योजनाओं से" : "every year — from government schemes"}
        </div>
      </div>

      {/* Separator */}
      <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", marginBottom:12 }}/>

      {/* Scheme breakdown list */}
      <div style={{ fontSize:9.5, color:"rgba(255,255,255,0.4)", marginBottom:8, fontFamily:bf, letterSpacing:0.3, display:"flex", alignItems:"center", gap:4 }}>
        <span>👇</span>
        <span>{isHindi ? "किसी योजना पर टैप करें — आवेदन करें" : "Tap any scheme to view & apply"}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {visibleSchemes.map((s, i) => (
          <div key={s.id}
            onClick={() => { haptic(); onSchemeOpen && onSchemeOpen(s.id); }}
            style={{
              display:"flex", alignItems:"center", gap:10,
              background:"rgba(255,255,255,0.06)",
              border:`1px solid ${s.color}30`,
              borderRadius:14, padding:"10px 12px",
              cursor:"pointer",
              animation:`calc-slide-in 0.38s cubic-bezier(0.22,1,0.36,1) ${0.05 + i * 0.06}s both`,
              transition:"background 0.18s",
              WebkitTapHighlightColor:"transparent",
            }}
            onTouchStart={e => e.currentTarget.style.background="rgba(255,255,255,0.11)"}
            onTouchEnd={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
          >
            <div style={{ width:32, height:32, background:s.color+"22", border:`1.5px solid ${s.color}50`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
              {s.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11.5, fontWeight:700, color:"rgba(255,255,255,0.9)", fontFamily:bf, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {s.name[lang]}
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2, fontFamily:bf }}>
                {isHindi ? "टैप करें — आवेदन देखें" : "Tap to view & apply"}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3, flexShrink:0 }}>
              <div style={{ fontSize:12, fontWeight:800, color:s.color, background:s.color+"1a", borderRadius:8, padding:"3px 9px", border:`1px solid ${s.color}30` }}>
                {formatINR(s.annual)}{isHindi ? "/वर्ष" : "/yr"}
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", paddingRight:2 }}>→</div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more toggle */}
      {schemesWithBenefit.length > 3 && (
        <div onClick={() => { haptic(); setExpanded(e => !e); }}
          style={{ marginTop:10, textAlign:"center", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", cursor:"pointer", padding:"7px 0 2px", borderTop:"1px solid rgba(255,255,255,0.07)", transition:"color 0.2s" }}>
          {expanded
            ? (isHindi ? "कम दिखाएं ↑" : "Show less ↑")
            : (isHindi ? `+${schemesWithBenefit.length - 3} और योजनाएं ↓` : `+${schemesWithBenefit.length - 3} more schemes ↓`)}
        </div>
      )}

      {/* Bottom disclaimer */}
      <div style={{ marginTop:10, fontSize:10, color:"rgba(255,255,255,0.32)", textAlign:"center", lineHeight:1.5, fontFamily:bf }}>
        {isHindi
          ? "* यह अनुमान है। असली लाभ पाने के लिए योजना में आवेदन करें।"
          : "* Estimated amount. Apply to each scheme to confirm & claim your benefits."}
      </div>
    </div>
  );
}

// ─── DOCUMENT VAULT CARD ──────────────────────────────────────────────────────
const DOC_VAULT_KEY = "yojana_doc_vault";

// Canonical doc groups — order matters: aadhaar_pan must come before aadhaar
const DOC_CANON = [
  { key:"aadhaar_pan",   en:"Aadhaar & PAN Card",               hi:"आधार और पैन कार्ड",           kw:["aadhaar","pan"] },
  { key:"aadhaar",       en:"Aadhaar Card",                     hi:"आधार कार्ड",                   kw:["aadhaar"] },
  { key:"bank",          en:"Bank Account / Passbook",           hi:"बैंक खाता / पासबुक",           kw:["bank"] },
  { key:"income",        en:"Income Certificate",                hi:"आय प्रमाण पत्र",               kw:["income"] },
  { key:"ration",        en:"Ration Card",                      hi:"राशन कार्ड",                   kw:["ration"] },
  { key:"bpl",           en:"BPL Certificate",                  hi:"बीपीएल प्रमाण पत्र",           kw:["bpl"] },
  { key:"caste",         en:"Caste / Category Certificate",     hi:"जाति प्रमाण पत्र",             kw:["caste","category cert","obc","sc/st"] },
  { key:"land",          en:"Land / Property Documents",        hi:"भूमि दस्तावेज़",               kw:["land","khasra","property"] },
  { key:"photo",         en:"Passport Size Photos",             hi:"पासपोर्ट साइज़ फोटो",          kw:["photo"] },
  { key:"address",       en:"Address Proof",                    hi:"पता प्रमाण",                   kw:["address"] },
  { key:"marksheet",     en:"Mark Sheets / Academic Records",   hi:"मार्कशीट / शैक्षणिक प्रमाण",  kw:["mark sheet","marksheet","mark"] },
  { key:"school_enroll", en:"School / Enrollment Certificate",  hi:"स्कूल / नामांकन प्रमाण",      kw:["school enroll","enrollment","school cert"] },
  { key:"domicile",      en:"Domicile / Residence Certificate", hi:"निवास प्रमाण पत्र",            kw:["domicile","residence cert"] },
  { key:"disability",    en:"Disability Certificate",           hi:"दिव्यांग प्रमाण पत्र",         kw:["disability"] },
  { key:"mobile",        en:"Mobile Number (Aadhaar-linked)",   hi:"मोबाइल नंबर (आधार लिंक)",     kw:["mobile number"] },
  { key:"self_decl",     en:"Self-Declaration",                 hi:"स्व-घोषणा पत्र",               kw:["self-declar","self declar"] },
  { key:"business_plan", en:"Business Plan",                    hi:"व्यापार योजना",                kw:["business plan"] },
  { key:"birth_cert",    en:"Birth Certificate",                hi:"जन्म प्रमाण पत्र",             kw:["birth cert","birth"] },
  { key:"voter",         en:"Voter ID",                         hi:"मतदाता पहचान पत्र",            kw:["voter"] },
  { key:"driving",       en:"Driving License",                  hi:"ड्राइविंग लाइसेंस",            kw:["driving"] },
];

// Returns a canonical key for any raw English doc name string.
// Strips parentheticals, then maps to known groups. Falls back to slugified name.
function canonicalDocKey(rawEn) {
  const s = rawEn.toLowerCase().replace(/\s*\([^)]*\)/g,"").trim();
  for (const g of DOC_CANON) {
    if (g.key === "aadhaar_pan") {
      if (s.includes("aadhaar") && s.includes("pan")) return g.key;
      continue;
    }
    if (g.kw.some(kw => s.includes(kw))) return g.key;
  }
  return s.replace(/\s+/g,"_").slice(0,40);
}

function DocumentVaultCard({ allMatchedSchemes, lang, dark, uid }) {
  const th = THEME[dark ? "dark" : "light"];
  const isHindi = lang === "hi";
  const bf = fontFamily(lang);
  const [showAll, setShowAll] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [open, setOpen] = useState(false);
  // ── UID-namespaced key so each account has its own checklist ──
  const vaultKey = uid ? `yojana_doc_vault_${uid}` : "yojana_doc_vault_guest";

  // Smart de-duped doc map: canonical key → { en, hi, schemes[] }
  // Groups all Aadhaar variants → one entry, all Bank variants → one entry, etc.
  const docMap = useMemo(() => {
    const map = {};
    allMatchedSchemes.forEach(scheme => {
      const enDocs = scheme.docs?.en || [];
      const hiDocs = scheme.docs?.hi || [];
      enDocs.forEach((rawEn, i) => {
        const ck = canonicalDocKey(rawEn);
        if (!map[ck]) {
          const canon = DOC_CANON.find(g => g.key === ck);
          map[ck] = {
            key:     ck,
            en:      canon ? canon.en : rawEn.replace(/\s*\([^)]*\)/g,"").trim(),
            hi:      canon ? canon.hi : (hiDocs[i] || rawEn),
            schemes: [],
          };
        }
        if (!map[ck].schemes.find(s => s.id === scheme.id)) {
          map[ck].schemes.push({ id:scheme.id, name:scheme.name, color:scheme.color, icon:scheme.icon });
        }
      });
    });
    // Sort by impact (scheme count) descending so most important docs are first
    return Object.values(map).sort((a,b) => b.schemes.length - a.schemes.length);
  }, [allMatchedSchemes]);

  // Load checked state whenever the vault key changes (i.e. different user logs in)
  const [checked, setChecked] = useState({});
  useEffect(() => {
    try { setChecked(JSON.parse(localStorage.getItem(vaultKey) || "{}")); }
    catch { setChecked({}); }
  }, [vaultKey]);

  const toggle = useCallback((key) => {
    haptic();
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(vaultKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [vaultKey]);

  const checkedCount = docMap.filter(d => checked[d.key]).length;
  const total        = docMap.length;
  const pct          = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  const allDone      = checkedCount === total && total > 0;

  useEffect(() => {
    if (allDone) { setCelebrate(true); const t = setTimeout(() => setCelebrate(false), 2500); return () => clearTimeout(t); }
  }, [allDone]);

  // Unchecked first (sorted by impact), checked last
  const sortedDocs = useMemo(() =>
    [...docMap].sort((a,b) => {
      const ac = checked[a.key] ? 1 : 0;
      const bc = checked[b.key] ? 1 : 0;
      if (ac !== bc) return ac - bc;
      return b.schemes.length - a.schemes.length;
    }),
    [docMap, checked]
  );
  const visibleDocs = showAll ? sortedDocs : sortedDocs.slice(0, 6);

  if (docMap.length === 0) return null;

  const progressColor = pct === 100 ? "#138808" : pct >= 60 ? "#FF9933" : "#e53e3e";

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  if (!open) return (
    <div onClick={() => { haptic(); setOpen(true); }} style={{
      display:"flex", alignItems:"center", gap:10,
      background: dark ? "linear-gradient(135deg,#1a1a2e,#16213e)" : "linear-gradient(135deg,#EFF6FF,#F0FDF4)",
      border: `1px solid ${dark?"rgba(255,255,255,0.1)":th.border}`,
      borderRadius:50, padding:"10px 14px", marginBottom:12,
      cursor:"pointer", WebkitTapHighlightColor:"transparent",
      boxShadow: dark?"0 4px 16px rgba(0,0,0,0.22)":"0 2px 10px rgba(0,0,0,0.06)",
      transition:"transform 0.14s", willChange:"transform",
    }}
    onTouchStart={e=>e.currentTarget.style.transform="scale(0.97)"}
    onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
    onTouchCancel={e=>e.currentTarget.style.transform="scale(1)"}>
      <div style={{width:34,height:34,background:`linear-gradient(135deg,${ASHOKA_BLUE}22,${ASHOKA_BLUE}0a)`,border:`1.5px solid ${ASHOKA_BLUE}30`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📁</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{color:th.textSub,fontSize:9,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase"}}>{isHindi?"दस्तावेज़ चेकलिस्ट":"Document Checklist"}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
          <div style={{flex:1,height:4,background:dark?"rgba(255,255,255,0.1)":"#e2e8f0",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:pct===100?"linear-gradient(90deg,#22c55e,#16a34a)":pct>=60?"linear-gradient(90deg,#FF9933,#f97316)":"linear-gradient(90deg,#ef4444,#dc2626)",borderRadius:4,transition:"width 0.6s"}}/>
          </div>
          <span style={{color:th.text,fontSize:10,fontWeight:800,fontVariantNumeric:"tabular-nums",flexShrink:0}}>{checkedCount}<span style={{color:th.textSub,fontWeight:500}}>/{total}</span></span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <div style={{background:pct===100?"rgba(34,197,94,0.15)":dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",border:`1px solid ${pct===100?"rgba(34,197,94,0.3)":th.border}`,borderRadius:20,padding:"3px 8px",color:pct===100?"#22c55e":th.textSub,fontSize:8,fontWeight:800}}>
          {pct}%
        </div>
        <span style={{color:th.textSub,fontSize:16,lineHeight:1,marginTop:1}}>›</span>
      </div>
    </div>
  );

  return (
    <div style={{
      background: th.card, borderRadius: 20, marginBottom: 16,
      overflow: "hidden",
      boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.25)" : "0 4px 24px rgba(0,0,0,0.07)",
      border: `1.5px solid ${th.border}`,
    }}>

      {/* Header */}
      <div style={{
        background: dark ? "linear-gradient(135deg,#1a1a2e,#16213e)" : "linear-gradient(135deg,#EFF6FF,#F0FDF4)",
        padding: "16px 16px 14px", borderBottom: `1px solid ${th.border}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${ASHOKA_BLUE},${IND_GREEN})` }}/>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:38, height:38, background:`linear-gradient(135deg,${ASHOKA_BLUE}22,${ASHOKA_BLUE}0a)`, border:`1.5px solid ${ASHOKA_BLUE}30`, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
            📁
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, fontFamily:bf, lineHeight:1.2 }}>
              {isHindi ? "दस्तावेज़ चेकलिस्ट" : "Document Checklist"}
            </div>
            <div style={{ fontSize:10, color:th.textSub, marginTop:2 }}>
              {isHindi
                ? `आवेदन से पहले ये ${total} दस्तावेज़ तैयार रखें`
                : `Collect these ${total} documents before applying`}
            </div>
          </div>
          {/* Progress pill + collapse */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{
              background: pct === 100 ? "#DCFCE7" : dark ? "#2c2c2e" : "#F1F5F9",
              border: `1.5px solid ${pct === 100 ? "#86EFAC" : th.border2}`,
              borderRadius: 20, padding: "5px 11px",
              display:"flex", alignItems:"center", gap:5, transition:"all 0.4s",
            }}>
              <span style={{ fontSize:13 }}>{pct === 100 ? "🎉" : "📋"}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:800, color: pct === 100 ? "#16a34a" : th.text, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
                  {checkedCount}<span style={{ fontWeight:500, color:th.textSub }}>/{total}</span>
                </div>
                <div style={{ fontSize:9, color:th.textSub, fontWeight:600 }}>
                  {isHindi ? "मिले" : "Collected"}
                </div>
              </div>
            </div>
            <div onClick={(e)=>{e.stopPropagation();haptic();setOpen(false);}} style={{width:24,height:24,borderRadius:12,background:dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              <span style={{color:th.textSub,fontSize:13,lineHeight:1,marginTop:-1}}>×</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height:6, background:dark?"#2c2c2e":"#e8edf2", borderRadius:6, overflow:"hidden" }}>
          <div style={{
            height:"100%", width:`${pct}%`, borderRadius:6,
            background: pct === 100 ? "linear-gradient(90deg,#22c55e,#16a34a)" : pct >= 60 ? "linear-gradient(90deg,#FF9933,#f97316)" : "linear-gradient(90deg,#ef4444,#dc2626)",
            transition:"width 0.7s cubic-bezier(0.22,1,0.36,1)",
            boxShadow:`0 0 8px ${progressColor}66`,
          }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
          <span style={{ fontSize:10, color:th.textSub, fontFamily:bf }}>
            {pct === 100
              ? (isHindi ? "✅ सभी दस्तावेज़ तैयार!" : "✅ All docs ready!")
              : isHindi ? `${total - checkedCount} बाकी` : `${total - checkedCount} remaining`}
          </span>
          <span style={{ fontSize:10, fontWeight:700, color:progressColor, transition:"color 0.4s" }}>{pct}%</span>
        </div>
      </div>

      {/* Celebration banner */}
      {celebrate && (
        <div style={{ background:"linear-gradient(135deg,#138808,#16a34a)", padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>🎉</span>
          <div>
            <div style={{ color:"#fff", fontSize:13, fontWeight:800, fontFamily:bf }}>
              {isHindi ? "शाबाश! सभी दस्तावेज़ तैयार हैं!" : "Amazing! All documents ready!"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:10, marginTop:1 }}>
              {isHindi ? "आप सभी योजनाओं के लिए आवेदन कर सकते हैं।" : "You\'re set to apply for all your schemes."}
            </div>
          </div>
        </div>
      )}

      {/* Tap instruction */}
      <div style={{
        display:"flex", alignItems:"center", gap:7,
        padding:"9px 16px 6px",
        borderBottom:`1px solid ${th.divider}`,
        background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
      }}>
        <span style={{ fontSize:13 }}>👆</span>
        <span style={{ fontSize:11, color:th.textSub, fontFamily:bf, lineHeight:1.4 }}>
          {isHindi
            ? "जो दस्तावेज़ आपके पास है, उसे टैप करके ✓ करें"
            : "Tap a document to mark it as collected ✓"}
        </span>
      </div>

      {/* Doc list */}
      <div style={{ padding:"8px 0 4px" }}>
        {visibleDocs.map((doc, i) => {
          const isChecked = !!checked[doc.key];
          const docName   = lang === "hi" ? doc.hi : doc.en;
          const impact    = doc.schemes.length;
          return (
            <div key={doc.key} onClick={() => toggle(doc.key)} style={{
              display:"flex", alignItems:"flex-start", gap:12,
              padding:"11px 16px",
              borderBottom: i < visibleDocs.length - 1 ? `1px solid ${th.divider}` : "none",
              cursor:"pointer",
              background: isChecked ? (dark ? "rgba(19,136,8,0.08)" : "rgba(19,136,8,0.04)") : "transparent",
              transition:"background 0.25s, transform 0.15s",
              WebkitTapHighlightColor:"transparent",
            }}
            onTouchStart={e => e.currentTarget.style.background = isChecked
              ? (dark ? "rgba(19,136,8,0.14)" : "rgba(19,136,8,0.08)")
              : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)")}
            onTouchEnd={e => e.currentTarget.style.background = isChecked
              ? (dark ? "rgba(19,136,8,0.08)" : "rgba(19,136,8,0.04)")
              : "transparent"}
            >
              {/* Checkbox */}
              <div style={{
                width:22, height:22, borderRadius:7, flexShrink:0, marginTop:1,
                border:`2px solid ${isChecked ? IND_GREEN : th.border3}`,
                background: isChecked ? `linear-gradient(135deg,${IND_GREEN},#16a34a)` : th.optionBg,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.22s cubic-bezier(0.22,1,0.36,1)",
                boxShadow: isChecked ? `0 2px 8px rgba(19,136,8,0.35)` : "none",
                transform: isChecked ? "scale(1.08)" : "scale(1)",
              }}>
                {isChecked && (
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Doc info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <div style={{
                    fontSize:13, fontWeight: isChecked ? 600 : 700,
                    color: isChecked ? th.textSub : th.text, fontFamily:bf, lineHeight:1.3, flex:1, minWidth:0,
                    textDecoration: isChecked ? "line-through" : "none",
                    textDecorationColor: th.textSub, transition:"all 0.2s",
                  }}>
                    {docName}
                  </div>
                  {/* Priority badge */}
                  <div style={{
                    flexShrink:0, fontSize:9, fontWeight:700, borderRadius:10, padding:"2px 7px", whiteSpace:"nowrap",
                    background: impact >= 5 ? `${IND_GREEN}18` : impact >= 3 ? `${SAFFRON}18` : `${ASHOKA_BLUE}12`,
                    color:       impact >= 5 ? IND_GREEN        : impact >= 3 ? SAFFRON        : ASHOKA_BLUE,
                    transition:"all 0.3s",
                  }}>
                    {impact >= 5
                      ? (isHindi ? "⚡ सबसे ज़रूरी" : "⚡ Most needed")
                      : impact >= 3
                        ? (isHindi ? "🔶 ज़रूरी" : "🔶 Important")
                        : (isHindi ? `${impact} योजना` : `${impact} scheme${impact===1?"":"s"}`)}
                  </div>
                </div>
                {/* Needed for label + scheme pills */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:4, alignItems:"center" }}>
                  <span style={{ fontSize:9, color:th.textSub, fontWeight:600, marginRight:2 }}>
                    {isHindi ? "चाहिए:" : "Needed for:"}
                  </span>
                  {doc.schemes.slice(0,2).map(s => (
                    <div key={s.id} style={{
                      display:"inline-flex", alignItems:"center", gap:3,
                      background: s.color + (dark ? "22" : "14"),
                      border:`1px solid ${s.color}30`,
                      borderRadius:20, padding:"2px 7px",
                    }}>
                      <span style={{ fontSize:9 }}>{s.icon}</span>
                      <span style={{ fontSize:9.5, fontWeight:700, color:s.color, lineHeight:1, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {s.name.en.length > 18 ? s.name.en.slice(0,16)+"…" : s.name.en}
                      </span>
                    </div>
                  ))}
                  {doc.schemes.length > 2 && (
                    <div style={{ display:"inline-flex", alignItems:"center", background:th.pillBg, borderRadius:20, padding:"2px 7px" }}>
                      <span style={{ fontSize:9.5, fontWeight:700, color:th.textSub }}>+{doc.schemes.length - 2}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show all / collapse */}
      {sortedDocs.length > 6 && (
        <div onClick={() => { haptic(); setShowAll(v => !v); }} style={{
          padding:"11px 16px", borderTop:`1px solid ${th.border}`,
          display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          cursor:"pointer", background: dark ? th.card2 : "#FAFAFA",
        }}>
          <span style={{ fontSize:12, fontWeight:700, color:ASHOKA_BLUE, fontFamily:bf }}>
            {showAll
              ? (isHindi ? "कम दिखाएं" : "Show less")
              : (isHindi ? `सभी ${sortedDocs.length} दस्तावेज़ देखें` : `See all ${sortedDocs.length} documents`)}
          </span>
          <span style={{ color:ASHOKA_BLUE, fontSize:14, display:"inline-block", transform: showAll ? "rotate(180deg)" : "none", transition:"transform 0.25s" }}>▾</span>
        </div>
      )}

      {/* DigiLocker CTA */}
      <div style={{ margin:"10px 16px 14px" }}>
        <div onClick={() => { haptic(); window.open("https://www.digilocker.gov.in","_blank"); }}
          style={{
            background:"linear-gradient(135deg,#003580,#1a56db)",
            borderRadius:12, padding:"12px 14px",
            display:"flex", alignItems:"center", gap:10,
            cursor:"pointer", boxShadow:"0 4px 14px rgba(0,53,128,0.22)",
            transition:"transform 0.15s, box-shadow 0.15s",
            WebkitTapHighlightColor:"transparent",
          }}
          onTouchStart={e => { e.currentTarget.style.transform="scale(0.98)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,53,128,0.18)"; }}
          onTouchEnd={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(0,53,128,0.22)"; }}
        >
          <div style={{ width:36, height:36, background:"rgba(255,255,255,0.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, border:"1px solid rgba(255,255,255,0.2)" }}>
            🔒
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:12, fontWeight:800, fontFamily:bf }}>
              {isHindi ? "DigiLocker में सेव करें" : "Store docs in DigiLocker"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:10, marginTop:2, lineHeight:1.4 }}>
              {isHindi
                ? "सरकारी ऐप · आधार, PAN, सभी दस्तावेज़ एक जगह रखें"
                : "Free govt. app — keep Aadhaar, PAN & all docs in one safe place"}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0 }}>
            <span style={{ color:"rgba(255,255,255,0.8)", fontSize:16 }}>↗</span>
            <span style={{ color:"rgba(255,255,255,0.45)", fontSize:8, fontWeight:700 }}>
              {isHindi ? "खोलें" : "Open"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP STYLES (module-level — allocated once, never recreated on re-render) ──
const APP_STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .fu{opacity:0;transform:translateY(20px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1);}
        .fu.show{opacity:1;transform:translateY(0);}
        .ch{transition:transform 0.2s;cursor:pointer;} .ch:active{transform:scale(0.97);}
        .sc:hover{transform:translateY(-2px);}
        .spin{animation:spin 20s linear infinite;}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{display:none;}
        .tb{font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;}
        .sb{transition:all 0.3s;} .sb.fc{box-shadow:0 0 0 3px rgba(255,153,51,0.25);}
        .s1{transition-delay:0.1s!important}.s2{transition-delay:0.2s!important}.s3{transition-delay:0.3s!important}
        .s4{transition-delay:0.4s!important}.s5{transition-delay:0.5s!important}.s6{transition-delay:0.6s!important}
        .c0{transition-delay:0.20s!important}.c1{transition-delay:0.28s!important}.c2{transition-delay:0.36s!important}
        .c3{transition-delay:0.44s!important}.c4{transition-delay:0.52s!important}.c5{transition-delay:0.60s!important}
        .c6{transition-delay:0.68s!important}.c7{transition-delay:0.76s!important}.c8{transition-delay:0.84s!important}
        /* ── FINAL PREMIUM NAV ── */
        .bn{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          cursor:pointer;flex:1;-webkit-tap-highlight-color:transparent;
          position:relative;padding:5px 2px 4px;
          opacity:0;transform:translateY(6px);
          animation:navItemIn 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .bn:nth-child(2){animation-delay:0.03s;}
        .bn:nth-child(3){animation-delay:0.06s;}
        .bn:nth-child(4){animation-delay:0.09s;}
        .bn:nth-child(5){animation-delay:0.12s;}
        .bn:nth-child(6){animation-delay:0.15s;}
        @keyframes navItemIn{
          from{opacity:0;transform:translateY(6px);}
          to{opacity:1;transform:translateY(0);}
        }
        /* Pill — NO padding transition (causes reflow/jump).
           Use scaleX on a pseudo-width via transform instead.
           Pill stays same padding always; width controlled by label visibility. */
        .bn-pill{
          display:flex;flex-direction:row;align-items:center;justify-content:center;
          gap:0px;
          padding:8px 13px;border-radius:50px;
          transition:
            background 0.38s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.38s cubic-bezier(0.16,1,0.3,1),
            border-color 0.38s ease,
            gap 0.38s cubic-bezier(0.16,1,0.3,1);
          will-change:background,box-shadow;
          border:1px solid transparent;
          overflow:hidden;
        }
        .bn-pill.active{
          background:linear-gradient(145deg,rgba(255,153,51,0.15) 0%,rgba(255,107,0,0.09) 100%);
          box-shadow:0 2px 14px rgba(255,153,51,0.18), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(255,153,51,0.10);
          border-color:rgba(255,153,51,0.20);
          gap:7px;
        }
        /* Tap feedback — gentle, no jump */
        .bn:active .bn-pill{
          transform:scale(0.92);
          transition:transform 0.12s cubic-bezier(0.16,1,0.3,1);
        }
        /* Icon — NO translateY, only gentle scale */
        .bn-icon-wrap{
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;
          transition:filter 0.28s ease;
          will-change:filter;
        }
        .bn-icon-wrap.popping{animation:navIconPop 0.45s cubic-bezier(0.16,1,0.3,1) forwards;}
        @keyframes navIconPop{
          0%  {transform:scale(1);}
          40% {transform:scale(1.18);}
          70% {transform:scale(0.94);}
          100%{transform:scale(1);}
        }
        /* Chakra */
        @keyframes navChakraSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .bn-chakra-active{animation:navChakraSpin 3s linear infinite;}
        /* Label — clip-path fade instead of max-width (no reflow, truly smooth) */
        .bn-label{
          font-size:10.5px;font-weight:800;letter-spacing:0.1px;white-space:nowrap;
          overflow:hidden;
          /* clip-path slides the label in from left, opacity fades it */
          clip-path:inset(0 100% 0 0);
          opacity:0;
          width:0;
          transition:
            clip-path 0.42s cubic-bezier(0.16,1,0.3,1),
            opacity 0.30s ease,
            width 0.42s cubic-bezier(0.16,1,0.3,1);
        }
        .bn-label.active{
          clip-path:inset(0 0% 0 0);
          opacity:1;
          width:52px;
        }
        /* Glow dot — fades in softly, no spring bounce */
        .bn-dot{
          width:3px;height:3px;border-radius:50%;
          background:linear-gradient(135deg,#FF9933,#FF6B00);
          position:absolute;bottom:1px;left:50%;transform:translateX(-50%);
          box-shadow:0 0 6px rgba(255,153,51,0.85),0 0 12px rgba(255,107,0,0.4);
          animation:dotFadeIn 0.35s ease forwards;
        }
        @keyframes dotFadeIn{from{opacity:0;transform:translateX(-50%) scale(0.3);}to{opacity:1;transform:translateX(-50%) scale(1);}}

        .cp{animation:cp 2.5s ease-in-out infinite;}
        @keyframes cp{0%,100%{box-shadow:0 6px 24px rgba(19,136,8,0.3)}50%{box-shadow:0 6px 32px rgba(19,136,8,0.55)}}
        .app-root{height:100vh;height:100dvh;}
        .bnav-wrap{flex-shrink:0;position:sticky;bottom:0;padding-bottom:max(20px,env(safe-area-inset-bottom,20px));}
        @keyframes fadeSlide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
        /* ── Direction-aware question transitions ── */
        @keyframes q-enter-fwd{from{opacity:0;transform:translateX(52px)}to{opacity:1;transform:translateX(0)}}
        @keyframes q-enter-bwd{from{opacity:0;transform:translateX(-52px)}to{opacity:1;transform:translateX(0)}}
        @keyframes briefSlideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes briefDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        @keyframes briefTextReveal{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        /* Direction-aware slide: swipe-left → new tab enters from right; swipe-right → from left */
        /* Direction-aware slide — opacity stays 1 the whole time, no flash frame */
        @keyframes slideInFromRight{
          from{transform:translateX(60px);}
          to  {transform:translateX(0);}
        }
        @keyframes slideInFromLeft{
          from{transform:translateX(-60px);}
          to  {transform:translateX(0);}
        }
        @keyframes tabEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes iconPop{0%{transform:scale(1)}45%{transform:scale(1.28)}100%{transform:scale(1)}}
        @keyframes answer-lock-pulse{0%{transform:scale(1)}35%{transform:scale(1.04)}70%{transform:scale(0.98)}100%{transform:scale(1)}}
        @keyframes heroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes badgePulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes offlineBannerIn{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes aiPillShimmer{
          0%  {background-position:200% center}
          100%{background-position:-200% center}
        }
        @keyframes calc-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.45;transform:scale(0.85)}}
        @keyframes calc-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes calc-slide-in{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}

        /* ── Theatrical Reveal Screen ─────────────────────────────────────────── */
        @keyframes reveal-overlay-in{from{opacity:0}to{opacity:1}}
        @keyframes reveal-bg-pulse{0%,100%{opacity:0.06}50%{opacity:0.13}}
        @keyframes reveal-count-pop{
          0%  {opacity:0;transform:scale(0.4) translateY(22px)}
          65% {transform:scale(1.07) translateY(-4px)}
          100%{opacity:1;transform:scale(1) translateY(0)}
        }
        @keyframes reveal-found-glow{
          0%,100%{text-shadow:0 0 28px rgba(255,153,51,0.45),0 0 55px rgba(255,153,51,0.2)}
          50%    {text-shadow:0 0 50px rgba(255,153,51,0.85),0 0 90px rgba(255,153,51,0.45)}
        }
        /* ── Celebration Moment ───────────────────────────────────────────────── */
        @keyframes confetti-fall{
          0%  {transform:translateY(-10px) rotate(0deg)  scaleX(1);  opacity:1}
          20% {transform:translateY(20vh)  rotate(180deg) scaleX(-1); opacity:1}
          50% {transform:translateY(55vh)  rotate(400deg) scaleX(1);  opacity:0.9}
          85% {opacity:0.6}
          100%{transform:translateY(115vh) rotate(720deg) scaleX(-1); opacity:0}
        }
        @keyframes celebrate-card-in{
          0%  {opacity:0;transform:scale(0.80) translateY(16px)}
          55% {transform:scale(1.03)  translateY(-3px)}
          100%{opacity:1;transform:scale(1)    translateY(0)}
        }
        @keyframes celebrate-amount-pop{
          0%  {opacity:0;transform:scale(0.55) translateY(8px)}
          60% {transform:scale(1.06) translateY(-2px)}
          100%{opacity:1;transform:scale(1)    translateY(0)}
        }
        @keyframes celebrate-emoji-pop{
          0%  {opacity:0;transform:scale(0.3) rotate(-20deg)}
          55% {transform:scale(1.25) rotate(10deg)}
          75% {transform:scale(0.92) rotate(-4deg)}
          100%{opacity:1;transform:scale(1)    rotate(0deg)}
        }
        @keyframes celebrate-fade-out{
          0%  {opacity:1}
          100%{opacity:0;pointer-events:none}
        }
        /* 8-directional fly-in keyframes for scheme icons */
        @keyframes fly-from-tl{from{opacity:0;transform:translate(-100px,-90px) scale(0.2)}to{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes fly-from-tr{from{opacity:0;transform:translate(100px,-90px)  scale(0.2)}to{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes fly-from-bl{from{opacity:0;transform:translate(-100px,90px)  scale(0.2)}to{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes fly-from-br{from{opacity:0;transform:translate(100px,90px)   scale(0.2)}to{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes fly-from-t {from{opacity:0;transform:translate(0,-100px)     scale(0.2)}to{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes fly-from-b {from{opacity:0;transform:translate(0,100px)      scale(0.2)}to{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes fly-from-l {from{opacity:0;transform:translate(-100px,0)     scale(0.2)}to{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes fly-from-r {from{opacity:0;transform:translate(100px,0)      scale(0.2)}to{opacity:1;transform:translate(0,0) scale(1)}}
        @keyframes vault-slide-down{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes vault-row-in{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes vault-check{from{stroke-dashoffset:20}to{stroke-dashoffset:0}}
        .tab-enter{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden;animation:tabEnter 0.28s cubic-bezier(0.22,1,0.36,1);}
        .tab-enter-left {animation:slideInFromRight 0.30s cubic-bezier(0.25,1,0.5,1) both;}
        .tab-enter-right{animation:slideInFromLeft  0.30s cubic-bezier(0.25,1,0.5,1) both;}
        .bn-icon{transition:transform 0.2s cubic-bezier(0.22,1,0.36,1);}
        .bn-icon.active{animation:iconPop 0.35s cubic-bezier(0.22,1,0.36,1);}
        @keyframes btn-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes btn-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes btn-pulse-scale{0%,100%{transform:scale(1)}50%{transform:scale(1.012)}}
        .signin-loading{background-size:200% auto!important;animation:btn-shimmer 1.4s linear infinite,btn-pulse-scale 1.4s ease-in-out infinite!important;}
        .btn-spinner{width:17px;height:17px;border-radius:50%;border:2.5px solid rgba(255,255,255,0.35);border-top-color:#fff;animation:btn-spin 0.75s linear infinite;flex-shrink:0;}
        .google-spinner{width:17px;height:17px;border-radius:50%;border:2.5px solid rgba(66,133,244,0.25);border-top-color:#4285F4;animation:btn-spin 0.75s linear infinite;flex-shrink:0;}

        /* ── Premium filter pills ── */
        .fpill{
          display:inline-flex;align-items:center;white-space:nowrap;
          padding:7px 16px;border-radius:50px;
          font-size:12px;font-weight:700;letter-spacing:0.25px;
          cursor:pointer;user-select:none;flex-shrink:0;
          transition:
            background 0.28s cubic-bezier(0.34,1.56,0.64,1),
            color 0.22s ease,
            border-color 0.28s ease,
            box-shadow 0.28s cubic-bezier(0.34,1.56,0.64,1),
            transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
          -webkit-tap-highlight-color:transparent;
          will-change:transform;
        }
        .fpill:active{transform:scale(0.91);transition:transform 0.1s ease,box-shadow 0.1s ease;}
        .fpill-state{
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 13px;border-radius:50px;cursor:pointer;
          font-size:11px;font-weight:700;flex-shrink:0;
          transition:
            background 0.28s cubic-bezier(0.34,1.56,0.64,1),
            border-color 0.28s ease,
            box-shadow 0.28s cubic-bezier(0.34,1.56,0.64,1),
            transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
          -webkit-tap-highlight-color:transparent;
          will-change:transform;
        }
        .fpill-state:active{transform:scale(0.93);transition:transform 0.1s ease;}

        /* ── AshokaChakra spin (moved from inline SVG <style>) ── */
        @keyframes chakra-spin{
          from{transform-box:fill-box;transform-origin:center;transform:rotate(0deg)}
          to{transform-box:fill-box;transform-origin:center;transform:rotate(360deg)}
        }

        /* ── Avatar modal animations (moved from inline render <style>) ── */
        @keyframes avBg   { from{opacity:0} to{opacity:1} }
        @keyframes avCard {
          from { opacity:0; transform:scale(0.66) translateY(28px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
        @keyframes premiumSheetUp {
          from { opacity:0; transform:translateY(100%); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes premiumShine {
          0%   { left:-60%; opacity:0; }
          10%  { opacity:1; }
          60%  { left:120%; opacity:1; }
          100% { left:120%; opacity:0; }
        }
        @keyframes avShine {
          0%   { transform:translateX(-200%); }
          100% { transform:translateX(420%);  }
        }
        @keyframes avBadge {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0);    }
        }

        /* ── Sign-out modal animations (moved from inline render <style>) ── */
        @keyframes so_bd{from{opacity:0}to{opacity:1}}
        @keyframes so_in{
          0%  {opacity:0;transform:scale(0.82) translateY(24px)}
          65% {opacity:1;transform:scale(1.02) translateY(-3px)}
          100%{opacity:1;transform:scale(1)   translateY(0)}
        }
        @keyframes so_ring1{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.18);opacity:0}}
        @keyframes so_ring2{0%,100%{transform:scale(1);opacity:0.35}50%{transform:scale(1.32);opacity:0}}
        @keyframes so_iconbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes so_fadeslide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes so_avatarring{0%,100%{box-shadow:0 0 0 3px rgba(255,153,51,0.55)}50%{box-shadow:0 0 0 5px rgba(255,153,51,0.18)}}
        @keyframes so_btnshine{0%{left:-80%}100%{left:130%}}

        /* ── Skeleton shimmer (moved from SkeletonCard inline <style>) ── */
        @keyframes sk-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .sk-s{position:relative;overflow:hidden}
        .sk-s::after{content:"";position:absolute;inset:0;
          background:linear-gradient(90deg,transparent 0%,var(--sk-shimmer-color,rgba(255,255,255,0.75)) 50%,transparent 100%);
          animation:sk-shimmer 1.4s infinite}
        .dark .sk-s::after{
          background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%);
        }

        /* ── Filter Hint Animations ── */
        @keyframes hint-fade-in{
          from{opacity:0}to{opacity:1}
        }
        @keyframes hint-pop-in{
          0%  {opacity:0;transform:translate(-50%,-50%) scale(0.7);}
          65% {opacity:1;transform:translate(-50%,-50%) scale(1.06);}
          100%{opacity:1;transform:translate(-50%,-50%) scale(1);}
        }
        @keyframes hint-finger-slide{
          0%  {transform:translateX(-18px) rotate(-8deg);opacity:0.5;}
          35% {transform:translateX(0px)   rotate(0deg); opacity:1;}
          65% {transform:translateX(18px)  rotate(8deg); opacity:0.5;}
          100%{transform:translateX(-18px) rotate(-8deg);opacity:0.5;}
        }
        @keyframes hint-beam-slide{
          0%  {left:-60px;opacity:0;}
          15% {opacity:1;}
          85% {opacity:0.6;}
          100%{left:calc(100% + 60px);opacity:0;}
        }

        /* ── Login toast animations (moved from ProfileTab inline <style>) ── */
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toastFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        /* ── State chip enter / exit animations ── */
        @keyframes state-chip-in{
          0%  { opacity:0; transform:scale(0.65) translateX(-10px); }
          65% { opacity:1; transform:scale(1.04) translateX(1px); }
          100%{ opacity:1; transform:scale(1)    translateX(0); }
        }
        @keyframes state-chip-out{
          0%  { opacity:1; transform:scale(1)    translateX(0)   scaleY(1); max-width:200px; }
          40% { opacity:0.4; transform:scale(0.88) translateX(-6px) scaleY(0.9); }
          100%{ opacity:0; transform:scale(0.6)  translateX(-14px) scaleY(0.7); max-width:0; }
        }
        .state-chip-enter{
          animation:state-chip-in 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .state-chip-exit{
          animation:state-chip-out 0.28s cubic-bezier(0.4,0,0.6,1) forwards;
          pointer-events:none;
          overflow:hidden;
        }
        .state-chip-close:active{
          transform:scale(0.82) !important;
          background:rgba(255,153,51,0.42) !important;
        }
`;

// ─── ERROR BOUNDARY ─────────────────────────────────────────────────────────────
// Catches any uncaught render/runtime crash anywhere in the tree (including a
// failed lazy-chunk fetch after a deploy, e.g. AdminDashboard/AboutTab/Helpline/
// HomeFAQSection). Without this, the app previously had ZERO error containment —
// any single uncaught error anywhere unmounted the ENTIRE app, leaving only the
// page's static background visible ("blank screen"). Now it shows the real error
// message + a Reload button that also clears caches/service-worker (the most
// common cause of "blank after deploy" on a PWA — a stale cached chunk/shell).
class AppErrorBoundary extends React.Component{
  constructor(props){ super(props); this.state={hasError:false,error:null}; }
  static getDerivedStateFromError(error){ return {hasError:true,error}; }
  componentDidCatch(error,info){
    // eslint-disable-next-line no-console
    console.error("YojanaSahay crashed:",error,info);
  }
  hardReload(){
    try{
      if('serviceWorker' in navigator){
        navigator.serviceWorker.getRegistrations().then(regs=>regs.forEach(r=>r.unregister()));
      }
      if(window.caches){ caches.keys().then(keys=>keys.forEach(k=>caches.delete(k))); }
    }catch{}
    setTimeout(()=>window.location.reload(),150);
  }
  render(){
    if(this.state.hasError){
      const dark=!!this.props.dark;
      return(
        <div style={{
          position:"fixed",inset:0,zIndex:99999,
          background:dark?"#111":"#fff",color:dark?"#f0f0f0":"#1a1a1a",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          padding:24,textAlign:"center",fontFamily:"sans-serif",
        }}>
          <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
          <div style={{fontSize:16,fontWeight:800,marginBottom:8}}>Something went wrong</div>
          <div style={{fontSize:11.5,opacity:0.75,marginBottom:18,maxWidth:340,wordBreak:"break-word",fontFamily:"monospace",whiteSpace:"pre-wrap"}}>
            {String(this.state.error?.message||this.state.error||"Unknown error")}
          </div>
          <div onClick={()=>this.hardReload()} style={{
            padding:"11px 26px",borderRadius:12,background:"#FF9933",color:"#fff",
            fontWeight:700,fontSize:14,cursor:"pointer",
          }}>Reload App</div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
function YojanaSahayInner(){
  const [lang,setLang]=useState(()=>{try{return localStorage.getItem("yojana_lang")||"en";}catch{return "en";}});
  const [dark,setDark]=useState(()=>{try{return localStorage.getItem("yojana_dark")==="true";}catch{return false;}});
  const [activeTab,setActiveTab]=useState("home");
  const [showAdmin,setShowAdmin]=useState(false);
  const [showFAQ,setShowFAQ]=useState(false);

  const [loaded,setLoaded]=useState(false);
  const [langAnim,setLangAnim]=useState(false);
  const [showChecker,setShowChecker]=useState(false);
  const [checkerAnswers,setCheckerAnswers]=useState(null); // answers from latest eligibility recheck (raw, pre-decision)
  const [committedCheckerAnswers,setCommittedCheckerAnswers]=useState(null); // answers committed to BenefitCard only after "Update My Profile" (or when no profile exists)
  const [checkerRunId,setCheckerRunId]=useState(0);        // increments each checker run → forces BenefitCard remount
  const [showUpdateProfileSheet,setShowUpdateProfileSheet]=useState(false); // "just checking / update profile" popup
  const [selectedScheme,setSelectedScheme]=useState(null);   // SchemeDetailSheet
  const [selectedCategory,setSelectedCategory]=useState(null); // CategorySheet
  const [showAvatarModal,setShowAvatarModal]=useState(false);

  // ── Deep-link from static SEO scheme pages ─────────────────────────────────
  // /public/schemes/{id}.html and /public/yojana/{id}.html each link back here
  // as "/?scheme={id}". On first mount, open that scheme's detail sheet
  // automatically, then strip the query param so it doesn't reappear on
  // subsequent in-app navigation or refresh.
  useEffect(()=>{
    try{
      const params = new URLSearchParams(window.location.search);
      const schemeId = params.get("scheme");
      if(schemeId){
        setSelectedScheme(schemeId);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }catch{}
  },[]);

  const [profile,setProfile]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("yojana_profile")||"null")||null;}catch{return null;}
  });
  const [isAdmin,setIsAdmin]=useState(false);
  const [adminTabs,setAdminTabs]=useState(null); // null=full access, array=restricted tabs
  // Live stats — seeded from localStorage cache for instant display, then refreshed from Firestore.
  const [liveCheckerTotal,setLiveCheckerTotal]=useState(()=>{
    try{ const v=localStorage.getItem("yojana_checker_total"); return v!==null?Number(v):null; }catch{ return null; }
  });

  // ── Offline status ─────────────────────────────────────────────────────────
  const isOffline = useOfflineStatus();
  const wasOfflineRef = useRef(false);

  // ── Dismiss HTML splash when React mounts ─────────────────────────────────
  // #html-splash shows instantly before JS loads (pure CSS in index.html).
  // Once React is ready, fade it out and mark session so it won't show again.
  useEffect(()=>{
    const el=document.getElementById('html-splash');
    if(!el)return;
    el.style.transition='opacity 0.35s ease';
    el.style.opacity='0';
    const t=setTimeout(()=>{
      el.remove();
      sessionStorage.setItem('ys_splashed','1');
    },380);
    return()=>clearTimeout(t);
  },[]);

  const toggleDark=useCallback(()=>setDark(d=>!d),[]);

  // ── SMOOTH SWIPE — direction-aware slide transition ────────────────────────
  const swipeRef    = useRef(null);   // { x, y, lockedAxis } from touchstart
  const [swipeDir,  setSwipeDir]  = useState(null);   // "left"|"right"|null
  const dragXRef      = useRef(0);          // live finger offset — no re-render
  const dragTargetRef = useRef(null);       // DOM ref to whichever tab is active
  // Lazy-mount tracker — tabs are only mounted on first visit, then kept alive.
  // We mutate the Set during render (before JSX) so the newly-active tab
  // mounts on the SAME render it becomes active — no one-frame blank flash.
  // "home" is pre-seeded because it's the initial activeTab.
  const mountedTabsRef = useRef(new Set(["home"]));

  const handleTouchStart = useCallback((e) => {
    if (showAdmin || showChecker || showFAQ || selectedScheme || selectedCategory) return;
    const t = e.touches[0];
    swipeRef.current = { x: t.clientX, y: t.clientY, lockedAxis: null };
    dragXRef.current = 0;
    // Safety: clear any stale transform from an interrupted previous touch
    if (dragTargetRef.current) {
      dragTargetRef.current.style.transform = "";
      dragTargetRef.current.style.transition = "";
    }
  }, [showAdmin, showChecker, showFAQ, selectedScheme, selectedCategory]);

  const handleTouchMove = useCallback((e) => {
    if (!swipeRef.current) return;
    const t   = e.touches[0];
    const dx  = t.clientX - swipeRef.current.x;
    const dy  = t.clientY - swipeRef.current.y;

    // Lock axis on first significant movement
    if (swipeRef.current.lockedAxis === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      swipeRef.current.lockedAxis = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
    }
    if (swipeRef.current.lockedAxis !== "h") return;

    const idx = TABS.indexOf(activeTab);
    // Resist at edges — rubber-band feel
    const atStart = idx === 0;
    const atEnd   = idx === TABS.length - 1;
    const rubber  = (raw) => raw * 0.22;
    const clamped = (atStart && dx > 0) ? rubber(dx)
                  : (atEnd   && dx < 0) ? rubber(dx)
                  : dx;

    // Write directly to DOM — zero React re-renders during drag
    const maxDrag = window.innerWidth * 0.55;
    dragXRef.current = Math.max(-maxDrag, Math.min(maxDrag, clamped));
    if (dragTargetRef.current) {
      dragTargetRef.current.style.transform = `translateX(${dragXRef.current}px)`;
      dragTargetRef.current.style.transition = "none";
    }
  }, [activeTab, showAdmin, showChecker, selectedScheme, selectedCategory]);

  const handleTouchEnd = useCallback((e) => {
    if (!swipeRef.current) return;
    const t   = e.changedTouches[0];
    const dx  = t.clientX - swipeRef.current.x;
    const dy  = t.clientY - swipeRef.current.y;
    swipeRef.current = null;

    // Reset DOM directly — one re-render only when tab actually switches
    dragXRef.current = 0;
    if (dragTargetRef.current) {
      dragTargetRef.current.style.transform = "";
      dragTargetRef.current.style.transition = "";
    }

    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    const idx = TABS.indexOf(activeTab);
    if (dx < 0 && idx < TABS.length - 1) {
      haptic();
      setSwipeDir("left");
      setActiveTab(TABS[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      haptic();
      setSwipeDir("right");
      setActiveTab(TABS[idx - 1]);
    }
  }, [activeTab, showAdmin, showChecker, selectedScheme, selectedCategory]);

  // Clear swipeDir after animation completes
  useEffect(() => {
    if (!swipeDir) return;
    const t = setTimeout(() => setSwipeDir(null), 380);
    return () => clearTimeout(t);
  }, [swipeDir]); // activeTab removed — not used inside, was restarting timer on every tab switch

  useEffect(()=>{try{localStorage.setItem("yojana_lang",lang);}catch{}},[lang]);
  useEffect(()=>{try{localStorage.setItem("yojana_dark",dark);}catch{}},[dark]);
  useEffect(()=>{const id=setTimeout(()=>setLoaded(true),100);return()=>clearTimeout(id);},[]);

  // ── Fetch live stats via our own /api/stats proxy ───────────────────────────
  // Instagram/Facebook/Threads in-app browsers commonly block or throttle
  // direct Firestore connections (google firestore.googleapis.com), which used
  // to make this read silently fail and fall back to 0. A request to our own
  // domain (/api/stats) cannot be blocked the same way, since it's same-origin.
  // The serverless function (api/stats.js) reads Firestore server-side with
  // firebase-admin and just returns plain JSON.
  // Direct Firestore read is kept ONLY as a last-resort fallback in case the
  // serverless function itself is ever unreachable (e.g. local dev without
  // `vercel dev`, or a cold-start network blip).
  // 8 s timeout ensures the UI never hangs if everything is offline.
  // Fresh value is cached in localStorage so next visit shows it instantly.
  useEffect(()=>{
    let cancelled=false;
    const applyTotal=(total)=>{
      if(cancelled) return;
      setLiveCheckerTotal(total);
      try{ localStorage.setItem("yojana_checker_total",String(total)); }catch{}
    };
    const directFirestoreFallback=()=>{
      getDoc(doc(db,"appStats","usage"))
        .then(snap=>{
          if(cancelled) return;
          const data=snap.exists()?snap.data():{};
          applyTotal(data.checkerTotal??0);
        })
        .catch(()=>{ if(!cancelled) setLiveCheckerTotal(prev=>prev??0); });
    };
    const fallback=setTimeout(()=>{ if(!cancelled) setLiveCheckerTotal(prev=>prev??0); },8000);
    fetch("/api/stats")
      .then(res=>{ if(!res.ok) throw new Error("stats proxy returned "+res.status); return res.json(); })
      .then(data=>{ applyTotal(data.checkerTotal??0); })
      .catch(directFirestoreFallback)
      .finally(()=>clearTimeout(fallback));
    return()=>{ cancelled=true; clearTimeout(fallback); };
  },[]);

  // Persist profile across page refreshes — localStorage + IndexedDB mirror
  useEffect(()=>{
    try{
      if(profile) localStorage.setItem("yojana_profile",JSON.stringify(profile));
      else localStorage.removeItem("yojana_profile");
    }catch{}
    // IDB mirror: more durable than localStorage on Android low-storage situations
    if(profile) idbSet(OFFLINE_KEYS.PROFILE, profile).catch(()=>{});
    else idbDelete(OFFLINE_KEYS.PROFILE).catch(()=>{});
  },[profile]);

  // Persist liveCheckerTotal to IDB so stats counter survives offline restarts
  useEffect(()=>{
    if(liveCheckerTotal!==null) idbSet(OFFLINE_KEYS.CHECKER_TOTAL, liveCheckerTotal).catch(()=>{});
  },[liveCheckerTotal]);

  // One-time migration: copy existing localStorage values into IndexedDB.
  // Runs only on first app launch after this update — no-op on every subsequent load.
  useEffect(()=>{ migrateLocalStorageToIDB().catch(()=>{}); },[]);

  // Auto-refresh on reconnect: getDoc() is one-shot and won't auto-retry when
  // internet returns. This effect watches isOffline flip true→false and refetches
  // /api/stats and the Firestore profile so data is never stale after reconnecting.
  useEffect(()=>{
    if(!wasOfflineRef.current||isOffline){ wasOfflineRef.current=isOffline; return; }
    wasOfflineRef.current=false;
    // Re-fetch live stats
    fetch("/api/stats")
      .then(r=>{ if(!r.ok) throw new Error(); return r.json(); })
      .then(data=>{ const t=data.checkerTotal??0; setLiveCheckerTotal(t); try{localStorage.setItem("yojana_checker_total",String(t));}catch{} })
      .catch(()=>{});
    // Re-fetch Firestore profile if signed in
    const user=auth.currentUser;
    if(!user) return;
    getDoc(doc(db,"users",user.uid))
      .then(snap=>{ if(!snap.exists()) return; const d=snap.data(); setProfile(d); try{localStorage.setItem("yojana_profile",JSON.stringify(d));}catch{} })
      .catch(()=>{});
  },[isOffline]);

  // On every auth state change: clear on sign-out; restore Firestore profile on session restore
  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async(user)=>{
      if(!user){ setProfile(null); setIsAdmin(false); setAdminTabs(null); return; }
      // Restore profile from Firestore (handles page refresh, tab restore & Google redirect)
      // Firebase offline persistence (enabled in firebase.js) serves this from
      // IndexedDB cache instantly when offline, then syncs when connection returns.
      try{
        const snap=await getDoc(doc(db,"users",user.uid));
        if(snap.exists()){
          const d=snap.data();
          setProfile(d);
          const fullAdmin=d.isAdmin===true;
          const restrictedAdmin=Array.isArray(d.adminTabs)&&d.adminTabs.length>0;
          setIsAdmin(fullAdmin||restrictedAdmin);
          setAdminTabs(fullAdmin?null:(restrictedAdmin?d.adminTabs:null));
        } else {
          // New Google user — no Firestore profile yet.
          // Navigate to profile tab so ProfileTab mounts and runs setup flow.
          setActiveTab("profile");
        }
      }catch{
        // Firestore unreachable and Firebase offline cache is cold (first-ever offline visit).
        // Fall back to IndexedDB app cache so the user isn't stuck on a blank profile.
        const cached=await idbGet(OFFLINE_KEYS.PROFILE).catch(()=>null);
        if(cached){
          setProfile(cached);
          const fullAdmin=cached.isAdmin===true;
          const restrictedAdmin=Array.isArray(cached.adminTabs)&&cached.adminTabs.length>0;
          setIsAdmin(fullAdmin||restrictedAdmin);
          setAdminTabs(fullAdmin?null:(restrictedAdmin?cached.adminTabs:null));
        }
      }
      // Update lastSeen silently
      try{ await updateDoc(doc(db,"users",user.uid),{lastSeen:serverTimestamp()}); }catch{}
    });
    return()=>unsub();
  },[]);

  // ── Session duration tracking ────────────────────────────────────────────
  // Tracks how long the user is actively using the app per visit ("session")
  // and accumulates a lifetime total, both written to Firestore for
  // signed-in users so AdminDashboard can show both metrics per user.
  //
  // sessionStorage anchors the session start time: it persists across page
  // refreshes/navigation within the SAME browser tab, but clears automatically
  // when the tab actually closes — exactly the boundary of "one session".
  useEffect(()=>{
    let sessionStart;
    try{
      sessionStart = sessionStorage.getItem("ys_session_start");
      if(!sessionStart){
        sessionStart = String(Date.now());
        sessionStorage.setItem("ys_session_start", sessionStart);
      }
    }catch{ sessionStart = String(Date.now()); }
    const startMs = Number(sessionStart);
    let flushedMs = 0; // how much of this session has already been added to totalActiveDuration — prevents double-counting on repeated background/foreground toggles

    const flush = () => {
      const user = auth.currentUser;
      if(!user) return; // only track for signed-in users — guests have no Firestore doc to write to
      const elapsed = Date.now() - startMs;
      const delta = elapsed - flushedMs;
      if(delta < 1000) return; // skip no-op flushes under 1s
      flushedMs = elapsed;
      updateDoc(doc(db,"users",user.uid),{
        lastSessionDuration: elapsed,           // this session's running total — overwritten each flush
        totalActiveDuration: increment(delta),  // lifetime total — only the NEW delta is added
      }).catch(()=>{});
    };

    // Flush when the tab goes to background — the most reliable signal we
    // have that the user has (probably) stopped actively using the app.
    const onVisibility = () => { if(document.visibilityState==="hidden") flush(); };
    // pagehide covers tab close / swipe-away on mobile, which doesn't always
    // fire visibilitychange first.
    const onPageHide = () => flush();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    // Safety-net heartbeat: if the OS kills the tab on a low-memory phone
    // without firing any lifecycle event, this caps lost active time to
    // at most 60 seconds instead of losing the whole session.
    const heartbeat = setInterval(()=>{
      if(document.visibilityState==="visible") flush();
    }, 60000);

    return ()=>{
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      clearInterval(heartbeat);
    };
  },[]);

  // Handle Google redirect result at the TOP LEVEL — runs on every page load
  // regardless of which tab is active. Catches the result even on low-memory
  // phones where the browser killed the tab mid-redirect. ──────────────────────
  useEffect(()=>{
    getRedirectResult(auth).then(async result=>{
      if(!result||!result.user) return;
      const user=result.user;
      try{
        const snap=await getDoc(doc(db,"users",user.uid));
        if(snap.exists()){setProfile(snap.data());return;}
      }catch{}
      // New user — profile tab will handle setup via its own mount useEffect
      setActiveTab("profile");
    }).catch(()=>{});
  },[]);

  const th=THEME[dark?"dark":"light"];
  const t=T[lang];
  const isHindi=lang==="hi";
  const bf=fontFamily(lang);
  const toggleLang=useCallback(()=>{setLangAnim(true);setTimeout(()=>{setLang(l=>l==="en"?"hi":"en");setLangAnim(false);},120);},[]);
  // Stable callbacks for ProfileTabMemo — inline arrows would break memoisation
  const handleViewChecker=useCallback(()=>setShowChecker(true),[]);
  const handleAdminOpen  =useCallback(()=>setShowAdmin(true),[]);

  // ── HARDWARE BACK BUTTON (Android) — top-level overlays ─────────────────────
  // Push a history entry for each top-level overlay so pressing back closes it
  // instead of closing the whole app.
  useEffect(()=>{
    const hasOverlay=showAdmin||showChecker||showFAQ||!!selectedScheme||!!selectedCategory;
    if(hasOverlay) window.history.pushState({ysOverlay:true},"");
  },[showAdmin,showChecker,showFAQ,selectedScheme,selectedCategory]);

  useEffect(()=>{
    const handlePop=()=>{
      // Close in reverse-open order (most recently opened first)
      if(showAdmin)        {setShowAdmin(false);return;}
      if(showFAQ)          {setShowFAQ(false);return;}
      if(showChecker)      {setShowChecker(false);return;}
      if(selectedScheme)   {setSelectedScheme(null);return;}
      if(selectedCategory) {setSelectedCategory(null);return;}
    };
    window.addEventListener("popstate",handlePop);
    return()=>window.removeEventListener("popstate",handlePop);
  },[showAdmin,showChecker,showFAQ,selectedScheme,selectedCategory]);

  // Live stat targets: real scheme count + states + real checkerTotal from Firestore
  const statTargets=useMemo(()=>[
    SCHEME_DB.length,       // real scheme count — available immediately
    28,                     // states covered — static fact
    liveCheckerTotal??0,    // real citizens who ran the eligibility checker
  ],[liveCheckerTotal]);

  // statsReady: page loaded + we have a real Firestore value (not a timeout-zero fallback)
  const firestoreLoaded=liveCheckerTotal!==null&&liveCheckerTotal>0||liveCheckerTotal!==null;
  const statsReady=loaded&&firestoreLoaded;
  const [c0,c1,c2]=useCountUp(statTargets,statsReady,1400);

  const animatedStats=useMemo(()=>t.stats.map((s,i)=>{
    if(i===0) return{...s,number:loaded?String(c0):"—"};
    if(i===1) return{...s,number:"28"};
    // Indians Helped: show "—" if Firestore hasn't returned a real value yet or returned 0
    if(i===2) return{...s,number:(!loaded||liveCheckerTotal===null)?"—":liveCheckerTotal>0?c2+"+":"—"};
    return s;
  }),[c0,c1,c2,t,statsReady]);

  // Categories — pulled from schemesData.js
  const categories=useMemo(()=>CATEGORIES[lang],[lang]);
  // Scheme counts per category — computed once (filterKey is language-agnostic)
  const categoryCounts=useMemo(()=>{
    const counts={};
    CATEGORIES.en.forEach(cat=>{counts[cat.filterKey]=getSchemesForCategory(cat.filterKey).length;});
    return counts;
  },[]);
  const categoryMaxBenefit=useMemo(()=>{
    const maxB={};
    CATEGORIES.en.forEach(cat=>{
      const schemes=getSchemesForCategory(cat.filterKey);
      const max=Math.max(0,...schemes.map(s=>s.annual||0));
      maxB[cat.filterKey]=max;
    });
    return maxB;
  },[]);
  // Bilingual benefit label — lakh/thousand aware, falls back to plain ₹ for small amounts
  const formatCategoryBenefit=useCallback((amt)=>{
    if(amt>=100000){
      const v=Math.round(amt/100000);
      return isHindi?`₹${v} लाख तक`:`Up to ₹${v}L`;
    }
    if(amt>=1000){
      const v=Math.round(amt/1000);
      return isHindi?`₹${v} हज़ार तक`:`Up to ₹${v}K`;
    }
    return isHindi?`₹${Math.round(amt)} तक`:`Up to ₹${Math.round(amt)}`;
  },[isHindi]);

  const profileAnswers=useMemo(()=>profile?{
    who:profile.occupation,
    income:profile.income,
    house:profile.house,
    age:profile.age,
    area:profile.area,
    state:profile.state,
    caste:profile.caste,
    // Adaptive fields — only included when they exist and are relevant
    ...(profile.occupation==="farmer"&&profile.landHolding?{landHolding:profile.landHolding}:{}),
    ...(profile.occupation==="student"&&profile.educationLevel?{educationLevel:profile.educationLevel}:{}),
    ...(profile.income==="below1"&&profile.ration?{rationCard:profile.ration}:{}),
  }:null,[profile]);

  // Top 3 matched schemes for home "Matched for You" section
  const matchedSchemes=useMemo(()=>{
    if(!profileAnswers)return[];
    return SCHEME_DB.filter(s=>s.match(profileAnswers)).slice(0,3);
  },[profileAnswers]);

  // All matched schemes — used for BenefitCalculatorCard and DocumentVaultCard.
  // Uses committedCheckerAnswers (set only when user clicks "Update My Profile",
  // or immediately when there's no profile so no sheet appears) so the cards
  // never update from a raw checker run before the user makes their choice.
  const allMatchedSchemes=useMemo(()=>{
    const answers=committedCheckerAnswers||profileAnswers;
    if(!answers)return[];
    return SCHEME_DB.filter(s=>s.match(answers));
  },[committedCheckerAnswers,profileAnswers]);

  const navItems=useMemo(()=>[
    {
      tab:"home", label:t.navHome,
      iconFilled:(c)=>(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="ng-home" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF9933"/>
              <stop offset="100%" stopColor="#FF6B00"/>
            </linearGradient>
          </defs>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" fill="url(#ng-home)" opacity="0.18"/>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
          <path d="M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      ),
      iconOutline:(c)=>(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
          <path d="M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      tab:"search", label:t.navSearch,
      iconFilled:(c)=>(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="ng-srch" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF9933"/>
              <stop offset="100%" stopColor="#FF6B00"/>
            </linearGradient>
          </defs>
          <circle cx="11" cy="11" r="7" fill="url(#ng-srch)" opacity="0.18"/>
          <circle cx="11" cy="11" r="7" stroke={c} strokeWidth="1.8"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="11" x2="14" y2="11" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="11" y1="8" x2="11" y2="14" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
      iconOutline:(c)=>(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke={c} strokeWidth="1.7"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      tab:"schemes", label:t.navSchemes,
      iconFilled:(c)=>(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="ng-sch" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF9933"/>
              <stop offset="100%" stopColor="#FF6B00"/>
            </linearGradient>
          </defs>
          <rect x="4" y="3" width="16" height="18" rx="2.5" fill="url(#ng-sch)" opacity="0.18"/>
          <rect x="4" y="3" width="16" height="18" rx="2.5" stroke={c} strokeWidth="1.8"/>
          <line x1="8" y1="8" x2="16" y2="8" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="8" y1="12" x2="16" y2="12" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="8" y1="16" x2="12" y2="16" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
      iconOutline:(c)=>(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="2.5" stroke={c} strokeWidth="1.7"/>
          <line x1="8" y1="8" x2="16" y2="8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="8" y1="12" x2="16" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="8" y1="16" x2="12" y2="16" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      tab:"ai", label:t.navAI,
      isChakra:true,
    },
    {
      tab:"profile", label:t.navProfile,
      iconFilled:(c)=>(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="ng-pro" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF9933"/>
              <stop offset="100%" stopColor="#FF6B00"/>
            </linearGradient>
          </defs>
          <circle cx="12" cy="8" r="3.5" fill="url(#ng-pro)" opacity="0.22"/>
          <circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth="1.8"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        </svg>
      ),
      iconOutline:(c)=>(
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth="1.7"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
    },
  ],[t]);

  // Seed the currently-active tab before JSX so its content renders immediately
  mountedTabsRef.current.add(activeTab);

  return(
    <div className="app-root" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={{fontFamily:bf,background:th.appBg,maxWidth:420,margin:"0 auto",position:"relative",display:"flex",flexDirection:"column",overflowX:"hidden",boxShadow:"0 0 60px rgba(0,0,0,0.15)",opacity:langAnim?0.7:1,transition:"opacity 0.12s,background 0.3s"}}>
      <style>{APP_STYLES}</style>

      {/* ── Offline banner — slides in from top when device has no network ── */}
      {isOffline && <OfflineBanner lang={lang} dark={dark} />}
      {isOffline && <div style={{height:42,flexShrink:0}}/>}

      {/* ── TAB CONTENT — all tabs always mounted, zero DOM remount, zero blink ──
           Each tab uses the same flex+visibility trick as the AI tab.
           Animation class is applied on the wrapper when the tab becomes active.    ── */}

      {/* HOME — always mounted (initial tab); hidden with display:none when inactive */}
      <div
        ref={activeTab==="home" ? dragTargetRef : null}
        className={activeTab==="home" ? (swipeDir==="left"?"tab-enter-left":swipeDir==="right"?"tab-enter-right":undefined) : undefined}
        style={{
          display:activeTab==="home"?"flex":"none",
          flex:1,
          flexDirection:"column",minHeight:0,overflow:"hidden",
          willChange:activeTab==="home"?"transform":"auto",
        }}>
        <div style={{flex:1,overflowY:"auto"}}>
          {/* ── PREMIUM HEADER ── */}
          <div style={{background:"linear-gradient(160deg,#0c1445 0%,#06038D 38%,#003580 65%,#FF8C00 100%)",padding:"0 0 0",position:"relative",overflow:"hidden",
            isolation:"isolate",
            boxShadow:"0 6px 32px rgba(255,140,0,0.15), 0 0 0 1px rgba(255,255,255,0.07)"}}>

            {/* ── 3D Bevel Border ── */}
            <div style={{
              position:"absolute",inset:0,zIndex:4,pointerEvents:"none",
              boxShadow:[
                "inset 0 1.5px 0 rgba(255,255,255,0.30)",
                "inset 1.5px 0 0 rgba(255,255,255,0.13)",
                "inset -1.5px 0 0 rgba(0,0,0,0.24)",
              ].join(", "),
            }}/>

            {/* ── Subtle dot-mesh texture for depth ── */}
            <div style={{
              position:"absolute",inset:0,zIndex:1,pointerEvents:"none",
              backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.028) 1px,transparent 1px)",
              backgroundSize:"20px 20px",
            }}/>

            {/* Decorative: spinning chakra watermark */}
            <div className="spin" style={{position:"absolute",right:-55,top:-55,width:220,height:220,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.06)",opacity:1,pointerEvents:"none"}}>
              <svg width="220" height="220" viewBox="0 0 220 220" style={{position:"absolute",inset:0,opacity:0.07}}>
                {WATERMARK_SPOKES.map(({i,x1,y1,x2,y2})=>(
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={3}/>
                ))}
                <circle cx="110" cy="110" r="100" fill="none" stroke="#fff" strokeWidth="5"/>
                <circle cx="110" cy="110" r="28" fill="#fff"/>
              </svg>
            </div>
            {/* Decorative: saffron orb bottom-left */}
            <div style={{position:"absolute",left:-30,bottom:-20,width:130,height:130,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,153,51,0.18) 0%,transparent 70%)",pointerEvents:"none"}}/>
            {/* Decorative: green orb top-center */}
            <div style={{position:"absolute",top:0,left:"30%",width:80,height:80,borderRadius:"50%",background:"radial-gradient(circle,rgba(19,136,8,0.12) 0%,transparent 70%)",pointerEvents:"none"}}/>


            {/* ── Top nav bar ── */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 16px 10px",position:"relative",zIndex:3}}>

              {/* Left: Logo + Brand */}
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {/* Logo with premium glow ring */}
                <div onClick={()=>{haptic(30);setShowAvatarModal(true);}}
                  style={{
                    width:46,height:46,borderRadius:13,overflow:"hidden",flexShrink:0,cursor:"pointer",
                    boxShadow:[
                      "0 0 0 1.5px rgba(255,153,51,0.70)",
                      "0 0 0 3.5px rgba(255,153,51,0.15)",
                      "0 4px 16px rgba(0,0,0,0.40)",
                    ].join(", "),
                    WebkitTapHighlightColor:"transparent",
                  }}>
                  <img src={appLogo} alt="Yojana Sahay"
                    style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>

                {/* Brand text — 3 clean lines */}
                <div>
                  <div style={{color:"#fff",fontSize:17,fontWeight:900,fontFamily:bf,letterSpacing:-0.3,lineHeight:1.1,marginBottom:3,display:"flex",alignItems:"center",gap:5}}>
                    {t.appName}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:5}}>
                    <span style={{color:"rgba(255,255,255,0.58)",fontSize:10,fontWeight:600,letterSpacing:0.1}}>{t.appSub}</span>
                  </div>
                  {/* AI-Powered — premium shimmer pill */}
                  <div style={{
                    display:"inline-flex",alignItems:"center",gap:5,
                    padding:"3px 9px 3px 7px",
                    borderRadius:20,
                    background:"linear-gradient(90deg,rgba(255,153,51,0.18) 0%,rgba(255,255,255,0.28) 40%,rgba(99,179,255,0.22) 60%,rgba(255,153,51,0.18) 100%)",
                    backgroundSize:"200% auto",
                    animation:"aiPillShimmer 5.5s linear infinite",
                    border:"1px solid rgba(255,255,255,0.22)",
                    boxShadow:"0 1px 8px rgba(255,153,51,0.20), inset 0 1px 0 rgba(255,255,255,0.18)",
                    backdropFilter:"blur(6px)",
                    WebkitBackdropFilter:"blur(6px)",
                  }}>
                    {/* Spark icon */}
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z"
                        fill="#FFD580" stroke="rgba(255,200,80,0.5)" strokeWidth="0.8"/>
                    </svg>
                    <span style={{
                      fontSize:9,fontWeight:800,letterSpacing:1.1,textTransform:"uppercase",
                      background:"linear-gradient(90deg,#FFD580,#fff 45%,#a8d8ff 75%,#FFD580)",
                      backgroundSize:"200% auto",
                      animation:"aiPillShimmer 2.8s linear infinite",
                      WebkitBackgroundClip:"text",
                      WebkitTextFillColor:"transparent",
                      backgroundClip:"text",
                    }}>
                      {isHindi?"AI-संचालित":"AI-Powered"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Toggles — unified glass capsule */}
              <div style={{
                display:"flex",alignItems:"center",
                background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.14)",
                borderRadius:50,padding:"3px 4px",flexShrink:0,
              }}>
                <DarkModeToggle dark={dark} onToggle={toggleDark}/>
                <div style={{width:1,height:15,background:"rgba(255,255,255,0.18)",margin:"0 3px",flexShrink:0}}/>
                <LangToggle lang={lang} onToggle={toggleLang} dark={true}/>
              </div>
            </div>

            {/* ── Hero content — two-column layout ── */}
            <div style={{padding:"4px 16px 28px",position:"relative",zIndex:3,display:"flex",alignItems:"center",gap:10}}>

              {/* LEFT: Greeting pill + Headline stack */}
              <div style={{flex:1,minWidth:0}}>

                {/* Smart greeting chip — time-aware */}
                {(()=>{
                  const hr=new Date().getHours();
                  const g=hr>=5&&hr<12
                    ?{en:"Good Morning",  hi:"सुप्रभात",    emoji:"☀️"}
                    :hr>=12&&hr<17
                    ?{en:"Good Afternoon",hi:"नमस्कार",     emoji:"🌤️"}
                    :hr>=17&&hr<21
                    ?{en:"Good Evening",  hi:"शुभ संध्या",  emoji:"🌇"}
                    :          {en:"Good Night",   hi:"शुभ रात्रि", emoji:"🌙"};
                  const firstName=profile?.name?.split(" ")[0];
                  return profile?(
                    <div style={{
                      display:"inline-flex",alignItems:"center",gap:6,
                      background:"rgba(255,255,255,0.11)",
                      border:"1px solid rgba(255,255,255,0.20)",
                      borderRadius:20,padding:"5px 13px 5px 10px",marginBottom:9,
                      boxShadow:"inset 0 1px 0 rgba(255,255,255,0.14)",
                      backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",
                    }}>
                      <span style={{fontSize:13,lineHeight:1}}>{g.emoji}</span>
                      <span style={{color:"rgba(255,255,255,0.93)",fontSize:11.5,fontWeight:700,letterSpacing:0.1}}>
                        {isHindi?`${g.hi}, ${firstName}`:`${g.en}, ${firstName}`}
                      </span>
                      {allMatchedSchemes.length>0&&(
                        <>
                          <div style={{width:1,height:11,background:"rgba(255,255,255,0.22)",flexShrink:0}}/>
                          <span style={{fontSize:10,fontWeight:600,color:"#4ade80",letterSpacing:0.1}}>
                            {allMatchedSchemes.length} {isHindi?"योजनाएं":"schemes"}
                          </span>
                        </>
                      )}
                    </div>
                  ):(
                    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:20,padding:"4px 10px",marginBottom:9}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 6px #4ade80"}}/>
                      <span style={{color:"rgba(255,255,255,0.9)",fontSize:10,fontWeight:700,letterSpacing:0.4}}>
                        {isHindi?"योजना खोज सेवा • निःशुल्क":"Scheme Discovery • Free & Independent"}
                      </span>
                    </div>
                  );
                })()}

                {/* Hero headline — one line */}
                <div style={{display:"flex",alignItems:"baseline",flexWrap:"wrap",columnGap:5,rowGap:0,marginBottom:6,fontFamily:bf}}>
                  <span style={{color:"#fff",fontSize:16,fontWeight:900,letterSpacing:-0.3}}>
                    {isHindi?"खोजें।":"Discover."}
                  </span>
                  <span style={{fontSize:16,fontWeight:900,color:"#FF9933",letterSpacing:-0.3}}>
                    {isHindi?"आवेदन।":"Apply."}
                  </span>
                  <span style={{fontSize:16,fontWeight:900,color:"#4ade80",letterSpacing:-0.3}}>
                    {isHindi?"लाभ पाएं।":"Benefit."}
                  </span>
                </div>

                {/* Subline */}
                <div style={{color:"rgba(255,255,255,0.62)",fontSize:11.5,lineHeight:1.48}}>
                  {isHindi?"सरकारी योजनाएं जो आपको सशक्त बनाती हैं":"Find schemes that truly empower you."}
                </div>
              </div>


            </div>

          </div>

          {/* Stats — animated count-up on load, overlaps header */}
          <div className={`fu s1 ${loaded?"show":""}`}
            style={{background:dark?th.card:"linear-gradient(135deg,#fffdf7 0%,#ffffff 65%)",margin:"-22px 14px 0",borderRadius:18,padding:"14px 6px 12px",display:"flex",
              boxShadow:dark?"0 8px 28px rgba(0,0,0,0.40)":"0 8px 28px rgba(255,153,51,0.22)",
              border:`1.5px solid ${dark?th.border:"rgba(255,179,71,0.32)"}`,marginBottom:6,position:"relative",zIndex:2}}>
            {[
              {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,color:"#FF9933",darkColor:"#FFA950",grad:dark?"rgba(255,169,80,0.20)":"rgba(255,153,51,0.08)"},
              {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,color:"#06038D",darkColor:"#6B90FF",grad:dark?"rgba(107,144,255,0.18)":"rgba(6,3,141,0.06)"},
              {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,color:"#138808",darkColor:"#34D058",grad:dark?"rgba(52,208,88,0.16)":"rgba(19,136,8,0.07)"},
            ].map((meta,i)=>{
              const ic=dark?meta.darkColor:meta.color;
              return(
              <div key={i} style={{flex:1,textAlign:"center",padding:"0 6px",
                borderRight:i<2?`1px solid ${th.border}`:'none'}}>
                <div style={{width:30,height:30,borderRadius:9,background:meta.grad,
                  border:`1px solid ${ic}44`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:ic,
                  fontSize:14,margin:"0 auto 6px"}}>
                  {meta.icon}
                </div>
                <div style={{fontSize:18,fontWeight:900,color:ic,fontVariantNumeric:"tabular-nums",lineHeight:1,fontFamily:"'Noto Sans',sans-serif"}}>
                  {animatedStats[i].number}
                </div>
                <div style={{fontSize:9.5,color:th.textSub,marginTop:3,fontWeight:600,fontFamily:bf,letterSpacing:0.2}}>
                  {animatedStats[i].label}
                </div>
              </div>
            );})}
          </div>

          {/* ── FRESHNESS BADGE — "Last Verified" trust signal ──────────────────
               Shows the most recent date schemes were checked via the verification
               pipeline. Only renders if lastVerified data exists in schemes-meta.json.
               ──────────────────────────────────────────────────────────────────── */}
          {LAST_VERIFIED_LABEL&&(
            <div style={{
              margin:"8px 14px 0",
              background:dark?"rgba(255,255,255,0.035)":"linear-gradient(135deg,#fffdf8 0%,#ffffff 70%)",
              border:`1px solid ${dark?"rgba(255,255,255,0.08)":"rgba(255,179,71,0.25)"}`,
              borderRadius:13,overflow:"hidden",
              boxShadow:dark?"none":"0 4px 16px rgba(255,153,51,0.12)",
            }}>
              {/* India tricolor top accent */}
              <div style={{
                height:3,
                background:"linear-gradient(90deg,#FF9933 0%,#FF9933 33.3%,#ffffff 33.3%,#ffffff 66.6%,#138808 66.6%,#138808 100%)",
              }}/>

              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px 11px"}}>

                {/* Shield icon */}
                <div style={{
                  width:34,height:34,borderRadius:10,flexShrink:0,
                  background:dark?"rgba(6,3,141,0.22)":"rgba(6,3,141,0.07)",
                  border:`1.5px solid ${dark?"rgba(107,144,255,0.28)":"rgba(6,3,141,0.14)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                      fill={dark?"#6B90FF":"#06038D"} opacity="0.85"/>
                    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Text block */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                    <span style={{
                      fontSize:9,fontWeight:800,letterSpacing:1.1,textTransform:"uppercase",
                      color:dark?"#6B90FF":"#06038D",fontFamily:"'Noto Sans',sans-serif",
                    }}>
                      {isHindi?"डेटा सत्यापित":"Data Verified"}
                    </span>
                    {/* Live pulse dot */}
                    <span style={{
                      display:"inline-block",width:5,height:5,borderRadius:"50%",
                      background:"#22c55e",boxShadow:"0 0 5px #22c55e",flexShrink:0,
                    }}/>
                  </div>
                  <div style={{
                    fontSize:10,
                    color:dark?"rgba(255,255,255,0.38)":"rgba(0,0,0,0.42)",
                    fontFamily:"'Noto Sans',sans-serif",lineHeight:1.45,
                  }}>
                    {isHindi
                      ?"स्वतंत्र पाइपलाइन द्वारा जाँचे गए सरकारी पोर्टल लिंक"
                      :"Govt. portal links verified · No paid promotions · Independent platform"
                    }
                  </div>
                </div>

                {/* Date pill */}
                <div style={{
                  flexShrink:0,
                  background:dark?"rgba(107,144,255,0.10)":"rgba(6,3,141,0.06)",
                  border:`1px solid ${dark?"rgba(107,144,255,0.22)":"rgba(6,3,141,0.13)"}`,
                  borderRadius:9,padding:"5px 10px",textAlign:"center",
                }}>
                  <div style={{
                    fontSize:7.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",
                    color:dark?"rgba(107,144,255,0.55)":"rgba(6,3,141,0.45)",
                    fontFamily:"'Noto Sans',sans-serif",marginBottom:2,
                  }}>
                    {isHindi?"अंतिम जाँच":"Last Verified"}
                  </div>
                  <div style={{
                    fontSize:11,fontWeight:800,letterSpacing:-0.2,
                    color:dark?"#6B90FF":"#06038D",
                    fontFamily:"'Noto Sans',sans-serif",
                  }}>
                    {LAST_VERIFIED_LABEL}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── SCHEME NEWS TICKER ── */}
          <SchemeNewsTicker lang={lang} dark={dark} />

          <div style={{padding:"14px 16px 100px"}}>
            {/* Eligibility CTA */}
            <div className={`fu s1 cp ${loaded?"show":""}`} onClick={()=>{haptic();setShowChecker(true);}}
              style={{background:"linear-gradient(135deg,#138808 0%,#16a34a 60%,#15803d 100%)",borderRadius:18,padding:"17px 18px",marginBottom:14,
                display:"flex",alignItems:"center",gap:14,cursor:"pointer",position:"relative",overflow:"hidden",
                boxShadow:"0 8px 28px rgba(19,136,8,0.32)",WebkitTapHighlightColor:"transparent"}}
              onTouchStart={e=>{e.currentTarget.style.transform="scale(0.98)";}}
              onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";}}>
              {/* Decorative orb */}
              <div style={{position:"absolute",right:-20,top:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.08)",pointerEvents:"none"}}/>
              <div style={{width:50,height:50,background:"rgba(255,255,255,0.18)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"1.5px solid rgba(255,255,255,0.28)",boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontSize:15,fontWeight:800,fontFamily:bf,marginBottom:3}}>{t.ctaTitle}</div>
                <div style={{color:"rgba(255,255,255,0.78)",fontSize:11.5,lineHeight:1.4}}>{t.ctaSub(!!profile)}</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.22)",borderRadius:11,padding:"10px 13px",color:"#fff",fontSize:12.5,fontWeight:800,border:"1.5px solid rgba(255,255,255,0.38)",fontFamily:bf,flexShrink:0,textAlign:"center",lineHeight:1.3}}>
                {t.ctaBtn(!!profile)}
              </div>
            </div>

            {/* Benefit Calculator — shown when profile OR committed checker answers exist with annual benefits */}
            {(profile||committedCheckerAnswers)&&allMatchedSchemes.length>0&&(
              <BenefitCalculatorCard key={checkerRunId} allMatchedSchemes={allMatchedSchemes} lang={lang} dark={dark} onSchemeOpen={setSelectedScheme}/>
            )}

            {/* Document Vault — auto-generated checklist from matched schemes */}
            {(profile||committedCheckerAnswers)&&allMatchedSchemes.length>0&&(
              <DocumentVaultCard allMatchedSchemes={allMatchedSchemes} lang={lang} dark={dark} uid={auth.currentUser?.uid||null}/>
            )}

            {/* How It Works — only pre-login */}
            {!profile&&(
              <div className={`fu s2 ${loaded?"show":""}`} style={{marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:th.textSub,marginBottom:9,letterSpacing:0.5,textTransform:"uppercase",fontFamily:bf}}>
                  {isHindi?"कैसे काम करता है":"How It Works"}
                </div>
                <div style={{background:th.card,borderRadius:16,overflow:"hidden",border:`1.5px solid ${th.border}`,boxShadow:dark?"0 2px 12px rgba(0,0,0,0.2)":"0 2px 12px rgba(0,0,0,0.05)"}}>
                  {[
                    {num:"1",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,color:"#FF9933",bg:"rgba(255,153,51,0.10)",
                      title:isHindi?"कुछ सवाल जवाब दें":"Answer a Few Questions",
                      sub:isHindi?"अपनी जानकारी भरें":"Fill in your basic details"},
                    {num:"2",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,color:"#06038D",bg:"rgba(6,3,141,0.08)",
                      title:isHindi?"AI मिलान करता है":"AI Matches Your Profile",
                      sub:isHindi?"योजनाओं में खोज":"Searches schemes for you"},
                    {num:"3",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,color:"#138808",bg:"rgba(19,136,8,0.08)",
                      title:isHindi?"योजना पाएं — आवेदन करें":"Get Results & Apply",
                      sub:isHindi?"पात्र योजनाएं देखें और आवेदन करें":"View matched schemes and apply online"},
                  ].map((step,i,arr)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:13,padding:"13px 15px",
                      borderBottom:i<arr.length-1?`1px solid ${th.divider}`:"none"}}>
                      <div style={{width:38,height:38,borderRadius:11,background:step.bg,border:`1.5px solid ${step.color}28`,
                        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative",color:step.color}}>
                        {step.icon}
                        <div style={{position:"absolute",top:-7,right:-7,width:16,height:16,borderRadius:"50%",
                          background:step.color,display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:8,fontWeight:900,color:"#fff",border:"1.5px solid #fff",fontFamily:"'Noto Sans',sans-serif"}}>
                          {step.num}
                        </div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:700,color:th.text,fontFamily:bf,lineHeight:1.3}}>{step.title}</div>
                        <div style={{fontSize:11,color:th.textSub,marginTop:2,fontFamily:bf}}>{step.sub}</div>
                      </div>
                      {i===arr.length-1&&(
                        <div style={{width:24,height:24,borderRadius:"50%",background:"#138808",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.5 9L10 3" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories — now CLICKABLE, opens CategorySheet */}
            <div style={{marginBottom:14}}>
              <div className={`fu s2 ${loaded?"show":""}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:th.text,fontFamily:bf}}>{t.categoriesTitle}</div>
                  <div style={{fontSize:11,color:th.textSub,marginTop:1}}>{t.categoriesSub}</div>
                </div>
                <div onClick={()=>{haptic();setActiveTab("schemes");}}
                  style={{display:"flex",alignItems:"center",gap:4,color:"#003580",fontSize:12,fontWeight:700,cursor:"pointer",
                    background:"rgba(0,53,128,0.07)",borderRadius:20,padding:"5px 11px",border:"1px solid rgba(0,53,128,0.15)"}}>
                  {t.seeAll}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {categories.map((cat,i)=>{
                  const count=categoryCounts[cat.filterKey]||0;
                  // No backdrop-filter — glass via gradient+border only (zero GPU cost)
                  const cardBg=dark
                    ?`linear-gradient(155deg,${cat.color}30 0%,${cat.color}14 100%)`
                    :`linear-gradient(155deg,${cat.color}1e 0%,${cat.color}0c 100%)`;
                  const cardBorder=dark?`1.5px solid ${cat.color}65`:`1.5px solid ${cat.color}50`;
                  const cardShadow=dark
                    ?`0 2px 8px rgba(0,0,0,0.30),inset 0 1px 0 rgba(255,255,255,0.07)`
                    :`0 2px 8px ${cat.color}22,inset 0 1px 0 rgba(255,255,255,0.75)`;
                  // Dark: white text (cat.color is often dark navy/green — unreadable on dark bg)
                  const labelColor=dark?"rgba(255,255,255,0.90)":cat.color;
                  return(
                    <div key={i} className={`fu ch c${i} ${loaded?"show":""}`}
                      onClick={()=>{haptic();setSelectedCategory(cat);}}
                      style={{
                        background:cardBg,
                        borderRadius:13,
                        padding:"9px 5px 8px",
                        textAlign:"center",
                        border:cardBorder,
                        boxShadow:cardShadow,
                        position:"relative",
                        overflow:"hidden",
                        transition:"transform 0.14s,opacity 0.14s",
                        willChange:"transform",
                      }}
                      onTouchStart={e=>{e.currentTarget.style.transform="scale(0.93)";e.currentTarget.style.opacity="0.85";}}
                      onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.opacity="1";}}
                      onTouchCancel={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.opacity="1";}}>
                      {/* Count badge */}
                      <div style={{
                        position:"absolute",top:5,right:5,
                        background:cat.color,
                        color:"#fff",fontSize:7.5,fontWeight:900,
                        borderRadius:8,padding:"1.5px 4.5px",minWidth:14,
                        lineHeight:"12px",textAlign:"center",letterSpacing:0.2,
                        fontFamily:"'Noto Sans',sans-serif",
                      }}>{count}</div>
                      {/* Icon */}
                      <div style={{
                        width:34,height:34,borderRadius:9,flexShrink:0,
                        background:dark?`${cat.color}22`:`${cat.color}18`,
                        border:`1px solid ${dark?`${cat.color}45`:`${cat.color}30`}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        margin:"0 auto 6px",
                      }}>
                        {(CATEGORY_ICONS[cat.filterKey]||CATEGORY_ICONS.default)(
                          dark?"rgba(255,255,255,0.85)":cat.color
                        )}
                      </div>
                      {/* Label */}
                      <div style={{
                        fontSize:9.5,fontWeight:700,
                        color:labelColor,
                        fontFamily:bf,lineHeight:1.25,letterSpacing:0.1,
                      }}>{cat.label}</div>
                      {/* Max benefit chip — bilingual, lakh/thousand aware */}
                      {categoryMaxBenefit[cat.filterKey]>0&&(
                        <div style={{
                          marginTop:4,fontSize:7.5,fontWeight:800,
                          color:dark?"rgba(255,255,255,0.7)":cat.color,
                          background:dark?`${cat.color}25`:`${cat.color}15`,
                          borderRadius:6,padding:"1.5px 5px",
                          border:`1px solid ${cat.color}35`,
                          lineHeight:1.2,letterSpacing:0.1,
                          fontFamily:"'Noto Sans',sans-serif",
                        }}>
                          {formatCategoryBenefit(categoryMaxBenefit[cat.filterKey])}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matched for You — personalised if profile exists, setup prompt if not */}
            <div className={`fu s3 ${loaded?"show":""}`} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:th.text,fontFamily:bf}}>{t.matchedTitle}</div>
                  {profile&&<div style={{fontSize:11,color:th.textSub,marginTop:1}}>{t.matchedSub(matchedSchemes.length)}</div>}
                  {!profile&&<div style={{fontSize:11,color:th.textSub,marginTop:1}}>{isHindi?"प्रोफाइल बनाएं — अपनी योजनाएं देखें":"Create profile to see your matched schemes"}</div>}
                </div>
                {profile&&<div onClick={()=>{haptic();setShowChecker(true);}}
                  style={{display:"flex",alignItems:"center",gap:4,color:"#003580",fontSize:12,fontWeight:700,cursor:"pointer",
                    background:"rgba(0,53,128,0.07)",borderRadius:20,padding:"5px 11px",border:"1px solid rgba(0,53,128,0.15)"}}>
                  {t.seeAll}
                </div>}
              </div>

              {profile ? (
                matchedSchemes.length>0 ? (
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {matchedSchemes.map((s)=>(
                      <div key={s.id} className="ch sc" onClick={()=>{haptic();setSelectedScheme(s.id);}}
                        style={{background:th.card,borderRadius:16,padding:"13px 15px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 10px rgba(0,0,0,0.05)",border:`1.5px solid ${s.color}28`}}>
                        <div style={{width:44,height:44,background:s.color+"14",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,border:`1.5px solid ${s.color}20`}}>{s.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:5,marginBottom:4}}>
                            <span style={{fontSize:9,fontWeight:700,
                              background:s.scope==="national"?"#EFF6FF":"#FEF9C3",
                              color:s.scope==="national"?"#1D4ED8":"#854D0E",
                              borderRadius:6,padding:"1px 6px",
                              border:`1px solid ${s.scope==="national"?"#BFDBFE":"#FEF08A"}`}}>
                              {s.scope==="national"?`🇮🇳 ${isHindi?"केंद्रीय":"Central"}`:`📍 ${s.state}`}
                            </span>
                          </div>
                          <div style={{fontSize:13,fontWeight:700,color:th.text,lineHeight:1.3,fontFamily:bf}}>{s.name[lang]}</div>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                            <span className="tb" style={{background:s.color+"18",color:s.color}}>{s.tag[lang]}</span>
                            <span style={{fontSize:11,color:th.textSub,fontWeight:600}}>{s.benefit[lang]}</span>
                          </div>
                        </div>
                        <div style={{color:s.color,fontSize:18,fontWeight:700}}>›</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{textAlign:"center",padding:"24px 20px",background:th.card,borderRadius:16,border:`1.5px solid ${th.border}`}}>
                    <div style={{width:52,height:52,borderRadius:16,background:dark?"rgba(255,255,255,0.06)":"rgba(0,53,128,0.06)",border:`1.5px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={th.textSub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:th.text,fontFamily:bf}}>{t.noMatchTitle}</div>
                    <div style={{fontSize:11,color:th.textSub,marginTop:4,fontFamily:bf}}>{t.noMatchSub}</div>
                  </div>
                )
              ) : (
                /* ── NO PROFILE — Premium showcase ── */
                <div>
                  {/* Hero unlock card */}
                  <div style={{background:"linear-gradient(150deg,#0A1130 0%,#0D1B4C 48%,#072A6B 100%)",borderRadius:20,padding:"22px 20px 20px",marginBottom:12,
                    boxShadow:dark?"0 14px 34px rgba(2,6,23,0.55),inset 0 1px 0 rgba(255,255,255,0.06)":"0 14px 34px rgba(7,20,60,0.22),inset 0 1px 0 rgba(255,255,255,0.06)",
                    border:"1px solid rgba(255,255,255,0.09)",position:"relative",overflow:"hidden"}}>
                    {/* Subtle texture — fine dot grid, restrained civic-data motif */}
                    <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.7) 0.6px,transparent 0.6px)",backgroundSize:"16px 16px",opacity:0.05,pointerEvents:"none"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:14,position:"relative"}}>
                      <div style={{width:44,height:44,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                        </svg>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:9,fontWeight:800,letterSpacing:1.1,textTransform:"uppercase",color:"rgba(255,153,80,0.85)",marginBottom:4,fontFamily:bf}}>
                          {isHindi?"पर्सनलाइज़्ड मैच":"Personalised matching"}
                        </div>
                        <div style={{color:"#fff",fontSize:15,fontWeight:800,fontFamily:bf,lineHeight:1.25}}>{t.noProfileTitle}</div>
                      </div>
                    </div>
                    <div style={{color:"rgba(255,255,255,0.62)",fontSize:11.5,lineHeight:1.55,fontFamily:bf,marginBottom:16,position:"relative"}}>{t.noProfileSub}</div>
                    {/* CTA button */}
                    <div onClick={()=>{haptic();setActiveTab("profile");}}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,position:"relative",
                        background:"linear-gradient(135deg,#FF9933,#F2790A)",borderRadius:13,padding:"13px 20px",
                        cursor:"pointer",boxShadow:"0 6px 16px rgba(0,0,0,0.28)",border:"1px solid rgba(255,255,255,0.18)",
                        transition:"transform 0.15s,box-shadow 0.15s",WebkitTapHighlightColor:"transparent"}}
                      onTouchStart={e=>{e.currentTarget.style.transform="scale(0.97)";e.currentTarget.style.boxShadow="0 3px 10px rgba(0,0,0,0.24)";}}
                      onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.28)";}}>
                      <span style={{color:"#fff",fontSize:14,fontWeight:800,fontFamily:bf}}>{t.setupProfileBtn}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
                    {/* Hint */}
                    <div style={{textAlign:"center",marginTop:11,color:"rgba(255,255,255,0.40)",fontSize:10,fontFamily:bf,letterSpacing:0.2,position:"relative"}}>
                      {isHindi?"✓ निःशुल्क · 2 मिनट में पूरा":"✓ Free · Takes only 2 minutes"}
                    </div>
                  </div>

                  {/* Feature benefit cards — 2×2 grid */}
                  <div style={{marginBottom:4}}>
                    <div style={{fontSize:11,fontWeight:700,color:th.textSub,marginBottom:8,letterSpacing:0.5,textTransform:"uppercase",fontFamily:bf,paddingLeft:2}}>
                      {isHindi?"साइन अप करने के फायदे":"Why create a profile?"}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      {(isHindi?[
                        {icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,title:"मिलान योजनाएं सेव",sub:"पात्र योजनाएं अकाउंट में ऑटो-सेव",color:"#FF9933",darkColor:"#FFA950",bg:"rgba(255,153,51,0.08)",darkBg:"rgba(255,169,80,0.18)"},
                        {icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z"/></svg>,title:"पर्सनल AI जवाब",sub:"AI प्रोफाइल देखकर सटीक जवाब देता है",color:"#06038D",darkColor:"#6B90FF",bg:"rgba(6,3,141,0.07)",darkBg:"rgba(107,144,255,0.18)"},
                        {icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,title:"प्रगति कभी न खोएं",sub:"परिणाम और चैट इतिहास सेव",color:"#138808",darkColor:"#34D058",bg:"rgba(19,136,8,0.07)",darkBg:"rgba(52,208,88,0.16)"},
                        {icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,title:"योजना अलर्ट",sub:"नई योजनाएं व डेडलाइन की सूचना",color:"#8B5CF6",darkColor:"#A78BFA",bg:"rgba(139,92,246,0.07)",darkBg:"rgba(167,139,250,0.18)"},
                      ]:[
                        {icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,title:"Matched Schemes Saved",sub:"Qualifying schemes auto-saved to your account",color:"#FF9933",darkColor:"#FFA950",bg:"rgba(255,153,51,0.08)",darkBg:"rgba(255,169,80,0.18)"},
                        {icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z"/></svg>,title:"Personalized AI",sub:"AI knows your profile, gives tailored replies",color:"#06038D",darkColor:"#6B90FF",bg:"rgba(6,3,141,0.07)",darkBg:"rgba(107,144,255,0.18)"},
                        {icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,title:"Progress Saved",sub:"Eligibility results & chat history kept safe",color:"#138808",darkColor:"#34D058",bg:"rgba(19,136,8,0.07)",darkBg:"rgba(52,208,88,0.16)"},
                        {icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,title:"Deadline Alerts",sub:"Get notified about new schemes & deadlines",color:"#8B5CF6",darkColor:"#A78BFA",bg:"rgba(139,92,246,0.07)",darkBg:"rgba(167,139,250,0.18)"},
                      ]).map((f,i)=>{
                        const fc=dark?f.darkColor:f.color;
                        const fbg=dark?f.darkBg:f.bg;
                        return(
                        <div key={i} style={{background:th.card,borderRadius:14,padding:"13px 12px",
                          border:`1.5px solid ${fc}28`,boxShadow:dark?"0 2px 10px rgba(0,0,0,0.2)":"0 2px 10px rgba(0,0,0,0.05)"}}>
                          <div style={{width:34,height:34,borderRadius:10,background:fbg,border:`1px solid ${fc}40`,
                            display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8,color:fc}}>
                            {f.icon}
                          </div>
                          <div style={{fontSize:11.5,fontWeight:800,color:th.text,fontFamily:bf,lineHeight:1.3,marginBottom:4}}>{f.title}</div>
                          <div style={{fontSize:10,color:th.textSub,lineHeight:1.45,fontFamily:bf}}>{f.sub}</div>
                        </div>
                      );})}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FAQ pill — shown only when not logged in; moves to Profile → Settings post-login */}
            {!profile&&(
            <div style={{display:"flex",justifyContent:"center",marginBottom:18}}>
              <div
                onClick={()=>{haptic();setShowFAQ(true);}}
                style={{
                  display:"flex",alignItems:"center",gap:7,
                  padding:"9px 16px 9px 14px",borderRadius:999,
                  background:dark?"rgba(107,144,255,0.10)":"rgba(0,53,128,0.05)",
                  border:`1.5px solid ${dark?"rgba(107,144,255,0.30)":"rgba(0,53,128,0.16)"}`,
                  cursor:"pointer",WebkitTapHighlightColor:"transparent",
                  transition:"transform 0.12s",
                }}
                onTouchStart={e=>{e.currentTarget.style.transform="scale(0.96)";}}
                onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";}}
                onTouchCancel={e=>{e.currentTarget.style.transform="scale(1)";}}
              >
                <div style={{
                  width:18,height:18,borderRadius:"50%",flexShrink:0,
                  background:dark?"rgba(107,144,255,0.20)":"rgba(0,53,128,0.10)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,fontWeight:800,color:dark?"#6B90FF":"#003580",fontFamily:bf,
                }}>?</div>
                <span style={{
                  fontSize:12,fontWeight:700,color:dark?"#6B90FF":"#003580",fontFamily:bf,letterSpacing:0.1,
                }}>
                  {isHindi?"योजना सहाय FAQ":"YojanaSahay FAQ"}
                </span>
              </div>
            </div>
            )}

          </div>
        </div>
      </div>

      {/* SEARCH — lazy mount: nothing rendered until first visit */}
      <div
        ref={activeTab==="search" ? dragTargetRef : null}
        className={activeTab==="search" ? (swipeDir==="left"?"tab-enter-left":swipeDir==="right"?"tab-enter-right":undefined) : undefined}
        style={{
          display:activeTab==="search"?"flex":"none",
          flex:1,
          flexDirection:"column",minHeight:0,overflow:"hidden",
          willChange:activeTab==="search"?"transform":"auto",
        }}>
        {mountedTabsRef.current.has("search") && <SearchTab lang={lang} dark={dark} onOpenDetail={setSelectedScheme}/>}
      </div>

      {/* SCHEMES — lazy mount: nothing rendered until first visit */}
      <div
        ref={activeTab==="schemes" ? dragTargetRef : null}
        className={activeTab==="schemes" ? (swipeDir==="left"?"tab-enter-left":swipeDir==="right"?"tab-enter-right":undefined) : undefined}
        style={{
          display:activeTab==="schemes"?"flex":"none",
          flex:1,
          flexDirection:"column",minHeight:0,overflow:"hidden",
          willChange:activeTab==="schemes"?"transform":"auto",
        }}>
        {mountedTabsRef.current.has("schemes") && <SchemesTab lang={lang} dark={dark} onOpenDetail={setSelectedScheme}/>}
      </div>

      {/* PROFILE — lazy mount: nothing rendered until first visit */}
      <div
        ref={activeTab==="profile" ? dragTargetRef : null}
        className={activeTab==="profile" ? (swipeDir==="left"?"tab-enter-left":swipeDir==="right"?"tab-enter-right":undefined) : undefined}
        style={{
          display:activeTab==="profile"?"flex":"none",
          flex:1,
          flexDirection:"column",minHeight:0,overflow:"hidden",
          willChange:activeTab==="profile"?"transform":"auto",
        }}>
        {mountedTabsRef.current.has("profile") && <ProfileTabMemo
          lang={lang}
          profile={profile}
          setProfile={setProfile}
          toggleLang={toggleLang}
          onViewChecker={handleViewChecker}
          dark={dark}
          toggleDark={toggleDark}
          isAdmin={isAdmin}
          onAdminOpen={handleAdminOpen}
          liveCheckerTotal={liveCheckerTotal}
        />}
      </div>

      {/* ── AI TAB — always mounted so chat history survives tab switches.
           IMPORTANT: never use display:none here — it makes scrollHeight=0,
           which causes the auto-resize textarea to collapse to height:0px.
           Instead we keep display:flex always and toggle flex/visibility.
           ── Gate: show AILockedScreen when signed out, AIChat when signed in.
           ── Smooth swipe: direction animation + live dragX applied when active. ── */}
      <div
        ref={activeTab==="ai" ? dragTargetRef : null}
        className={activeTab==="ai"
          ? (swipeDir==="left"?"tab-enter-left":swipeDir==="right"?"tab-enter-right":undefined)
          : undefined}
        style={{
          display:"flex",
          flex:activeTab==="ai"?1:0,
          flexDirection:"column",minHeight:0,overflow:"hidden",
          visibility:activeTab==="ai"?"visible":"hidden",
          pointerEvents:activeTab==="ai"?"auto":"none",
          willChange:activeTab==="ai"?"transform":"auto",
        }}>
        {auth.currentUser ? (
          <AIChat
            lang={lang}
            dark={dark}
            profile={profile}
            uid={auth.currentUser.uid}
            key={auth.currentUser.uid}
          />
        ) : (
          <AILockedScreen
            lang={lang}
            dark={dark}
            onGoToProfile={() => setActiveTab("profile")}
            onGoToChecker={() => setShowChecker(true)}
            activeTab={activeTab}
            schemeCount={SCHEME_DB.length}
          />
        )}
      </div>

      {/* ── FINAL PREMIUM BOTTOM NAV ── */}
      <div className="bnav-wrap" style={{
        /* Frosted glass surface */
        background: dark
          ? "rgba(18,18,20,0.94)"
          : "rgba(255,255,255,0.94)",
        backdropFilter:"blur(24px)",
        WebkitBackdropFilter:"blur(24px)",
        /* Light-catching inner top border */
        borderTop:`1px solid ${dark?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.06)"}`,
        /* Depth shadow */
        boxShadow: dark
          ? "0 -1px 0 rgba(255,255,255,0.04), 0 -12px 40px rgba(0,0,0,0.5)"
          : "0 -1px 0 rgba(0,0,0,0.04), 0 -12px 40px rgba(0,0,0,0.07)",
        paddingTop:"6px",
        paddingLeft:"6px",
        paddingRight:"6px",
        display:"flex",
        alignItems:"center",
        position:"relative",
        zIndex:100,
      }}>
        {navItems.map((item,idx)=>{
          const active = activeTab===item.tab;
          const iconColor = active
            ? "#FF7A00"
            : (dark ? "#606060" : "#C0C0C0");

          return(
            <div key={item.tab} className="bn"
              style={{animationDelay:`${idx*0.05}s`}}
              onClick={()=>{
                if(!active) haptic(30);   // only haptic when switching
                setActiveTab(item.tab);
              }}>

              <div className={`bn-pill${active?" active":""}`}>

                {/* Icon — spring bounce resets via key */}
                <div
                  className={`bn-icon-wrap${active?" popping":""}`}
                  key={`${item.tab}-${active}`}
                  style={{
                    filter: active
                      ? "drop-shadow(0 0 5px rgba(255,122,0,0.55))"
                      : "none",
                    transition:"filter 0.25s",
                  }}>
                  {item.isChakra ? (
                    <div
                      className={active ? "bn-chakra-active" : ""}
                      style={{
                        display:"flex",alignItems:"center",justifyContent:"center",
                        width:22,height:22,
                        opacity: active ? 1 : 0.32,
                        transition:"opacity 0.25s",
                      }}>
                      <AshokaChakra
                        size={22}
                        color={active ? "#FF7A00" : (dark?"#606060":"#C0C0C0")}
                        spinning={false}
                      />
                    </div>
                  ) : active ? (
                    item.iconFilled(iconColor)
                  ) : (
                    item.iconOutline(iconColor)
                  )}
                </div>

                {/* Label — only visible on active, slides in from left */}
                <div
                  className={`bn-label${active?" active":""}`}
                  style={{color:"#FF7A00", fontFamily:bf}}>
                  {item.label}
                </div>
              </div>

              {/* Glowing dot below active tab */}
              {active && <div className="bn-dot"/>}
            </div>
          );
        })}
      </div>

      {/* ── OVERLAYS ── */}
      {showAvatarModal&&(
        <div
          onClick={()=>setShowAvatarModal(false)}
          style={{
            position:"fixed",inset:0,zIndex:9999,
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"rgba(4,4,20,0.58)",
            backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
            animation:"avBg 0.30s ease forwards",
          }}>

          {/* ── Content card ── */}
          <div
            onClick={e=>e.stopPropagation()}
            style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:16,
              animation:"avCard 0.48s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>

            {/* ── Logo block with tri-color glow halo ── */}
            <div style={{position:"relative"}}>
              {/* Tri-color glow halo */}
              <div style={{
                position:"absolute",inset:-8,borderRadius:34,zIndex:0,
                background:"linear-gradient(135deg,#FF9933 0%,#06038D 50%,#138808 100%)",
                opacity:0.50,filter:"blur(14px)",
              }}/>
              {/* Clean white ring */}
              <div style={{
                position:"absolute",inset:-2,borderRadius:30,zIndex:1,
                border:"1.5px solid rgba(255,255,255,0.22)",
                boxShadow:"0 0 0 1px rgba(0,0,0,0.12)",
              }}/>
              {/* Image */}
              <div style={{
                position:"relative",zIndex:2,
                width:"min(50vw,158px)",height:"min(50vw,158px)",
                borderRadius:26,overflow:"hidden",
                boxShadow:"0 0 0 2px rgba(255,255,255,0.26), 0 20px 52px rgba(0,0,0,0.55)",
              }}>
                <img
                  src={appLogo} alt="Yojana Sahay"
                  style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                {/* Shine sweep — one-shot on open */}
                <div style={{
                  position:"absolute",top:0,left:0,height:"100%",width:"45%",
                  background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.34) 50%,transparent 100%)",
                  animation:"avShine 0.80s 0.52s ease-out forwards",
                  pointerEvents:"none",
                }}/>
              </div>
            </div>

            {/* ── App branding ── */}
            <div style={{
              textAlign:"center",
              animation:"avBadge 0.38s 0.22s cubic-bezier(0.22,1,0.36,1) both",
            }}>
              <div style={{
                color:"#fff",fontSize:17,fontWeight:900,
                fontFamily:bf,letterSpacing:-0.4,lineHeight:1.15,
                textShadow:"0 2px 18px rgba(0,0,0,0.55)",
              }}>
                {t.appName}
              </div>
              <div style={{
                display:"flex",alignItems:"center",justifyContent:"center",
                gap:5,marginTop:4,
              }}>
                <span style={{fontSize:11}}>🇮🇳</span>
                <span style={{
                  color:"rgba(255,255,255,0.56)",
                  fontSize:10,fontWeight:700,letterSpacing:0.6,
                  fontFamily:"'Noto Sans',sans-serif",
                  textTransform:"uppercase",
                }}>
                  {t.appSub}
                </span>
              </div>
              {/* Tri-color accent strip */}
              <div style={{
                display:"flex",margin:"9px auto 0",
                width:48,height:2,borderRadius:99,overflow:"hidden",
              }}>
                <div style={{flex:1,background:"#FF9933"}}/>
                <div style={{flex:1,background:"rgba(255,255,255,0.65)"}}/>
                <div style={{flex:1,background:"#138808"}}/>
              </div>
            </div>

            {/* ── Dismiss pill ── */}
            <div style={{
              background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:50,padding:"6px 20px",
              color:"rgba(255,255,255,0.38)",
              fontSize:9.5,fontWeight:700,letterSpacing:0.9,
              fontFamily:"'Noto Sans',sans-serif",
              cursor:"pointer",
              animation:"avBadge 0.38s 0.32s cubic-bezier(0.22,1,0.36,1) both",
            }}>
              TAP ANYWHERE TO CLOSE
            </div>
          </div>
        </div>
      )}
      {showAdmin&&(
        <React.Suspense fallback={null}>
          <AdminDashboard onClose={()=>setShowAdmin(false)} dark={dark} allowedTabs={adminTabs}/>
        </React.Suspense>
      )}
      {/* ── "Just Checking / Update Profile?" Smart Sheet ─────────────────────────
           Appears after eligibility checker completes when a saved profile exists.
           Gives user a clear choice: update profile with new answers, or keep
           existing profile and treat this as a one-off lookup.                     */}
      {showUpdateProfileSheet&&checkerAnswers&&(()=>{
        // ── Compute diff & chips once ──────────────────────────────────────
        const diff=[
          checkerAnswers.who&&checkerAnswers.who!==profile?.occupation,
          checkerAnswers.income&&checkerAnswers.income!==profile?.income,
          checkerAnswers.state&&checkerAnswers.state!==profile?.state,
          checkerAnswers.age&&checkerAnswers.age!==profile?.age,
          checkerAnswers.area&&checkerAnswers.area!==profile?.area,
          checkerAnswers.house&&checkerAnswers.house!==profile?.house,
          checkerAnswers.caste&&checkerAnswers.caste!==profile?.caste,
          checkerAnswers.landHolding&&checkerAnswers.landHolding!==profile?.landHolding,
          checkerAnswers.educationLevel&&checkerAnswers.educationLevel!==profile?.educationLevel,
          checkerAnswers.rationCard&&checkerAnswers.rationCard!==profile?.ration,
        ].filter(Boolean).length;
        const captured=[checkerAnswers.who,checkerAnswers.income,checkerAnswers.state,checkerAnswers.age,checkerAnswers.area,checkerAnswers.house,checkerAnswers.caste,checkerAnswers.landHolding,checkerAnswers.educationLevel,checkerAnswers.rationCard].filter(Boolean).length;
        const chips=[
          checkerAnswers.state&&{icon:"📍",label:checkerAnswers.state},
          checkerAnswers.who&&{icon:"👤",label:checkerAnswers.who},
          checkerAnswers.income&&{icon:"💰",label:checkerAnswers.income},
        ].filter(Boolean).slice(0,3);
        const subtitleEn=diff>0
          ?`${diff} answer${diff!==1?"s":""} from your check differ from your profile`
          :`${captured} answer${captured!==1?"s":""} captured from your eligibility check`;
        const subtitleHi=diff>0
          ?`पात्रता जाँच से ${diff} जवाब आपके प्रोफाइल से अलग हैं`
          :`पात्रता जाँच के ${captured} जवाब प्रोफाइल में सेव करें`;

        return(
        <div
          onClick={()=>{setShowUpdateProfileSheet(false);setCheckerAnswers(null);}}
          style={{
            position:"fixed",inset:0,zIndex:250,
            background:"rgba(0,0,0,0.65)",
            display:"flex",alignItems:"flex-end",
            backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",
            animation:"avBg 0.28s ease forwards",
          }}>
          {/* ── Sheet ── */}
          <div
            onClick={e=>e.stopPropagation()}
            style={{
              width:"100%",maxWidth:440,margin:"0 auto",
              background:dark
                ?"linear-gradient(160deg,#1a1f1a 0%,#111811 100%)"
                :"linear-gradient(160deg,#f8fdf8 0%,#eef7ee 100%)",
              borderRadius:"28px 28px 0 0",
              padding:"0 0 max(32px,env(safe-area-inset-bottom,32px))",
              fontFamily:bf,
              boxShadow:dark
                ?"0 -8px 40px rgba(0,0,0,0.55), 0 -1px 0 rgba(19,136,8,0.25)"
                :"0 -8px 40px rgba(0,0,0,0.18), 0 -1px 0 rgba(19,136,8,0.20)",
              animation:"premiumSheetUp 0.52s cubic-bezier(0.22,1,0.36,1) forwards",
              overflow:"hidden",
              border:`1px solid ${dark?"rgba(19,136,8,0.18)":"rgba(19,136,8,0.14)"}`,
              borderBottom:"none",
            }}>

            {/* ── Decorative top glow bar ── */}
            <div style={{
              position:"absolute",top:0,left:0,right:0,height:2,
              background:"linear-gradient(90deg,transparent,#138808,#80c342,#138808,transparent)",
              opacity:0.7,
            }}/>

            {/* ── Drag handle ── */}
            <div style={{display:"flex",justifyContent:"center",paddingTop:14,paddingBottom:6}}>
              <div style={{
                width:36,height:4,borderRadius:2,
                background:dark?"rgba(255,255,255,0.18)":"rgba(0,0,0,0.14)",
              }}/>
            </div>

            {/* ── Hero header ── */}
            <div style={{padding:"10px 22px 18px",position:"relative"}}>
              {/* Faint radial glow behind icon */}
              <div style={{
                position:"absolute",top:0,left:18,
                width:80,height:80,borderRadius:"50%",
                background:"radial-gradient(circle,rgba(19,136,8,0.18) 0%,transparent 70%)",
                pointerEvents:"none",
              }}/>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,position:"relative"}}>
                {/* Premium icon badge */}
                <div style={{
                  width:52,height:52,borderRadius:16,flexShrink:0,
                  background:dark
                    ?"linear-gradient(135deg,rgba(19,136,8,0.30),rgba(128,195,66,0.18))"
                    :"linear-gradient(135deg,rgba(19,136,8,0.14),rgba(128,195,66,0.10))",
                  border:`1.5px solid ${dark?"rgba(19,136,8,0.45)":"rgba(19,136,8,0.30)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:24,
                  boxShadow:dark?"0 4px 16px rgba(19,136,8,0.25)":"0 4px 14px rgba(19,136,8,0.15)",
                }}>✅</div>

                <div style={{flex:1,paddingTop:2}}>
                  {/* Title */}
                  <div style={{
                    fontSize:18,fontWeight:900,
                    background:"linear-gradient(90deg,#138808,#4caf50)",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                    backgroundClip:"text",
                    fontFamily:bf,lineHeight:1.15,letterSpacing:"-0.3px",
                  }}>
                    {isHindi?"पात्रता जाँच पूरी!":"Eligibility Check Done!"}
                  </div>
                  {/* Subtitle */}
                  <div style={{
                    fontSize:11.5,color:th.textSub,marginTop:4,
                    fontFamily:bf,lineHeight:1.5,
                  }}>
                    {isHindi?subtitleHi:subtitleEn}
                  </div>

                  {/* ── Chips row ── */}
                  {chips.length>0&&(
                    <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                      {chips.map((c,i)=>(
                        <span key={i} style={{
                          display:"inline-flex",alignItems:"center",gap:3,
                          fontSize:10,fontFamily:bf,fontWeight:600,
                          background:dark
                            ?"rgba(19,136,8,0.16)":"rgba(19,136,8,0.09)",
                          color:dark?"#6ed46e":"#1a6b1a",
                          border:`1px solid ${dark?"rgba(19,136,8,0.35)":"rgba(19,136,8,0.22)"}`,
                          borderRadius:20,padding:"3px 9px",
                          whiteSpace:"nowrap",
                          boxShadow:dark?"0 1px 4px rgba(19,136,8,0.12)":"none",
                        }}>
                          <span style={{fontSize:11}}>{c.icon}</span>{c.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div style={{
              margin:"0 18px",height:1,
              background:dark
                ?"linear-gradient(90deg,transparent,rgba(19,136,8,0.30),transparent)"
                :"linear-gradient(90deg,transparent,rgba(19,136,8,0.18),transparent)",
            }}/>

            {/* ── Action buttons ── */}
            <div style={{padding:"16px 18px 0",display:"flex",flexDirection:"column",gap:10}}>

              {/* PRIMARY — Update My Profile */}
              <div
                onClick={()=>{
                  haptic();
                  const updated={
                    ...profile,
                    occupation:checkerAnswers.who||profile.occupation,
                    income:checkerAnswers.income||profile.income,
                    house:checkerAnswers.house||profile.house,
                    age:checkerAnswers.age||profile.age,
                    area:checkerAnswers.area||profile.area,
                    state:checkerAnswers.state||profile.state,
                    caste:checkerAnswers.caste||profile.caste,
                    ...(checkerAnswers.landHolding?{landHolding:checkerAnswers.landHolding}:{}),
                    ...(checkerAnswers.educationLevel?{educationLevel:checkerAnswers.educationLevel}:{}),
                    ...(checkerAnswers.rationCard?{ration:checkerAnswers.rationCard}:{}),
                  };
                  setProfile(updated);
                  if(auth.currentUser){
                    try{updateDoc(doc(db,"users",auth.currentUser.uid),{...updated,lastSeen:serverTimestamp()}).catch(()=>{});}catch{}
                  }
                  setCommittedCheckerAnswers(checkerAnswers);
                  setCheckerRunId(id=>id+1);
                  setCheckerAnswers(null);
                  setShowUpdateProfileSheet(false);
                }}
                style={{
                  position:"relative",overflow:"hidden",
                  display:"flex",alignItems:"center",gap:14,
                  background:"linear-gradient(135deg,#138808 0%,#1aac09 60%,#4caf50 100%)",
                  borderRadius:18,padding:"15px 18px",cursor:"pointer",
                  WebkitTapHighlightColor:"transparent",transition:"transform 0.14s,box-shadow 0.14s",
                  boxShadow:"0 4px 18px rgba(19,136,8,0.35), 0 1px 0 rgba(255,255,255,0.12) inset",
                }}
                onTouchStart={e=>{e.currentTarget.style.transform="scale(0.975)";e.currentTarget.style.boxShadow="0 2px 10px rgba(19,136,8,0.25)";}}
                onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 18px rgba(19,136,8,0.35), 0 1px 0 rgba(255,255,255,0.12) inset";}}
                onTouchCancel={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 18px rgba(19,136,8,0.35), 0 1px 0 rgba(255,255,255,0.12) inset";}}>
                {/* Shine sweep */}
                <div style={{
                  position:"absolute",top:0,left:"-60%",width:"40%",height:"100%",
                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
                  transform:"skewX(-15deg)",
                  animation:"premiumShine 2.4s ease-in-out 0.6s infinite",
                  pointerEvents:"none",
                }}/>
                <div style={{
                  width:40,height:40,borderRadius:12,flexShrink:0,
                  background:"rgba(255,255,255,0.18)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
                }}>💾</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:bf,lineHeight:1.2,letterSpacing:"-0.2px"}}>
                    {isHindi?"प्रोफाइल अपडेट करें":"Update My Profile"}
                  </div>
                  <div style={{fontSize:10.5,color:"rgba(255,255,255,0.78)",marginTop:2.5,fontFamily:bf,lineHeight:1.4}}>
                    {isHindi?"नए जवाब सेव करें — सटीक मिलान के लिए":"Save answers for better scheme matching"}
                  </div>
                </div>
                <div style={{
                  width:28,height:28,borderRadius:8,flexShrink:0,
                  background:"rgba(255,255,255,0.20)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:16,color:"#fff",fontWeight:700,
                }}>›</div>
              </div>

              {/* SECONDARY — Just Checking */}
              <div
                onClick={()=>{
                  haptic();
                  setCheckerAnswers(null);
                  setShowUpdateProfileSheet(false);
                }}
                style={{
                  display:"flex",alignItems:"center",gap:14,
                  background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",
                  border:`1.5px solid ${dark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.09)"}`,
                  borderRadius:18,padding:"13px 18px",cursor:"pointer",
                  WebkitTapHighlightColor:"transparent",transition:"transform 0.14s",
                }}
                onTouchStart={e=>e.currentTarget.style.transform="scale(0.975)"}
                onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
                onTouchCancel={e=>e.currentTarget.style.transform="scale(1)"}>
                <div style={{
                  width:40,height:40,borderRadius:12,flexShrink:0,
                  background:dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
                }}>🔍</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:th.text,fontFamily:bf,lineHeight:1.2}}>
                    {isHindi?"बस देख रहा था":"Just Checking"}
                  </div>
                  <div style={{fontSize:10.5,color:th.textSub,marginTop:2.5,fontFamily:bf,lineHeight:1.4}}>
                    {isHindi?"पुराना प्रोफाइल रखें — परिणाम अस्थायी हैं":"Keep existing profile — results shown temporarily"}
                  </div>
                </div>
                <span style={{color:th.textSub,fontSize:16,flexShrink:0}}>›</span>
              </div>

              {/* Dismiss hint */}
              <div style={{
                textAlign:"center",paddingTop:2,paddingBottom:2,
                color:th.textLight,fontSize:10,fontFamily:bf,opacity:0.6,letterSpacing:"0.2px",
              }}>
                {isHindi?"बाहर टैप करके बंद करें":"Tap outside to dismiss"}
              </div>
            </div>
          </div>
        </div>
        );
      })()}
      {showChecker&&(
        <EligibilityChecker
          lang={lang}
          onClose={()=>setShowChecker(false)}
      onComplete={(answers)=>{
          setCheckerAnswers(answers);
          // If there's no profile, the update-profile sheet will NOT appear,
          // so commit the answers immediately so BenefitCard updates right away.
          // If there IS a profile, we wait for the user's sheet choice before
          // committing or incrementing checkerRunId.
          if(!profile){ setCommittedCheckerAnswers(answers); setCheckerRunId(id=>id+1); }
        }}
          onExitFromResults={(answersAreFromProfile)=>{if(profile&&!answersAreFromProfile)setTimeout(()=>setShowUpdateProfileSheet(true),800);}}
          prefilledAnswers={profileAnswers||undefined}
          onOpenDetail={setSelectedScheme}
          dark={dark}/>
      )}
      {selectedCategory&&(
        <CategorySheet category={selectedCategory} lang={lang} onClose={()=>setSelectedCategory(null)} dark={dark} onOpenDetail={setSelectedScheme}/>
      )}
      {selectedScheme&&(
        <SchemeDetailSheet schemeId={selectedScheme} lang={lang} onClose={()=>setSelectedScheme(null)} dark={dark}/>
      )}
      {showFAQ&&(
        <div
          onTouchStart={e=>e.stopPropagation()}
          onTouchMove={e=>e.stopPropagation()}
          onTouchEnd={e=>e.stopPropagation()}
          style={{
          position:"fixed",inset:0,zIndex:900,
          background:dark?"#000":"#f2f2f7",
          display:"flex",flexDirection:"column",
          fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif",
        }}>
          {/* Sheet header — back chevron + title, matches other full-screen overlays */}
          <div style={{
            display:"flex",alignItems:"center",gap:10,
            padding:"14px 14px 12px",flexShrink:0,
            background:dark?"#0c0c0e":"#fff",
            borderBottom:`1px solid ${dark?"#2c2c2e":"#f0f0f0"}`,
          }}>
            <div
              onClick={()=>{haptic();setShowFAQ(false);}}
              style={{
                width:34,height:34,borderRadius:10,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",
                cursor:"pointer",WebkitTapHighlightColor:"transparent",
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={dark?"#f0f0f0":"#1a1a1a"} strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </div>
            <div style={{fontSize:15.5,fontWeight:800,color:dark?"#f0f0f0":"#1a1a1a",fontFamily:lang==="hi"?"'Noto Sans Devanagari',sans-serif":"'Noto Sans',sans-serif"}}>
              {isHindi?"योजना सहाय FAQ":"YojanaSahay FAQ"}
            </div>
          </div>
          {/* Scrollable FAQ content */}
          <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 16px 32px"}}>
            <Suspense fallback={<PremiumLoader/>}>
            <HomeFAQSection lang={lang} dark={dark}/>
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EXPORT — wrapped in the error boundary so a crash anywhere never shows a blank screen ──
export default function YojanaSahay(){
  let dark=false;
  try{ dark=localStorage.getItem("yojana_dark")==="true"; }catch{}
  return(
    <AppErrorBoundary dark={dark}>
      <YojanaSahayInner/>
    </AppErrorBoundary>
  );
}
