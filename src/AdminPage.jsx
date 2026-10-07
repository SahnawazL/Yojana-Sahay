/**
 * Yojana Sahay — AdminPage.jsx
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Standalone admin page — renders at /admin
 *
 * Sign-in now happens HERE too. The page used to only work if you had already
 * signed in on the main app in the same browser; opening /admin directly (new
 * browser, installed home-screen app, private tab, other device) showed
 * "Access denied" with no way to sign in.
 *
 *   · Google (popup, redirect fallback) or e-mail + password, right on /admin
 *   · Session is kept in this browser (local persistence) — reopening /admin
 *     later goes straight to the dashboard
 *   · Last verified role is cached per user, so the dashboard opens instantly
 *     while the role is re-checked in the background (Firestore rules still
 *     enforce every read/write — the cache only affects what's shown first)
 *   · Live role check: if admin access is removed, the dashboard closes
 *   · A network hiccup during the role check offers "Retry" instead of a
 *     false "Access denied"
 *   · Signed in with a non-admin account → shows which account + "use another"
 */

import React, { useEffect, useRef, useState } from "react";
import {
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, signInWithEmailAndPassword, sendPasswordResetEmail, signOut,
  setPersistence, browserLocalPersistence,
} from "firebase/auth";
import { onSnapshot, doc, getDocFromServer } from "firebase/firestore";
import { auth, db } from "./firebase.js";
const AdminDashboard = React.lazy(() => import("./AdminDashboard.jsx"));

const ROLE_CACHE_KEY = uid => `ys_admin_role_${uid}`;

function readRoleCache(uid) {
  try {
    const v = JSON.parse(localStorage.getItem(ROLE_CACHE_KEY(uid)) || "null");
    return v && (v.full === true || Array.isArray(v.tabs)) ? v : null;
  } catch { return null; }
}
function writeRoleCache(uid, role) {
  try {
    if (role) localStorage.setItem(ROLE_CACHE_KEY(uid), JSON.stringify(role));
    else localStorage.removeItem(ROLE_CACHE_KEY(uid));
  } catch { /* private mode etc. */ }
}

function roleFromUserDoc(data) {
  if (!data) return null;
  if (data.isAdmin === true) return { full: true, tabs: null };
  if (Array.isArray(data.adminTabs) && data.adminTabs.length > 0) return { full: false, tabs: data.adminTabs };
  return null;
}

function authErrorText(err) {
  const code = err?.code || "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") return "Wrong e-mail or password.";
  if (code === "auth/invalid-email") return "That e-mail address doesn't look right.";
  if (code === "auth/too-many-requests") return "Too many attempts — wait a few minutes and try again.";
  if (code === "auth/network-request-failed") return "No internet connection — check your network and try again.";
  if (code === "auth/unauthorized-domain") return "This domain isn't allowed for sign-in. Add it in Firebase → Authentication → Settings → Authorized domains.";
  if (code === "auth/user-disabled") return "This account has been disabled.";
  return err?.message || "Sign-in failed. Please try again.";
}

// What the role check found, in plain words.
function describeDoc(user, data, fromCache) {
  const show = v => (v === undefined ? "missing" : JSON.stringify(v));
  const hints = [];
  if (!data) hints.push(`No document users/${user.uid} — the admin doc must use this exact ID (Firestore → users → document ID = UID).`);
  else {
    if (data.isAdmin !== undefined && data.isAdmin !== true) {
      hints.push(typeof data.isAdmin === "string"
        ? 'isAdmin is the TEXT "true" — change its type to boolean true.'
        : `isAdmin is ${show(data.isAdmin)} — set it to boolean true.`);
    }
    if (data.isAdmin === undefined && data.role === "admin") hints.push('This doc has role: "admin" but no isAdmin field — add isAdmin: true (boolean). Your Firestore rules check isAdmin.');
    if (data.isAdmin === undefined && data.role !== "admin" && !Array.isArray(data.adminTabs)) hints.push("No isAdmin field on this account's document — this is probably a different account (different UID) from your admin one.");
  }
  return {
    uid: user.uid,
    provider: user.providerData?.map(p => p.providerId).join(", ") || "—",
    exists: !!data,
    isAdmin: data ? show(data.isAdmin) : "—",
    adminTabs: data ? show(data.adminTabs) : "—",
    source: fromCache ? "phone cache" : "server",
    hints,
  };
}

