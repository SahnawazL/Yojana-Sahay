// DeadlineAlertsTab.jsx — Yojana Sahay Admin · Deadline Alerts monitor
// ─────────────────────────────────────────────────────────────────────────────
// Mirrors the visual language of NewsTab.jsx / SchemeVerifier.jsx.
//
// Shows:
//   • Last-run stats (checked / sent / skipped, when, triggered by whom)
//   • "Send Alerts Now" manual trigger button
//   • A send log — recent runs, each expandable to see which emails got sent
//
// Talks to /api/deadline-alerts.js (GET for history, POST to trigger),
// authenticated with the current admin's Firebase ID token.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";

const NAVY   = "#06038D";
const GREEN  = "#138808";
const RED    = "#E53E3E";
const AMBER  = "#D97706";

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatBox({ label, value, color, dark }) {
  return (
    <div style={{
      flex: 1, minWidth: 90, background: dark ? "#1a1a1a" : "#fff",
      border: `1.5px solid ${color}30`, borderRadius: 12, padding: "12px 14px",
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: dark ? "#999" : "#666", marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function DeadlineAlertsTab({ dark, isDesktop }) {
  const [runs, setRuns]         = useState([]);
  const [todayQuota, setTodayQuota] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast]       = useState(null);

  const th = {
    bg:     dark ? "#0d0d0d" : "#f5f5f0",
    card:   dark ? "#161616" : "#fff",
    text:   dark ? "#f0f0f0" : "#1a1a1a",
    textSub:dark ? "#999" : "#666",
    border: dark ? "#2a2a2a" : "#e5e5e5",
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      const res = await fetch("/api/deadline-alerts", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setRuns(data.runs || []);
      setTodayQuota(data.todayQuota || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleTrigger = async () => {
    setTriggering(true);
    setToast(null);
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      const res = await fetch("/api/deadline-alerts", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      setToast({ type: "success", text: `Sent ${data.sent} alert${data.sent === 1 ? "" : "s"} · checked ${data.checked} users` });
      await fetchHistory();
    } catch (err) {
      setToast({ type: "error", text: err.message });
    } finally {
      setTriggering(false);
    }
  };

  const latest = runs[0];

  return (
    <div style={{ padding: isDesktop ? "28px 40px 48px" : "14px 13px 36px", background: th.bg, minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: th.text }}>🔔 Deadline Alerts</div>
          <div style={{ fontSize: 12, color: th.textSub, marginTop: 2 }}>
            Emails users about scheme deadlines closing within 7 days · auto-runs daily via cron
          </div>
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggering}
          style={{
            background: triggering ? "#999" : NAVY, color: "#fff", border: "none",
            borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700,
            cursor: triggering ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {triggering ? "Sending…" : "📤 Send Alerts Now"}
        </button>
      </div>

      {/* Daily Gmail quota — always visible, independent of any single run */}
      {todayQuota && (() => {
        const pct = Math.min(100, Math.round((todayQuota.used / todayQuota.limit) * 100));
        const nearLimit = pct >= 80;
        const barColor  = pct >= 100 ? RED : pct >= 80 ? AMBER : GREEN;
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: th.textSub, marginBottom: 4 }}>
              <span>Today's email quota</span>
              <span style={{ fontWeight: 700, color: barColor }}>{todayQuota.used} / {todayQuota.limit}</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: dark ? "#222" : "#e8e8e8", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4, transition: "width 0.3s" }} />
            </div>
            {nearLimit && (
              <div style={{
                marginTop: 8, padding: "9px 12px", borderRadius: 9, fontSize: 11.5, fontWeight: 600,
                background: `${barColor}15`, color: barColor, border: `1px solid ${barColor}30`,
              }}>
                ⚠️ Approaching Gmail's daily sending safety limit ({todayQuota.limit}/day). Any users past this
                limit are automatically retried on the next run — no emails are lost, just delayed.
              </div>
            )}
          </div>
        );
      })()}

      {/* Toast */}
      {toast && (
        <div style={{
          marginBottom: 16, padding: "10px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
          background: toast.type === "success" ? "rgba(19,136,8,0.1)" : "rgba(229,62,62,0.1)",
          color: toast.type === "success" ? GREEN : RED,
          border: `1px solid ${toast.type === "success" ? GREEN : RED}30`,
        }}>
          {toast.type === "success" ? "✅ " : "⚠️ "}{toast.text}
        </div>
      )}

      {/* Last run stats */}
      {loading ? (
        <div style={{ color: th.textSub, fontSize: 13 }}>Loading run history…</div>
      ) : error ? (
        <div style={{ color: RED, fontSize: 13 }}>⚠️ {error}</div>
      ) : !latest ? (
        <div style={{ color: th.textSub, fontSize: 13 }}>No runs yet — click "Send Alerts Now" to run it for the first time.</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <StatBox label="Users Checked" value={latest.checked} color={NAVY} dark={dark} />
            <StatBox label="Emails Sent"   value={latest.sent}    color={GREEN} dark={dark} />
            <StatBox label="Skipped"       value={latest.skipped} color={AMBER} dark={dark} />
          </div>
          <div style={{ fontSize: 11, color: th.textSub, marginBottom: 24 }}>
            Last run: {fmtDateTime(latest.runAt)} · {latest.trigger === "manual" ? `manually by ${latest.triggeredBy}` : "automatic (cron)"}
          </div>
        </>
      )}

      {/* Run log */}
      {!loading && !error && runs.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: th.textSub, marginBottom: 10, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Send Log — last {runs.length} runs
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {runs.map(run => (
              <div key={run.id} style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div
                  onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                  style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: th.text }}>
                      {fmtDateTime(run.runAt)}
                      <span style={{
                        marginLeft: 8, fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                        background: run.trigger === "manual" ? "rgba(6,3,141,0.1)" : "rgba(19,136,8,0.1)",
                        color: run.trigger === "manual" ? NAVY : GREEN,
                      }}>
                        {run.trigger === "manual" ? `MANUAL · ${run.triggeredBy}` : "AUTO CRON"}
                      </span>
                      {run.quotaHit && (
                        <span style={{
                          marginLeft: 6, fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                          background: "rgba(217,119,6,0.12)", color: AMBER,
                        }}>
                          QUOTA LIMIT HIT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: th.textSub, marginTop: 3 }}>
                      {run.checked} checked · {run.sent} sent · {run.skipped} skipped
                    </div>
                  </div>
                  <div style={{ fontSize: 16, color: th.textSub }}>{expandedId === run.id ? "▲" : "▼"}</div>
                </div>

                {expandedId === run.id && (
                  <div style={{ borderTop: `1px solid ${th.border}`, padding: "10px 14px", background: dark ? "#0f0f0f" : "#fafafa" }}>
                    {run.recipients.length === 0 ? (
                      <div style={{ fontSize: 11.5, color: th.textSub }}>No emails sent this run.</div>
                    ) : (
                      run.recipients.map((r, i) => (
                        <div key={i} style={{ padding: "8px 0", borderBottom: i < run.recipients.length - 1 ? `1px solid ${th.border}` : "none" }}>
                          <div style={{ fontSize: 11.5, color: th.text }}>
                            <span style={{ fontWeight: 600 }}>{r.email}</span>
                            <span style={{ color: th.textSub }}> — {r.schemeCount} scheme{r.schemeCount === 1 ? "" : "s"}, soonest in {r.soonestDays} day{r.soonestDays === 1 ? "" : "s"}</span>
                            {r.reminderCount > 0 && (
                              <span style={{
                                marginLeft: 6, fontSize: 9, fontWeight: 800, letterSpacing: 0.3,
                                padding: "1px 6px", borderRadius: 20, color: RED, background: "rgba(229,62,62,0.1)",
                              }}>
                                FINAL REMINDER ×{r.reminderCount}
                              </span>
                            )}
                          </div>
                          {r.introText && (
                            <div style={{
                              marginTop: 4, fontSize: 11, lineHeight: 1.5, color: th.textSub,
                              background: dark ? "#161616" : "#f0f0f0", borderRadius: 6,
                              padding: "6px 8px", display: "flex", gap: 6, alignItems: "flex-start",
                            }}>
                              <span style={{
                                flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                                padding: "1px 5px", borderRadius: 4,
                                color: r.aiPersonalized ? "#8B5CF6" : th.textSub,
                                background: r.aiPersonalized ? "rgba(139,92,246,0.14)" : (dark ? "#222" : "#e4e4e4"),
                              }}>
                                {r.aiPersonalized ? "AI" : "TEMPLATE"}
                              </span>
                              <span style={{ fontStyle: "italic" }}>"{r.introText}"</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
