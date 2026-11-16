// Kurslogik: Fortschritt berechnen, den nächsten sinnvollen Schritt finden, Sitzungen zusammenstellen.

import { store } from './store.js';
import { dayNumber, shuffle, pick } from './util.js';
import { recallProbability } from './srs.js';
import {
  units, words, lessons, lessonById, dialogueById, wordById, grammarItemById,
  learnSession, reviewEx, exerciseForCard, grammarEx, grammarReviewEx, mcEx, typeEx, dictationEx, buildEx,
  canBuild, quizEx, speakEx,
} from './content.js';
import { startSession } from './session.js';
import { canSpeak } from './speech.js';

// ---------- Fortschritt ----------
export const isLearned = (w) => Boolean(store.card(w.id));
export const learnedWords = () => words.filter(isLearned);
export const dueCount = () => store.dueIds().filter((id) => wordById.has(id) || grammarItemById.has(id)).length;

export function unitProgress(u) {
  const learned = u.items.filter(isLearned).length;
  const grammarDone = u.grammar.filter((g) => store.isDone('g:' + g)).length;
  const dialogueDone = u.dialogue ? store.isDone('d:' + u.dialogue) : false;
  const total = u.items.length + 6 * u.grammar.length + (u.dialogue ? 6 : 0);
  const done = learned + 6 * grammarDone + (dialogueDone ? 6 : 0);
  return { learned, words: u.items.length, grammarDone, dialogueDone, fraction: done / total, complete: done === total };
}

/** Wie gefestigt ein Wort ist: 0 neu, 1 lernend, 2 gefestigt (hält voraussichtlich mindestens drei Wochen). */
export function wordLevel(w) {
  const c = store.card(w.id);
  if (!c) return 0;
  return c.s >= 21 ? 2 : 1;
}

/**
 * Der nächste empfohlene Schritt im Kurs. Wörter und Grammatik wechseln sich ab:
 * erst zwei Portionen Wörter, dann die Grammatik der Lektion, dann der Rest und zum Schluss der Dialog.
 */
export function nextStep() {
  const chunk = store.settings.newPerSession;
  for (const u of units) {
    const p = unitProgress(u);
    if (p.complete) continue;
    const openGrammar = u.grammar.find((g) => !store.isDone('g:' + g));
    if (p.learned < Math.min(p.words, chunk * 2)) return { unit: u, type: 'words' };
    if (openGrammar) return { unit: u, type: 'grammar', lesson: lessonById.get(openGrammar) };
    if (p.learned < p.words) return { unit: u, type: 'words' };
    if (u.dialogue && !p.dialogueDone) return { unit: u, type: 'dialogue', dialogue: dialogueById.get(u.dialogue) };
  }
  return null;
}

export function describeStep(step) {
  if (!step) return null;
  const n = units.indexOf(step.unit) + 1;
  const head = `Lektion ${n} · ${step.unit.hr}`;
  if (step.type === 'words') {
    const open = step.unit.items.filter((w) => !isLearned(w)).length;
    const count = Math.min(open, store.settings.newPerSession);
    return { head, text: `${count} neue ${count === 1 ? 'Wort' : 'Wörter'} lernen`, icon: step.unit.icon };
  }
  if (step.type === 'grammar') return { head, text: `Grammatik: ${step.lesson.title}`, icon: '🧩' };
  return { head, text: `Dialog: ${step.dialogue.hr}`, icon: '🎧' };
}

// ---------- Sitzungen ----------
export function startLearn(u) {
  const fresh = u.items.filter((w) => !isLearned(w)).slice(0, store.settings.newPerSession);
  if (!fresh.length) return;
  startSession({
    mode: 'learn',
    title: u.hr,
    exercises: learnSession(fresh),
    again: () => startLearn(u),
    canAgain: () => u.items.some((w) => !isLearned(w)),
  });
}

/** Fällige Karten – Wörter und Grammatik bunt gemischt. */
export function startReview() {
  const today = dayNumber();
  const ids = store.dueIds(today)
    .sort((a, b) => recallProbability(store.card(a), today) - recallProbability(store.card(b), today))
    .slice(0, store.settings.reviewsPerSession);
  const exercises = shuffle(ids.map((id) => exerciseForCard(id, store.card(id))).filter(Boolean));
  if (!exercises.length) return false;
  startSession({
    mode: 'review',
    title: 'Wiederholung',
    exercises,
    again: startReview,
    canAgain: () => dueCount() > 0,
  });
  return true;
}

