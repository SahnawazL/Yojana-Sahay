/**
 * Yojana Sahay — NewsTab.jsx
 * Copyright (c) 2026 Sahnawaz Ahmed Laskar
 * SPDX-License-Identifier: MIT
 *
 * Scheme News Manager tab — extracted from AdminDashboard.jsx.
 * Manages schemeNews Firestore collection: real-time list, add/toggle/delete,
 * and a secure Sync Now that calls /api/admin-sync-news (Firebase-auth gated).
 *
 * Props:
 *   allowedTabs  {Array|null}  — null = full admin, Array = restricted agent
 *   dark         {boolean}
 *   isDesktop    {boolean}
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase.js";

// ─── Theme (mirrors AdminDashboard) ──────────────────────────────────────────
const THEME = {
  light: {
    bg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", inputBg:"#fff",
  },
  dark: {
    bg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", inputBg:"#2c2c2e",
  },
};

const SAFFRON   = "#FF9933";
const NAVY      = "#003580";
const IND_GREEN = "#138808";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "—";
  const d    = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs  = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── NewsIcon ─────────────────────────────────────────────────────────────────
function NewsIcon({ color = "currentColor", size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
      <line x1="16" y1="3"  x2="16" y2="21"/>
      <line x1="2"  y1="9"  x2="22" y2="9"/>
      <line x1="8"  y1="14" x2="13" y2="14"/>
      <line x1="8"  y1="18" x2="11" y2="18"/>
    </svg>
  );
}

// ─── SyncIcon (animated when spinning) ───────────────────────────────────────
function SyncIcon({ spinning, color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round"
      style={spinning ? { animation: "ys-news-spin 0.9s linear infinite" } : {}}>
      <path d="M23 4v6h-6"/>
      <path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NewsTab({ allowedTabs, dark = false, isDesktop = false }) {
  const th          = THEME[dark ? "dark" : "light"];
  const isFullAdmin = allowedTabs === null;
  const canEdit     = isFullAdmin;

  // ── State ──────────────────────────────────────────────────────────────────
  const [newsItems,     setNewsItems]     = useState([]);
  const [newsLoaded,    setNewsLoaded]    = useState(false);
  const [newsFormEn,    setNewsFormEn]    = useState("");
  const [newsFormHi,    setNewsFormHi]    = useState("");
  const [newsFormUrl,   setNewsFormUrl]   = useState("");
  const [newsFormScope, setNewsFormScope] = useState("");
  const [newsAdding,    setNewsAdding]    = useState(false);
  const [newsSyncing,   setNewsSyncing]   = useState(false);
  const [newsSyncMsg,   setNewsSyncMsg]   = useState("");

  // Inline edit state (Medium Impact #4 — tap a headline to edit in-place)
  const [editingId,     setEditingId]     = useState(null);
  const [editFormEn,    setEditFormEn]    = useState("");
  const [editFormHi,    setEditFormHi]    = useState("");
  const [editFormUrl,   setEditFormUrl]   = useState("");
  const [editFormScope, setEditFormScope] = useState("");
  const [editSaving,    setEditSaving]    = useState(false);

  // Bulk delete state (#5 — checkboxes + Delete selected)
  const [selectMode,   setSelectMode]   = useState(false);
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Filter tab state (#6 — All / Active / Inactive)
  const [filterTab, setFilterTab] = useState("all");

  // Ref for the auto-clear timer so we can cancel it on unmount or re-sync
  const syncMsgTimerRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (syncMsgTimerRef.current) clearTimeout(syncMsgTimerRef.current);
  }, []);

  // ── Real-time listener (mounts once, stays alive) ─────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "schemeNews"),
      (snap) => {
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const od = (b.order || 0) - (a.order || 0);
            if (od !== 0) return od;
            return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
          });
        setNewsItems(docs);
        setNewsLoaded(true);
      },
      () => setNewsLoaded(true),
    );
    return () => unsub();
  }, []);

  // ── Add manual item ────────────────────────────────────────────────────────
  const handleAddNewsItem = useCallback(async () => {
    const enText = newsFormEn.trim();
    const hiText = newsFormHi.trim();
    if (!enText || !hiText) return;
    setNewsAdding(true);
    try {
      await addDoc(collection(db, "schemeNews"), {
        text_en:     enText.slice(0, 120),
        text_hi:     hiText.slice(0, 140),
        desc_en:     "",
        desc_hi:     "",
        url:         newsFormUrl.trim(),
        scope:       newsFormScope.trim(),
        source:      "Admin",
        active:      true,
        titleHash:   enText.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 70),
        autoFetched: false,
        createdAt:   serverTimestamp(),
        order:       10,
      });
      setNewsFormEn("");
      setNewsFormHi("");
      setNewsFormUrl("");
      setNewsFormScope("");
    } catch (err) {
      console.error("[NewsTab] Failed to add news item:", err);
      setNewsSyncMsg("✗ Failed to add item — check connection and try again");
    } finally {
      setNewsAdding(false);
    }
  }, [newsFormEn, newsFormHi, newsFormUrl, newsFormScope]);

  // ── Toggle active ──────────────────────────────────────────────────────────
  const handleToggleNews = useCallback(async (item) => {
    try {
      await updateDoc(doc(db, "schemeNews", item.id), { active: !item.active });
    } catch (err) {
      console.error("[NewsTab] Failed to toggle news item:", err);
    }
  }, []);

  // ── Delete item ────────────────────────────────────────────────────────────
  const handleDeleteNews = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, "schemeNews", id));
    } catch (err) {
      console.error("[NewsTab] Failed to delete news item:", err);
    }
  }, []);

  // ── Bulk delete: toggle one item in selection ─────────────────────────────
  const handleToggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Bulk delete: delete all selected from Firestore ────────────────────────
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      await Promise.all([...selectedIds].map(id => deleteDoc(doc(db, "schemeNews", id))));
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (err) {
      console.error("[NewsTab] Bulk delete failed:", err);
    } finally {
      setBulkDeleting(false);
    }
  }, [selectedIds]);

  // ── Inline edit: open edit mode for an item ────────────────────────────────
  const handleStartEdit = useCallback((item) => {
    setSelectMode(false);
    setSelectedIds(new Set());
    setEditingId(item.id);
    setEditFormEn(item.text_en || "");
    setEditFormHi(item.text_hi || "");
    setEditFormUrl(item.url || "");
    setEditFormScope(item.scope || "");
  }, []);

  // ── Inline edit: cancel without saving ──────────────────────────────────────
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditFormEn("");
    setEditFormHi("");
    setEditFormUrl("");
    setEditFormScope("");
  }, []);

  // ── Inline edit: save changes to Firestore ─────────────────────────────────
  const handleSaveEdit = useCallback(async () => {
    const enText = editFormEn.trim();
    const hiText = editFormHi.trim();
    if (!enText || !hiText || !editingId) return;
    setEditSaving(true);
    try {
      await updateDoc(doc(db, "schemeNews", editingId), {
        text_en: enText.slice(0, 120),
        text_hi: hiText.slice(0, 140),
        url:     editFormUrl.trim(),
        scope:   editFormScope.trim(),
      });
      handleCancelEdit();
    } catch (err) {
      console.error("[NewsTab] Failed to save news item edit:", err);
    } finally {
      setEditSaving(false);
    }
  }, [editFormEn, editFormHi, editFormUrl, editFormScope, editingId, handleCancelEdit]);

  // ── Sync Now (calls /api/admin-sync-news — Firebase-auth gated proxy) ─────
  const handleSyncNews = useCallback(async () => {
    setNewsSyncing(true);
    setNewsSyncMsg("");
    try {
      const user = getAuth().currentUser;
      if (!user) {
        setNewsSyncMsg("✗ Not signed in");
        return;
      }
      const idToken = await user.getIdToken();
      const res     = await fetch("/api/admin-sync-news", {
        method:  "POST",
        headers: { "Authorization": `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setNewsSyncMsg(`✗ ${data.error || "Sync failed"}`);
      } else if (data.skipped) {
        setNewsSyncMsg(`⏳ ${data.message}`);
      } else if (data.added != null && data.scanned != null) {
        setNewsSyncMsg(`✓ Added ${data.added} new item${data.added !== 1 ? "s" : ""}. Scanned ${data.scanned}.`);
      } else {
        setNewsSyncMsg(`✓ ${data.message || "Sync complete."}`);
      }
    } catch (err) {
      setNewsSyncMsg("✗ Sync failed — check console");
      console.error("[NewsTab] Sync failed:", err);
    } finally {
      setNewsSyncing(false);
      if (syncMsgTimerRef.current) clearTimeout(syncMsgTimerRef.current);
      syncMsgTimerRef.current = setTimeout(() => setNewsSyncMsg(""), 8000);
    }
  }, []);

  // ── Derived counts ─────────────────────────────────────────────────────────
  const activeCount  = newsItems.filter(n => n.active).length;
  const autoCount    = newsItems.filter(n => n.autoFetched).length;
  const manualCount  = newsItems.filter(n => !n.autoFetched).length;
  const filteredItems = filterTab === "all"
    ? newsItems
    : newsItems.filter(n => filterTab === "active" ? n.active : !n.active);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes ys-news-spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Section header ── */}
      <div style={{ padding: isDesktop ? "18px 40px 0" : "14px 14px 0" }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Icon badge */}
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:`${SAFFRON}18`, border:`1.5px solid ${SAFFRON}44`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <NewsIcon color={SAFFRON} size={17} />
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:th.text, letterSpacing:-0.3, lineHeight:1 }}>
                Scheme News
              </div>
              <div style={{ fontSize:11, color:th.textSub, marginTop:2 }}>
                {newsLoaded
                  ? `${newsItems.length} item${newsItems.length !== 1 ? "s" : ""} · ${activeCount} active`
                  : "Loading…"}
              </div>
            </div>
          </div>

          {/* Sync Now — full admin only */}
          {canEdit && (
            <div
              onClick={newsSyncing ? undefined : handleSyncNews}
              style={{
                display:"flex", alignItems:"center", gap:6,
                background: newsSyncing ? "transparent" : SAFFRON,
                border:`1.5px solid ${newsSyncing ? SAFFRON+"55" : SAFFRON}`,
                borderRadius:10, padding:"7px 13px",
                cursor: newsSyncing ? "default" : "pointer",
                opacity: newsSyncing ? 0.75 : 1,
                transition:"all 0.15s", flexShrink:0,
              }}
            >
              <SyncIcon spinning={newsSyncing} color={newsSyncing ? SAFFRON : "#fff"} />
              <span style={{ fontSize:11, fontWeight:700, color: newsSyncing ? SAFFRON : "#fff", letterSpacing:0.3, whiteSpace:"nowrap" }}>
                {newsSyncing ? "Syncing…" : "Sync Now"}
              </span>
            </div>
          )}
        </div>

        {/* Sync status message */}
        {newsSyncMsg && (
          <div style={{
            marginBottom:10, padding:"8px 12px", borderRadius:8,
            background: newsSyncMsg.startsWith("✗") ? "rgba(229,62,62,0.08)" : newsSyncMsg.startsWith("⏳") ? `${SAFFRON}10` : "rgba(19,136,8,0.08)",
            border:`1px solid ${newsSyncMsg.startsWith("✗") ? "rgba(229,62,62,0.25)" : newsSyncMsg.startsWith("⏳") ? SAFFRON+"44" : "rgba(19,136,8,0.25)"}`,
            fontSize:11, fontWeight:600,
            color: newsSyncMsg.startsWith("✗") ? "#E53E3E" : newsSyncMsg.startsWith("⏳") ? SAFFRON : IND_GREEN,
          }}>
            {newsSyncMsg}
          </div>
        )}

        {/* Stats row */}
        {newsLoaded && newsItems.length > 0 && (
          <div style={{ display:"flex", gap:7, marginBottom:14, flexWrap:"wrap" }}>
            {[
              { label:"Total",  value:newsItems.length, color:th.textMid },
              { label:"Active", value:activeCount,       color:IND_GREEN  },
              { label:"Auto",   value:autoCount,         color:NAVY       },
              { label:"Manual", value:manualCount,       color:SAFFRON    },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background:th.card2, border:`1px solid ${th.border}`,
                borderRadius:8, padding:"5px 10px",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <span style={{ fontSize:13, fontWeight:800, color }}>{value}</span>
                <span style={{ fontSize:9, fontWeight:600, color:th.textSub, letterSpacing:0.4, textTransform:"uppercase" }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Restricted-admin notice */}
        {!canEdit && (
          <div style={{
            marginBottom:12, padding:"9px 12px", borderRadius:9,
            background: dark ? "rgba(255,153,51,0.07)" : "rgba(255,153,51,0.06)",
            border:`1px solid ${SAFFRON}44`,
            fontSize:11, color:SAFFRON,
          }}>
            Read-only — scheme news writes require full admin access.
          </div>
        )}
      </div>

      {/* ── Add Manual Item form — full admin only ── */}
      {canEdit && (
        <div style={{ padding: isDesktop ? "0 40px" : "0 14px", marginBottom:14 }}>
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:14, padding:"13px 14px",
          }}>
            <div style={{
              fontSize:11, fontWeight:800, color:th.text,
              marginBottom:10,
              display:"flex", alignItems:"center", gap:6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={SAFFRON} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5"  y1="12" x2="19" y2="12"/>
              </svg>
              Add Manual News Item
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <input
                className="ys-input"
                value={newsFormEn}
                onChange={e => setNewsFormEn(e.target.value)}
                placeholder="English headline (required)…"
                style={{
                  width:"100%", boxSizing:"border-box",
                  padding:"9px 12px", borderRadius:9,
                  background:th.inputBg, border:`1.5px solid ${newsFormEn ? SAFFRON+"55" : th.border}`,
                  fontSize:12, color:th.text, outline:"none",
                  transition:"border-color 0.15s",
                }}
              />
              <input
                className="ys-input"
                value={newsFormHi}
                onChange={e => setNewsFormHi(e.target.value)}
                placeholder="Hindi headline — हिंदी शीर्षक (required)…"
                style={{
                  width:"100%", boxSizing:"border-box",
                  padding:"9px 12px", borderRadius:9,
                  background:th.inputBg, border:`1.5px solid ${newsFormHi ? SAFFRON+"55" : th.border}`,
                  fontSize:12, color:th.text, outline:"none",
                  fontFamily:"'Noto Sans Devanagari','Noto Sans',sans-serif",
                  transition:"border-color 0.15s",
                }}
              />
              <div style={{ display:"flex", gap:7 }}>
                <input
                  className="ys-input"
                  value={newsFormUrl}
                  onChange={e => setNewsFormUrl(e.target.value)}
                  placeholder="URL (optional)…"
                  style={{
                    flex:2, minWidth:0, padding:"9px 12px", borderRadius:9, boxSizing:"border-box",
                    background:th.inputBg, border:`1.5px solid ${th.border}`,
                    fontSize:12, color:th.text, outline:"none",
                  }}
                />
                <input
                  className="ys-input"
                  value={newsFormScope}
                  onChange={e => setNewsFormScope(e.target.value)}
                  placeholder="Scope…"
                  title="e.g. Central, Maharashtra, Uttar Pradesh"
                  style={{
                    flex:1, minWidth:0, padding:"9px 12px", borderRadius:9, boxSizing:"border-box",
                    background:th.inputBg, border:`1.5px solid ${th.border}`,
                    fontSize:12, color:th.text, outline:"none",
                  }}
                />
              </div>

              <div
                onClick={(newsAdding || !newsFormEn.trim() || !newsFormHi.trim()) ? undefined : handleAddNewsItem}
                style={{
                  background: (!newsFormEn.trim() || !newsFormHi.trim()) ? th.border : NAVY,
                  color:      (!newsFormEn.trim() || !newsFormHi.trim()) ? th.textSub : "#fff",
                  border:"none", borderRadius:9,
                  padding:"10px 16px", fontSize:12, fontWeight:700,
                  cursor: (newsAdding || !newsFormEn.trim() || !newsFormHi.trim()) ? "default" : "pointer",
                  textAlign:"center", transition:"all 0.15s",
                  opacity: newsAdding ? 0.6 : 1,
                  userSelect:"none",
                }}
              >
                {newsAdding ? "Adding…" : "Add Item"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── All News Items list ── */}
      <div style={{ padding: isDesktop ? "0 40px 32px" : "0 14px 32px" }}>
        <div style={{
          background:th.card, border:`1.5px solid ${th.border}`,
          borderRadius:14, overflow:"hidden",
        }}>
          {/* List header */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 14px",
            borderBottom:`1px solid ${th.border}`,
            background:th.card2,
          }}>
            <div style={{ fontSize:11, fontWeight:700, color:th.text, display:"flex", alignItems:"center", gap:6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke={th.textSub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8"  y1="6"  x2="21" y2="6"/>
                <line x1="8"  y1="12" x2="21" y2="12"/>
                <line x1="8"  y1="18" x2="21" y2="18"/>
                <line x1="3"  y1="6"  x2="3.01" y2="6"/>
                <line x1="3"  y1="12" x2="3.01" y2="12"/>
                <line x1="3"  y1="18" x2="3.01" y2="18"/>
              </svg>
              All News Items
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              {/* Delete selected — only visible when items are checked */}
              {canEdit && selectMode && selectedIds.size > 0 && (
                <div
                  onClick={bulkDeleting ? undefined : handleBulkDelete}
                  style={{
                    padding:"4px 10px", borderRadius:8, fontSize:10, fontWeight:700,
                    background: bulkDeleting ? "transparent" : "#E53E3E",
                    color: bulkDeleting ? "#E53E3E" : "#fff",
                    border:`1.5px solid #E53E3E`,
                    cursor: bulkDeleting ? "default" : "pointer",
                    opacity: bulkDeleting ? 0.65 : 1,
                    transition:"all 0.15s", userSelect:"none", whiteSpace:"nowrap",
                  }}
                >
                  {bulkDeleting ? "Deleting…" : `Delete (${selectedIds.size})`}
                </div>
              )}

              {/* Select / Cancel toggle */}
              {canEdit && newsItems.length > 0 && (
                <div
                  onClick={() => { setSelectMode(m => !m); setSelectedIds(new Set()); }}
                  style={{
                    padding:"4px 9px", borderRadius:8, fontSize:10, fontWeight:700,
                    background:"transparent",
                    color: selectMode ? th.textMid : th.textSub,
                    border:`1.5px solid ${th.border}`,
                    cursor:"pointer", userSelect:"none", transition:"all 0.15s",
                  }}
                >
                  {selectMode ? "Cancel" : "Select"}
                </div>
              )}

              <span style={{
                fontSize:9, color:th.textSub,
                background:th.border, padding:"2px 7px", borderRadius:99, fontWeight:600,
              }}>
                {newsItems.length} total
              </span>
            </div>
          </div>

          {/* Filter tabs — All / Active / Inactive */}
          {newsLoaded && newsItems.length > 0 && (
            <div style={{
              display:"flex", gap:0,
              borderBottom:`1px solid ${th.border}`,
              background:th.card,
            }}>
              {[
                { key:"all",      label:"All",      count: newsItems.length },
                { key:"active",   label:"Active",   count: activeCount      },
                { key:"inactive", label:"Inactive", count: newsItems.length - activeCount },
              ].map(({ key, label, count }) => {
                const isActive = filterTab === key;
                return (
                  <div
                    key={key}
                    onClick={() => { setFilterTab(key); setSelectedIds(new Set()); }}
                    style={{
                      flex:1, textAlign:"center",
                      padding:"8px 4px",
                      fontSize:11, fontWeight: isActive ? 800 : 600,
                      color: isActive ? (key === "inactive" ? "#E53E3E" : key === "active" ? IND_GREEN : SAFFRON) : th.textSub,
                      borderBottom: isActive ? `2px solid ${key === "inactive" ? "#E53E3E" : key === "active" ? IND_GREEN : SAFFRON}` : "2px solid transparent",
                      cursor:"pointer", userSelect:"none",
                      transition:"all 0.15s",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                    }}
                  >
                    {label}
                    <span style={{
                      fontSize:9, fontWeight:700,
                      padding:"1px 5px", borderRadius:99,
                      background: isActive
                        ? (key === "inactive" ? "rgba(229,62,62,0.12)" : key === "active" ? `${IND_GREEN}18` : `${SAFFRON}18`)
                        : th.card2,
                      color: isActive
                        ? (key === "inactive" ? "#E53E3E" : key === "active" ? IND_GREEN : SAFFRON)
                        : th.textSub,
                    }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Items */}
          {!newsLoaded ? (
            <div style={{ padding:"24px 14px", textAlign:"center", fontSize:12, color:th.textSub }}>
              Loading…
            </div>
          ) : newsItems.length === 0 ? (
            <div style={{ padding:"24px 14px", textAlign:"center", fontSize:12, color:th.textSub }}>
              No news items yet. Add one above or tap Sync Now.
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding:"24px 14px", textAlign:"center", fontSize:12, color:th.textSub }}>
              No {filterTab} items.
            </div>
          ) : (
            filteredItems.map((item, i) => {
              const isLast    = i === filteredItems.length - 1;
              const isFresh   = item.createdAt?.toMillis?.()
                ? (Date.now() - item.createdAt.toMillis()) < 48 * 3600000
                : false;
              const isEditing = editingId === item.id;

              return (
                <div key={item.id} style={{
                  borderBottom: isLast ? "none" : `1px solid ${th.border}`,
                }}>
                  {isEditing ? (
                    /* ── Inline edit form ── */
                    <div style={{
                      padding:"12px 14px",
                      background: dark ? "rgba(255,153,51,0.05)" : "rgba(255,153,51,0.04)",
                    }}>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <input
                          className="ys-input"
                          autoFocus
                          value={editFormEn}
                          onChange={e => setEditFormEn(e.target.value)}
                          placeholder="English headline…"
                          style={{
                            width:"100%", boxSizing:"border-box",
                            padding:"9px 12px", borderRadius:9,
                            background:th.inputBg, border:`1.5px solid ${SAFFRON}55`,
                            fontSize:12, color:th.text, outline:"none",
                          }}
                        />
                        <input
                          className="ys-input"
                          value={editFormHi}
                          onChange={e => setEditFormHi(e.target.value)}
                          placeholder="Hindi headline — हिंदी शीर्षक…"
                          style={{
                            width:"100%", boxSizing:"border-box",
                            padding:"9px 12px", borderRadius:9,
                            background:th.inputBg, border:`1.5px solid ${SAFFRON}55`,
                            fontSize:12, color:th.text, outline:"none",
                            fontFamily:"'Noto Sans Devanagari','Noto Sans',sans-serif",
                          }}
                        />
                        <div style={{ display:"flex", gap:7 }}>
                          <input
                            className="ys-input"
                            value={editFormUrl}
                            onChange={e => setEditFormUrl(e.target.value)}
                            placeholder="URL…"
                            style={{
                              flex:2, minWidth:0, padding:"9px 12px", borderRadius:9, boxSizing:"border-box",
                              background:th.inputBg, border:`1.5px solid ${th.border}`,
                              fontSize:12, color:th.text, outline:"none",
                            }}
                          />
                          <input
                            className="ys-input"
                            value={editFormScope}
                            onChange={e => setEditFormScope(e.target.value)}
                            placeholder="Scope…"
                            title="e.g. Central, Maharashtra, Uttar Pradesh"
                            style={{
                              flex:1, minWidth:0, padding:"9px 12px", borderRadius:9, boxSizing:"border-box",
                              background:th.inputBg, border:`1.5px solid ${th.border}`,
                              fontSize:12, color:th.text, outline:"none",
                            }}
                          />
                        </div>
                        <div style={{ display:"flex", gap:7, marginTop:2 }}>
                          <div
                            onClick={(editSaving || !editFormEn.trim() || !editFormHi.trim()) ? undefined : handleSaveEdit}
                            style={{
                              flex:1,
                              background: (!editFormEn.trim() || !editFormHi.trim()) ? th.border : NAVY,
                              color:      (!editFormEn.trim() || !editFormHi.trim()) ? th.textSub : "#fff",
                              border:"none", borderRadius:9,
                              padding:"10px 14px", fontSize:12, fontWeight:700,
                              cursor: (editSaving || !editFormEn.trim() || !editFormHi.trim()) ? "default" : "pointer",
                              textAlign:"center", transition:"all 0.15s",
                              opacity: editSaving ? 0.6 : 1,
                              userSelect:"none",
                            }}
                          >
                            {editSaving ? "Saving…" : "Save"}
                          </div>
                          <div
                            onClick={editSaving ? undefined : handleCancelEdit}
                            style={{
                              flex:1,
                              background:"transparent", color:th.textMid,
                              border:`1.5px solid ${th.border}`, borderRadius:9,
                              padding:"10px 14px", fontSize:12, fontWeight:700,
                              cursor: editSaving ? "default" : "pointer",
                              textAlign:"center", userSelect:"none",
                            }}
                          >
                            Cancel
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Normal row ── */
                    <div style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"10px 14px",
                      transition:"background 0.12s",
                    }}>
                      {/* Bulk-select checkbox — only in select mode */}
                      {canEdit && selectMode && (
                        <div
                          onClick={() => handleToggleSelect(item.id)}
                          style={{
                            flexShrink:0, width:20, height:20, borderRadius:6,
                            border:`2px solid ${selectedIds.has(item.id) ? "#E53E3E" : th.border}`,
                            background: selectedIds.has(item.id) ? "#E53E3E" : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            cursor:"pointer", transition:"all 0.15s",
                          }}
                        >
                          {selectedIds.has(item.id) && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                              stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      )}

                      {/* Active toggle */}
                      <div
                        onClick={canEdit ? () => handleToggleNews(item) : undefined}
                        style={{
                          cursor: canEdit ? "pointer" : "default",
                          flexShrink:0, fontSize:16, lineHeight:1,
                          opacity: canEdit ? 1 : 0.6,
                        }}
                        title={canEdit ? (item.active ? "Active — tap to deactivate" : "Inactive — tap to activate") : "Read-only"}
                      >
                        {item.active ? "✅" : "❌"}
                      </div>

                      {/* Text content — tap to edit in-place */}
                      <div
                        onClick={canEdit ? () => handleStartEdit(item) : undefined}
                        style={{ flex:1, minWidth:0, cursor: canEdit ? "pointer" : "default" }}
                        title={canEdit ? "Tap to edit" : undefined}
                      >
                        {/* Badges */}
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", marginBottom:3 }}>
                          <span style={{
                            fontSize:8, fontWeight:800, letterSpacing:0.5,
                            padding:"1px 6px", borderRadius:99, textTransform:"uppercase",
                            background: item.autoFetched ? `${NAVY}18` : `${SAFFRON}18`,
                            color:       item.autoFetched ? NAVY : SAFFRON,
                            border:`1px solid ${item.autoFetched ? NAVY : SAFFRON}44`,
                            flexShrink:0,
                          }}>
                            {item.autoFetched ? "AUTO" : "MANUAL"}
                          </span>
                          {item.scope ? (
                            <span style={{
                              fontSize:8, fontWeight:700,
                              padding:"1px 6px", borderRadius:99, textTransform:"uppercase",
                              background: item.scope === "Central" ? `${NAVY}12` : `${IND_GREEN}12`,
                              color:       item.scope === "Central" ? NAVY : IND_GREEN,
                              flexShrink:0,
                            }}>
                              {item.scope}
                            </span>
                          ) : null}
                          {isFresh && (
                            <span style={{
                              fontSize:8, fontWeight:800,
                              padding:"1px 6px", borderRadius:99,
                              background:IND_GREEN, color:"#fff", flexShrink:0,
                            }}>NEW</span>
                          )}
                        </div>

                        {/* English headline */}
                        <div style={{
                          fontSize:12, fontWeight:600, color:th.text,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                          opacity: item.active ? 1 : 0.45,
                        }}>
                          {item.text_en}
                        </div>

                        {/* Hindi headline */}
                        {item.text_hi && (
                          <div style={{
                            fontSize:10, color:th.textSub, marginTop:1,
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                            fontFamily:"'Noto Sans Devanagari','Noto Sans',sans-serif",
                            opacity: item.active ? 1 : 0.4,
                          }}>
                            {item.text_hi}
                          </div>
                        )}
                      </div>

                      {/* Time + Delete */}
                      <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                        <span style={{ fontSize:9, color:th.textSub, whiteSpace:"nowrap" }}>
                          {timeAgo(item.createdAt)}
                        </span>
                        {canEdit && (
                          <div
                            onClick={() => handleDeleteNews(item.id)}
                            style={{ cursor:"pointer", fontSize:14, lineHeight:1, opacity:0.45, transition:"opacity 0.15s" }}
                            title="Delete item"
                          >🗑</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Setup note */}
        {canEdit && (
          <div style={{
            marginTop:10, padding:"8px 12px", borderRadius:8,
            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            border:`1px solid ${th.border}`,
            fontSize:10, color:th.textSub, lineHeight:1.6,
          }}>
            <span style={{ fontWeight:700, color:th.textMid }}>Sync Now</span> calls{" "}
            <span style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:9, color:SAFFRON }}>/api/admin-sync-news</span>
            {" "}— a secure proxy that verifies your admin session server-side before triggering the RSS fetch.
            No{" "}<span style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:9 }}>VITE_</span> env var needed.
          </div>
        )}
      </div>
    </>
  );
}