function DiagBox({ diag }) {
  const row = (k, v) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "3px 0" }}>
      <span style={{ color: "#8a93a8" }}>{k}</span>
      <span style={{ color: "#e2e8ff", fontFamily: "monospace", wordBreak: "break-all", textAlign: "right" }}>{v}</span>
    </div>
  );
  return (
    <div style={{ marginTop: 16, textAlign: "left", background: "#141826", border: "1px solid #2a3042", borderRadius: 12, padding: "10px 12px", fontSize: 12 }}>
      {row("UID", diag.uid)}
      {row("Sign-in method", diag.provider)}
      {row("User doc", diag.exists ? "found" : "not found")}
      {row("isAdmin", diag.isAdmin)}
      {row("adminTabs", diag.adminTabs)}
      {row("Checked from", diag.source)}
      {diag.error && row("Error", diag.error)}
      {diag.hints?.map((h, i) => (
        <div key={i} style={{ color: "#fbbf24", marginTop: 6, lineHeight: 1.5 }}>⚠ {h}</div>
      ))}
    </div>
  );
}

// ── Shared screen shell ─────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0b0d14", overflowY: "auto",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "'Noto Sans', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>{children}</div>
      <style>{`@keyframes ys-adm-spin{to{transform:rotate(360deg)}}
        .ys-adm-input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:1px solid #2a3042;background:#141826;color:#f0f2f8;font-size:14px;outline:none}
        .ys-adm-input:focus{border-color:#4f8ef7}
        .ys-adm-btn{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:none;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}
        .ys-adm-btn:disabled{opacity:.6;cursor:default}`}</style>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <Shell>
      <div style={{ fontSize: 36, display: "inline-block", animation: "ys-adm-spin 1s linear infinite" }}>🛡️</div>
      <div style={{ color: "#9aa3b8", fontSize: 13, marginTop: 14 }}>{label}</div>
    </Shell>
  );
}

