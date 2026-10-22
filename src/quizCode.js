// src/quizCode.js — Yojana Sahay · eligibility answers as a short code
// ─────────────────────────────────────────────────────────────────────────────
// The Telegram bot keeps the whole quiz inside its button data (Telegram allows
// 64 bytes per button) so nothing about the person is stored on our server.
// The same code opens the app with those answers: /?quiz=<code>.
// One character per answer (the option's position), two for the state.
// ─────────────────────────────────────────────────────────────────────────────
import { INDIA_STATES } from "./schemesData.js";

export const QUIZ = [
  { id: "who",    values: ["farmer", "student", "women", "senior", "business", "general"] },
  { id: "state",  values: INDIA_STATES, wide: true },
  { id: "age",    values: ["below18", "18to35", "35to60", "above60"] },
  { id: "gender", values: ["female", "male", "other"] },
  { id: "income", values: ["below1", "1to3", "3to6", "above6"] },
  { id: "caste",  values: ["general", "obc", "sc", "st", "ews"] },
  { id: "area",   values: ["rural", "semi", "urban"] },
  { id: "house",  values: ["no", "kutcha", "yes"] },
  { id: "educationLevel", values: ["class1to8", "class9to12", "undergrad", "postgrad"], when: a => a.who === "student" },
  { id: "landHolding",    values: ["below1", "1to2", "2to5", "5plus"], when: a => a.who === "farmer" },
];

const asks = (q, a) => !q.when || q.when(a);

// code → { answers, done } (stops at the first character that doesn't fit)
export function decodeQuiz(code) {
  const s = String(code || "");
  const answers = {};
  let i = 0;
  for (const q of QUIZ) {
    if (!asks(q, answers)) continue;
    if (i >= s.length) return { answers, done: false };
    const w = q.wide ? 2 : 1;
    const n = parseInt(s.slice(i, i + w), 36);
    if (s.length < i + w || !Number.isInteger(n) || n < 0 || n >= q.values.length) return { answers, done: false, bad: true };
    answers[q.id] = q.values[n];
    i += w;
  }
  return { answers, done: true };
}

export function encodeAnswer(q, index) {
  return q.wide ? index.toString(36).padStart(2, "0") : index.toString(36);
}

// The next question to ask after these answers, or null when finished.
export function nextQuizQuestion(answers) {
  return QUIZ.find(q => asks(q, answers) && answers[q.id] == null) || null;
}

// Full quiz answers in the shape the app's quiz saves (caste defaults etc.).
export function quizAnswersFromCode(code) {
  const { answers, done } = decodeQuiz(code);
  return done ? answers : null;
}
