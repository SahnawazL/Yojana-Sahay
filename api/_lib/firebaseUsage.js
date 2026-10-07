// api/_lib/firebaseUsage.js — Yojana Sahay · Firestore usage vs the free limit
// ─────────────────────────────────────────────────────────────────────────────
// Powers the "Firebase usage" card in Admin → Agents. Reads Google Cloud
// Monitoring (read-only) with the server's existing Firebase service account:
//   · today's document reads / writes / deletes (hour by hour) + yesterday's
//   · stored data size (when Google reports it — it updates about once a day)
// The free day resets at midnight US Pacific time (12:30 / 13:30 IST).
//
// Needs ONE thing in Google Cloud: the firebase-adminsdk service account must
// have the "Monitoring Viewer" role. Without it this returns { ok:false,
// setup:{...} } with plain-language steps instead of throwing.
// Nothing is written to Firestore — opening the card costs no quota.
// ─────────────────────────────────────────────────────────────────────────────

import { getApps } from "firebase-admin/app";

export const FREE_LIMITS = {
  reads: 50_000,
  writes: 20_000,
  deletes: 20_000,
  storageBytes: 1024 ** 3, // 1 GiB
};

const METRICS = {
  reads:   "firestore.googleapis.com/document/read_count",
  writes:  "firestore.googleapis.com/document/write_count",
  deletes: "firestore.googleapis.com/document/delete_count",
};

const HOUR = 3600_000;

// Start of the current "free day" (midnight America/Los_Angeles) as epoch ms.
function ptParts(t) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles", hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(t)).map(x => [x.type, x.value])
  );
  const offset = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(t / 1000) * 1000;
  return { dayUtc: Date.UTC(+p.year, +p.month - 1, +p.day), offset }; // offset = PT minus UTC
}
export function pacificMidnight(now = Date.now()) {
  const { dayUtc, offset } = ptParts(now);
  const guess = dayUtc - offset;
  return dayUtc - ptParts(guess).offset; // re-check the offset AT midnight (DST change days)
}

async function accessToken() {
  const app = getApps()[0];
  const cred = app?.options?.credential;
  if (!cred?.getAccessToken) throw new Error("Firebase admin is not initialised");
  return (await cred.getAccessToken()).access_token;
}

class SetupNeeded extends Error {
  constructor(kind, msg, link) { super(msg); this.kind = kind; this.link = link; }
}

async function monitoring(token, project, params) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`https://monitoring.googleapis.com/v3/projects/${project}/timeSeries?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data.timeSeries ?? [];
  const msg = data?.error?.message ?? `HTTP ${res.status}`;
  if (res.status === 403 && /has not been used|is disabled|SERVICE_DISABLED/i.test(JSON.stringify(data))) {
    throw new SetupNeeded("api", msg, `https://console.cloud.google.com/apis/library/monitoring.googleapis.com?project=${project}`);
  }
  if (res.status === 403) {
    throw new SetupNeeded("role", msg, `https://console.cloud.google.com/iam-admin/iam?project=${project}`);
  }
  throw new Error(`Google Monitoring: ${msg}`);
}

const num = v => Number(v?.int64Value ?? v?.doubleValue ?? 0) || 0;

async function countSeries(token, project, metric, startMs, endMs) {
  return monitoring(token, project, {
    filter: `metric.type = "${metric}"`,
    "interval.startTime": new Date(startMs).toISOString(),
    "interval.endTime": new Date(endMs).toISOString(),
    "aggregation.alignmentPeriod": "3600s",
    "aggregation.perSeriesAligner": "ALIGN_SUM",
    "aggregation.crossSeriesReducer": "REDUCE_SUM",
  });
}

// Stored bytes: Google publishes this roughly daily. Discover the metric name
// at run time (it has changed before) and take the newest value.
async function storedBytes(token, project) {
  try {
    const res = await fetch(
      `https://monitoring.googleapis.com/v3/projects/${project}/metricDescriptors?` +
        new URLSearchParams({ filter: 'metric.type = starts_with("firestore.googleapis.com/storage")' }),
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000) }
    );
    const descs = ((await res.json()).metricDescriptors ?? []).filter(d => d.unit === "By" || /bytes/i.test(d.type));
    const pick = descs.find(d => /data_and_index/i.test(d.type)) ?? descs[0];
    if (!pick) return null;
    const now = Date.now();
    const series = await monitoring(token, project, {
      filter: `metric.type = "${pick.type}"`,
      "interval.startTime": new Date(now - 4 * 86400_000).toISOString(),
      "interval.endTime": new Date(now).toISOString(),
    });
    let total = 0, at = null, found = false;
    for (const s of series) {
      const p = s.points?.[0]; // newest first
      if (!p) continue;
      found = true;
      total += num(p.value);
      const t = p.interval?.endTime;
      if (t && (!at || t > at)) at = t;
    }
    return found ? { bytes: total, at } : null;
  } catch {
    return null;
  }
}

export async function getFirebaseUsage() {
  const project = process.env.FIREBASE_PROJECT_ID;
  const now = Date.now();
  const dayStart = pacificMidnight(now);
  const prevStart = pacificMidnight(dayStart - HOUR); // handles 23/25 h DST days
  const base = {
    project,
    limits: FREE_LIMITS,
    dayStart: new Date(dayStart).toISOString(),
    resetsAt: new Date(pacificMidnight(dayStart + 26 * HOUR)).toISOString(),
    checkedAt: new Date(now).toISOString(),
  };

  try {
    const token = await accessToken();
    const out = { ...base, ok: true, today: {}, yesterday: {}, hourly: {} };
    const hours = Math.max(1, Math.ceil((now - dayStart) / HOUR));

    await Promise.all(Object.entries(METRICS).map(async ([key, metric]) => {
      const series = await countSeries(token, project, metric, prevStart, now);
      let today = 0, yesterday = 0;
      const hourly = new Array(hours).fill(0);
      for (const s of series) {
        for (const p of s.points ?? []) {
          const end = Date.parse(p.interval?.endTime);
          const v = num(p.value);
          if (end > dayStart) {
            today += v;
            const i = Math.min(hours - 1, Math.max(0, Math.floor((end - 1 - dayStart) / HOUR)));
            hourly[i] += v;
          } else if (end > prevStart) {
            yesterday += v;
          }
        }
      }
      out.today[key] = today;
      out.yesterday[key] = yesterday;
      out.hourly[key] = hourly;
    }));

    out.storage = await storedBytes(token, project);
    return out;
  } catch (err) {
    if (err instanceof SetupNeeded) {
      return { ...base, ok: false, setup: { kind: err.kind, link: err.link, detail: String(err.message).slice(0, 240) } };
    }
    return { ...base, ok: false, error: String(err.message ?? err).slice(0, 240) };
  }
}