function Header({ icon = "🛡️", title, sub }) {
  return (
    <>
      <div style={{ fontSize: 44 }}>{icon}</div>
      <div style={{ color: "#f0f2f8", fontSize: 19, fontWeight: 800, marginTop: 8 }}>{title}</div>
      {sub && <div style={{ color: "#8a93a8", fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>{sub}</div>}
    </>
  );
}

// ── Sign-in screen ──────────────────────────────────────────────────────────
function SignIn({ initialError }) {
  const [mode, setMode]       = useState("choose"); // "choose" | "email"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]       = useState(null);     // "google" | "email" | "reset"
  const [error, setError]     = useState(initialError || "");
  const [info, setInfo]       = useState("");

  const google = () => {
    // signInWithPopup must start synchronously inside the click (user gesture).
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const p = signInWithPopup(auth, provider);
    setBusy("google"); setError(""); setInfo("");
    p.catch(err => {
      if (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment") {
        signInWithRedirect(auth, provider).catch(e => { setError(authErrorText(e)); setBusy(null); });
        return;
      }
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") setError(authErrorText(err));
      setBusy(null);
    });
  };

  const emailSignIn = async (e) => {
    e?.preventDefault?.();
    if (!email.trim() || !password) { setError("Enter your e-mail and password."); return; }
    setBusy("email"); setError(""); setInfo("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged in AdminPage takes it from here.
    } catch (err) {
      setError(authErrorText(err));
      setBusy(null);
    }
  };

  const reset = async () => {
    if (!email.trim()) { setError("Type your e-mail first, then tap “Forgot password”."); return; }
    setBusy("reset"); setError(""); setInfo("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo(`Password reset link sent to ${email.trim()}.`);
    } catch (err) {
      setError(authErrorText(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Shell>
      <Header title="Admin sign-in" sub="Yojana Sahay Control Centre — sign in with your admin account. You'll stay signed in on this device." />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22, textAlign: "left" }}>
        {mode === "choose" ? (
          <>
            <button className="ys-adm-btn" onClick={google} disabled={!!busy} style={{ background: "#fff", color: "#1f2937" }}>
              {busy === "google"
                ? <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #ccc", borderTopColor: "#4285F4", animation: "ys-adm-spin .8s linear infinite" }} />
                : <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>}
              Continue with Google
            </button>
            <button className="ys-adm-btn" onClick={() => { setMode("email"); setError(""); }} disabled={!!busy} style={{ background: "#1b2133", color: "#e2e8ff", border: "1px solid #2a3042" }}>
              ✉️ Sign in with e-mail
            </button>
          </>
        ) : (
          <form onSubmit={emailSignIn} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="ys-adm-input" type="email" autoComplete="username" placeholder="Admin e-mail" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            <input className="ys-adm-input" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="ys-adm-btn" type="submit" disabled={!!busy} style={{ background: "#003580", color: "#fff" }}>
              {busy === "email" ? "Signing in…" : "Sign in"}
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
              <span onClick={() => { setMode("choose"); setError(""); setInfo(""); }} style={{ color: "#8a93a8", cursor: "pointer" }}>← Other options</span>
              <span onClick={busy ? undefined : reset} style={{ color: "#4f8ef7", cursor: "pointer" }}>{busy === "reset" ? "Sending…" : "Forgot password?"}</span>
            </div>
          </form>
        )}

        {error && <div role="alert" style={{ color: "#f87171", fontSize: 12.5, lineHeight: 1.5, textAlign: "center" }}>{error}</div>}
        {info  && <div role="status" style={{ color: "#4ade80", fontSize: 12.5, lineHeight: 1.5, textAlign: "center" }}>{info}</div>}

        <div onClick={() => { window.location.href = "/"; }} style={{ marginTop: 6, color: "#8a93a8", fontSize: 12.5, textAlign: "center", cursor: "pointer" }}>
          ← Back to Yojana Sahay
        </div>
      </div>
    </Shell>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  // "checking" | "signin" | "verifying" | "allowed" | "denied" | "error"
  const [status, setStatus]   = useState("checking");
  const [role, setRole]       = useState(null);    // { full, tabs }
  const [user, setUser]       = useState(null);
  const [signInError, setSignInError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  // What the role check actually saw — shown on the "No admin access" screen
  // so a wrong account / wrong field type is obvious.
  const [diag, setDiag] = useState(null);
  const [rechecking, setRechecking] = useState(false);
  const roleUnsubRef = useRef(null);

  // Keep the session across browser restarts (this is Firebase's web default,
  // made explicit so it can't silently change to session-only).
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    // Finish a Google redirect sign-in (popup-blocked fallback).
    getRedirectResult(auth).catch(err => setSignInError(authErrorText(err)));
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      roleUnsubRef.current?.(); roleUnsubRef.current = null;
      setUser(u);
      if (!u) { setRole(null); setStatus("signin"); return; }

      // Instant open with the last verified role, re-checked live below.
      const cached = readRoleCache(u.uid);
      if (cached) { setRole(prev => (JSON.stringify(prev) === JSON.stringify(cached) ? prev : cached)); setStatus("allowed"); }
      else setStatus("verifying");

      roleUnsubRef.current = onSnapshot(
        doc(db, "users", u.uid),
        (snap) => {
          const data = snap.exists() ? snap.data() : null;
          const fromCache = !!snap.metadata?.fromCache;
          setDiag(describeDoc(u, data, fromCache));
          const r = roleFromUserDoc(data);
          // The phone's offline cache can hold an OLD copy of the user doc
          // (from before isAdmin was set). A "no" from the cache is not
          // trusted — wait for the server's answer (the listener fires again
          // when it arrives). A "yes" from the cache is fine to show early.
          if (!r && fromCache) {
            if (!readRoleCache(u.uid)) setStatus("verifying");
            return;
          }
          writeRoleCache(u.uid, r);
          // Same role → keep the same object so the dashboard doesn't re-render
          // its tab list every time the user doc changes (lastSeen etc.).
          if (r) { setRole(prev => (JSON.stringify(prev) === JSON.stringify(r) ? prev : r)); setStatus("allowed"); }
          else   { setRole(null); setStatus("denied"); }
        },
        (err) => {
          console.warn("[AdminPage] role check failed:", err?.code || err?.message);
          if (err?.code === "permission-denied") { writeRoleCache(u.uid, null); setStatus("denied"); return; }
          // Network / transient error: keep a cached session open, otherwise offer Retry.
          if (!readRoleCache(u.uid)) setStatus("error");
        }
      );
    });
    return () => { unsubAuth(); roleUnsubRef.current?.(); };
  }, [retryKey]);

  // Force a fresh server read (bypasses the offline cache).
  const recheck = async () => {
    if (!user) return;
    setRechecking(true);
    try {
      const snap = await getDocFromServer(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : null;
      setDiag(describeDoc(user, data, false));
      const r = roleFromUserDoc(data);
      writeRoleCache(user.uid, r);
      if (r) { setRole(r); setStatus("allowed"); }
    } catch (err) {
      setDiag(d => ({ ...(d || describeDoc(user, null, false)), error: err?.code || err?.message || "read failed" }));
    } finally {
      setRechecking(false);
    }
  };

  // Server never answered (offline) — after a while show the real state
  // instead of spinning forever.
  useEffect(() => {
    if (status !== "verifying") return;
    const t = setTimeout(() => setStatus(s => (s === "verifying" ? "error" : s)), 15000);
    return () => clearTimeout(t);
  }, [status]);

  const switchAccount = async () => {
    try { await signOut(auth); } catch { /* ignore */ }
  };

  if (status === "checking")  return <Spinner label="Checking your session…" />;
  if (status === "verifying") return <Spinner label="Verifying admin access…" />;
  if (status === "signin")    return <SignIn initialError={signInError} />;

  if (status === "error") {
    return (
      <Shell>
        <Header icon="📡" title="Couldn't verify access" sub="The admin check didn't reach the server — usually a network hiccup." />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <button className="ys-adm-btn" onClick={() => { setStatus("verifying"); setRetryKey(k => k + 1); }} style={{ background: "#003580", color: "#fff" }}>↻ Retry</button>
          <button className="ys-adm-btn" onClick={switchAccount} style={{ background: "#1b2133", color: "#e2e8ff", border: "1px solid #2a3042" }}>Sign out</button>
        </div>
      </Shell>
    );
  }

  if (status === "denied") {
    return (
      <Shell>
        <Header icon="🔒" title="No admin access" sub={<>You're signed in as <strong style={{ color: "#e2e8ff" }}>{user?.email || user?.phoneNumber || "this account"}</strong>, which isn't an admin account.</>} />
        {diag && <DiagBox diag={diag} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          <button className="ys-adm-btn" onClick={recheck} disabled={rechecking} style={{ background: "#14532d", color: "#fff" }}>{rechecking ? "Checking server…" : "↻ Check again (from server)"}</button>
          <button className="ys-adm-btn" onClick={switchAccount} style={{ background: "#003580", color: "#fff" }}>Use another account</button>
          <button className="ys-adm-btn" onClick={() => { window.location.href = "/"; }} style={{ background: "#1b2133", color: "#e2e8ff", border: "1px solid #2a3042" }}>← Go to App</button>
        </div>
      </Shell>
    );
  }

  return (
    <React.Suspense fallback={<Spinner label="Opening Control Centre…" />}>
      <AdminDashboard
        onClose={() => { window.location.href = "/"; }}
        dark={true}
        allowedTabs={role?.full ? null : role?.tabs ?? []}
      />
    </React.Suspense>
  );
}
