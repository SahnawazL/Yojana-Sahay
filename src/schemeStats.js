// src/schemeStats.js — Yojana Sahay · scheme counts, computed from the data
// One source for every number the app and website show ("1,100+ schemes",
// "34 states & UTs"). Nothing is typed by hand: each deploy recounts — and a
// deploy happens every time a scheme is added or removed.
import { SCHEME_DB } from "./schemesData.js";

const LIVE = SCHEME_DB.filter(s => s && !s.duplicateOf && !s.closed);

export const SCHEME_COUNT  = LIVE.length;                                   // open schemes (home screen counter)
export const STATE_COUNT   = new Set(LIVE.filter(s => s.scope === "state" && s.state).map(s => s.state)).size;
export const CENTRAL_COUNT = LIVE.filter(s => s.scope === "national").length;
// Rounded down to the hundred for text: 1,198 → "1,100+", 1,203 → "1,200+".
export const SCHEME_COUNT_LABEL = `${(Math.floor(SCHEME_COUNT / 100) * 100).toLocaleString("en-IN")}+`;