export function startGrammar(lesson) {
  startSession({
    mode: 'review',
    title: lesson.title,
    exercises: lesson.items.map((it) => grammarEx(it)),
    onFinish: () => store.markDone('g:' + lesson.id),
  });
}

export function startQuiz(dialogue) {
  startSession({
    mode: 'free',
    title: dialogue.hr,
    exercises: dialogue.quiz.map(quizEx),
    onFinish: () => store.markDone('d:' + dialogue.id),
  });
}

export function startShadowing(dialogue) {
  startSession({ mode: 'free', title: 'Nachsprechen', exercises: dialogue.lines.map(speakEx) });
}

/** Die Wörter, die am ehesten vergessen werden – dort bringt Üben am meisten. */
function weakest(list, n) {
  const today = dayNumber();
  const sorted = list.slice().sort((a, b) => recallProbability(store.card(a.id), today) - recallProbability(store.card(b.id), today));
  return pick(sorted.slice(0, Math.max(n, Math.ceil(sorted.length / 3))), n);
}

export const PRACTICE = [
  { id: 'listen', icon: '👂', title: 'Hörtraining', text: 'Wörter und Sätze nur über das Ohr erkennen und mitschreiben.', needsAudio: true },
  { id: 'write', icon: '✍️', title: 'Schreibtraining', text: 'Vom Deutschen ins Kroatische – aktives Abrufen.' },
  { id: 'build', icon: '🧱', title: 'Sätze bauen', text: 'Beispielsätze aus Wörtern zusammensetzen.' },
  { id: 'hard', icon: '🎯', title: 'Schwierige Wörter', text: 'Gezielt das üben, was oft schiefgeht.' },
  { id: 'grammar', icon: '🧩', title: 'Grammatik-Mix', text: 'Aufgaben aus allen bearbeiteten Lektionen, gemischt.' },
];

export function practiceExercises(kind, pool = learnedWords()) {
  if (kind === 'grammar') {
    const items = [...grammarItemById.values()].filter((it) => store.card(it.id));
    return pick(items, 12).map((it) => grammarReviewEx(it, store.card(it.id)));
  }
  if (kind === 'listen') {
    if (!canSpeak('hr')) return [];
    return shuffle(weakest(pool, 12).map((w, i) => (i % 3 === 2 ? dictationEx(w, i % 2 === 0) : i % 3 === 1 ? dictationEx(w) : mcEx(w, 'listen'))));
  }
  if (kind === 'write') return weakest(pool, 12).map(typeEx);
  if (kind === 'build') return weakest(pool.filter(canBuild), 10).map(buildEx);
  if (kind === 'hard') {
    const hard = pool.slice().sort((a, b) => {
      const ca = store.card(a.id);
      const cb = store.card(b.id);
      return cb.lapses - ca.lapses || cb.d - ca.d;
    });
    return shuffle(hard.slice(0, 12)).map((w) => reviewEx(w, store.card(w.id)));
  }
  return shuffle(weakest(pool, 15)).map((w) => reviewEx(w, store.card(w.id)));
}

export function startPractice(kind, pool, title) {
  const exercises = practiceExercises(kind, pool);
  if (!exercises.length) return false;
  startSession({
    mode: 'review',
    title: title || PRACTICE.find((p) => p.id === kind)?.title || 'Üben',
    exercises,
    again: () => startPractice(kind, pool, title),
  });
  return true;
}

// ---------- Statistik ----------
export function summaryStats() {
  const today = dayNumber();
  const learned = learnedWords();
  let answered = 0;
  let correct = 0;
  for (let d = today - 6; d <= today; d++) {
    const s = store.day(d);
    answered += s.n;
    correct += s.c;
  }
  return {
    learned: learned.length,
    total: words.length,
    solid: learned.filter((w) => wordLevel(w) === 2).length,
    due: dueCount(),
    streak: store.streak(),
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
    lessonsDone: lessons.filter((g) => store.isDone('g:' + g.id)).length,
  };
}

/** Anzahl fälliger Karten für heute und die nächsten Tage. */
export function forecast(days = 7) {
  const today = dayNumber();
  const out = Array.from({ length: days }, (_, i) => ({ day: today + i, n: 0 }));
  for (const c of Object.values(store.cards)) {
    const i = Math.max(0, c.due - today);
    if (i < days) out[i].n += 1;
  }
  return out;
}

export function activity(days = 14) {
  const today = dayNumber();
  return Array.from({ length: days }, (_, i) => {
    const day = today - (days - 1 - i);
    return { day, n: store.day(day).n };
  });
}
