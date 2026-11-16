// Zeitplanung der Wiederholungen nach FSRS-6 (Free Spaced Repetition Scheduler).
//
// FSRS beschreibt das Gedächtnis für jede Karte mit zwei Größen:
//   s (Stabilität)     – nach so vielen Tagen ist die Abrufwahrscheinlichkeit auf 90 % gesunken
//   d (Schwierigkeit)  – 1 (leicht) bis 10 (schwer)
// Nach jeder Antwort werden beide neu berechnet; die nächste Wiederholung fällt auf den Tag,
// an dem die Abrufwahrscheinlichkeit voraussichtlich die Ziel-Behaltensquote erreicht.
//
// Formeln und Standardgewichte folgen der Referenz-Implementierung ts-fsrs 5.x
// (open-spaced-repetition, MIT-Lizenz). Die Lernschritte im Minutenbereich übernimmt hier
// die Sitzung selbst: Falsch beantwortete Aufgaben kommen noch in derselben Sitzung wieder.

export const AGAIN = 1;
export const HARD = 2;
export const GOOD = 3;
export const EASY = 4;

export const W = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796,
  1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
];

const S_MIN = 0.001;
const S_MAX = 36500;
const DECAY = -W[20];
const FACTOR = Math.pow(0.9, 1 / DECAY) - 1;

const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);

/** Wahrscheinlichkeit, die Karte nach t Tagen noch abrufen zu können. */
export function retrievability(t, s) {
  return Math.pow(1 + (FACTOR * t) / s, DECAY);
}

/** Abstand in Tagen, nach dem die Abrufwahrscheinlichkeit auf `retention` gefallen ist. */
export function intervalFor(s, retention = 0.9) {
  const modifier = (Math.pow(retention, 1 / DECAY) - 1) / FACTOR;
  return clamp(Math.round(s * modifier), 1, S_MAX);
}

const initialDifficulty = (g) => W[4] - Math.exp((g - 1) * W[5]) + 1;

function nextDifficulty(d, g) {
  const delta = -W[6] * (g - 3);
  const damped = d + (delta * (10 - d)) / 9;
  return clamp(W[7] * initialDifficulty(EASY) + (1 - W[7]) * damped, 1, 10);
}

function stabilityAfterRecall(d, s, r, g) {
  const hardPenalty = g === HARD ? W[15] : 1;
  const easyBonus = g === EASY ? W[16] : 1;
  const growth = Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1);
  return clamp(s * (1 + growth * hardPenalty * easyBonus), S_MIN, S_MAX);
}

function stabilityAfterLapse(d, s, r) {
  const forgotten = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]);
  // Nach dem Vergessen darf die Stabilität nicht höher liegen als vorher.
  return clamp(Math.min(forgotten, s / Math.exp(W[17] * W[18])), S_MIN, S_MAX);
}

function stabilitySameDay(s, g) {
  const change = Math.pow(s, -W[19]) * Math.exp(W[17] * (g - 3 + W[18]));
  return clamp(s * (g >= HARD ? Math.max(change, 1) : change), S_MIN, S_MAX);
}

/**
 * Neuer Gedächtniszustand nach einer Antwort.
 * @param {{s:number,d:number}|null} state  bisheriger Zustand, null bei einer neuen Karte
 * @param {number} elapsedDays              Tage seit der letzten Wiederholung
 * @param {1|2|3|4} grade                   AGAIN, HARD, GOOD oder EASY
 */
export function nextState(state, elapsedDays, grade) {
  if (!state) {
    return { d: clamp(initialDifficulty(grade), 1, 10), s: Math.max(W[grade - 1], 0.1) };
  }
  const { d, s } = state;
  let stability;
  if (elapsedDays <= 0) stability = stabilitySameDay(s, grade);
  else {
    const r = retrievability(elapsedDays, s);
    stability = grade === AGAIN ? stabilityAfterLapse(d, s, r) : stabilityAfterRecall(d, s, r, grade);
  }
  return { d: nextDifficulty(d, grade), s: stability };
}

/**
 * Wendet eine Antwort auf eine Karte an und plant die nächste Wiederholung.
 * Eine Karte: { s, d, last, due, reps, lapses } – last und due sind Tagesnummern.
 */
export function review(card, grade, today, retention = 0.9) {
  const known = card && card.s ? card : null;
  const elapsed = known ? Math.max(0, today - known.last) : 0;
  const { s, d } = nextState(known, elapsed, grade);
  return {
    s,
    d,
    last: today,
    due: today + intervalFor(s, retention),
    reps: (known ? known.reps : 0) + 1,
    lapses: (known ? known.lapses : 0) + (known && grade === AGAIN ? 1 : 0),
  };
}

/** Aktuelle Abrufwahrscheinlichkeit einer Karte (0–1). */
export function recallProbability(card, today) {
  return retrievability(Math.max(0, today - card.last), card.s);
}
