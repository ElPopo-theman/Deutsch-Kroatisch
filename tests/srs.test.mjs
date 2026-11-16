import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextState, intervalFor, retrievability, review, AGAIN, HARD, GOOD, EASY } from '../js/srs.js';

const close = (actual, expected, tolerance = 1e-5) =>
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} ≉ ${expected}`);

function run(sequence) {
  let state = null;
  for (const [elapsed, grade] of sequence) state = nextState(state, elapsed, grade);
  return state;
}

// Erwartete Werte stammen aus der Referenz-Implementierung ts-fsrs 5.4.2 (FSRS-6, Standardgewichte).
const REFERENCE = [
  { seq: [[0, 3], [2, 3], [6, 3], [20, 3]], s: 93.77242217, d: 2.09745544, interval: 94 },
  { seq: [[0, 1], [1, 3], [3, 2], [5, 1], [1, 3]], s: 1.92617193, d: 9.1813409, interval: 2 },
  { seq: [[0, 4], [9, 3], [40, 1], [1, 2], [0, 3]], s: 4.26994041, d: 7.99882227, interval: 4 },
  { seq: [[0, 2], [0, 3], [1, 3], [4, 4], [30, 3]], s: 90.99650456, d: 3.42954509, interval: 91 },
  { seq: [[0, 3], [10, 1], [0, 1], [2, 3]], s: 1.29348757, d: 9.11491869, interval: 1 },
];

test('stimmt mit der FSRS-Referenz überein', () => {
  for (const ref of REFERENCE) {
    const state = run(ref.seq);
    close(state.s, ref.s);
    close(state.d, ref.d);
    assert.equal(intervalFor(state.s), ref.interval);
  }
});

test('Stabilität ist die Zeit bis zu 90 % Abrufwahrscheinlichkeit', () => {
  for (const s of [0.5, 3, 30, 400]) close(retrievability(s, s), 0.9);
  assert.equal(retrievability(0, 5), 1);
  assert.ok(retrievability(10, 5) < 0.9);
});

test('bessere Antworten ergeben längere Abstände', () => {
  const start = run([[0, GOOD], [3, GOOD]]);
  const after = (grade) => nextState(start, 8, grade).s;
  assert.ok(after(AGAIN) < start.s, 'Vergessen senkt die Stabilität');
  assert.ok(after(AGAIN) < after(HARD));
  assert.ok(after(HARD) < after(GOOD));
  assert.ok(after(GOOD) < after(EASY));
});

test('Schwierigkeit bleibt zwischen 1 und 10', () => {
  let hard = null;
  let easy = null;
  for (let i = 0; i < 40; i++) {
    hard = nextState(hard, i ? 3 : 0, AGAIN);
    easy = nextState(easy, i ? 3 : 0, EASY);
  }
  assert.ok(hard.d <= 10 && hard.d > 9);
  assert.ok(easy.d >= 1 && easy.d < 2);
});

test('review plant die nächste Wiederholung und zählt Fehler', () => {
  const first = review(null, GOOD, 100);
  assert.equal(first.last, 100);
  assert.equal(first.due, 102);
  assert.deepEqual([first.reps, first.lapses], [1, 0]);

  const second = review(first, GOOD, 102);
  assert.ok(second.due - 102 > 2, 'der Abstand wächst');

  const lapse = review(second, AGAIN, second.due);
  assert.equal(lapse.lapses, 1);
  const gap = lapse.due - lapse.last;
  assert.ok(gap >= 1 && gap < second.due - second.last, 'nach einem Fehler kommt die Karte bald wieder');
});

test('höhere Behaltensquote verkürzt die Abstände', () => {
  assert.ok(intervalFor(30, 0.93) < intervalFor(30, 0.9));
  assert.ok(intervalFor(30, 0.9) < intervalFor(30, 0.85));
  assert.equal(intervalFor(0.01), 1, 'nie weniger als ein Tag');
});
