/**
 * Yojana Sahay — AdminPage.jsx
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Standalone admin page — renders at /admin
 * Protected: only renders AdminDashboard if the logged-in
 * * Firebase user has isAdmin: true in Firestore. Otherwise shows a lock screen.
 */

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebase.js";
const AdminDashboard = React.lazy(() => import("./AdminDashboard.jsx"));

export default function AdminPage() {
  const [status, setStatus] = useState("checking"); // "checking" | "allowed" | "denied"

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setStatus("denied"); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().isAdmin === true) {
          setStatus("allowed");
        } else {
          setStatus("denied");
        }
      } catch {
        setStatus("denied");
      }
    });
    return () => unsub();
  }, []);

  // ── Checking auth ────────────────────────────────────────────────────────
  if (status === "checking") {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: "#111", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 14,
        fontFamily: "'Noto Sans', sans-serif",
      }}>
        <div style={{ fontSize: 36, animation: "spin 1s linear infinite" }}>🛡️</div>
        <div style={{ color: "#aaa", fontSize: 13 }}>Verifying access…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Access denied ────────────────────────────────────────────────────────
  if (status === "denied") {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: "#111", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 14, padding: 24,
        fontFamily: "'Noto Sans', sans-serif",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ color: "#f0f0f0", fontSize: 18, fontWeight: 800 }}>
          Access Denied
        </div>
        <div style={{ color: "#888", fontSize: 13, maxWidth: 280, lineHeight: 1.6 }}>
          This page is restricted to admins only.
          Please sign in with the admin account on the main app first.
        </div>
        <div
          onClick={() => window.location.href = "/"}
          style={{
            marginTop: 8, padding: "10px 24px", borderRadius: 12,
            background: "#003580", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          ← Go to App
        </div>
      </div>
    );
  }

  // ── Allowed ──────────────────────────────────────────────────────────────
  return (
    <React.Suspense fallback={null}>
      <AdminDashboard
        onClose={() => window.location.href = "/"}
        dark={true}
      />
    </React.Suspense>
  );
}
