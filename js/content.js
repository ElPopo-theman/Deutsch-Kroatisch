// Bereitet die Lerninhalte auf und baut daraus einzelne Aufgaben.

import { UNITS } from './data/vocab.js';
import { GRAMMAR } from './data/grammar.js';
import { DIALOGUES } from './data/dialogues.js';
import { shuffle, pick, normalize } from './util.js';
import { canSpeak } from './speech.js';

// ---------- Index ----------
export const units = UNITS;
export const words = [];
export const wordById = new Map();
export const unitById = new Map();

for (const u of UNITS) {
  u.items = u.words.map(([hr, de, ex, exDe, opt = {}]) => ({ id: `${u.id}:${hr}`, unit: u.id, hr, de, ex, exDe, ...opt }));
  unitById.set(u.id, u);
  for (const w of u.items) {
    words.push(w);
    wordById.set(w.id, w);
  }
}

export const lessons = GRAMMAR;
export const lessonById = new Map();
export const grammarItemById = new Map();

for (const g of GRAMMAR) {
  g.items = g.ex.map((e) => ({ ...e, id: `${g.id}:${e.q || e.hr}`, lesson: g.id }));
  lessonById.set(g.id, g);
  for (const it of g.items) grammarItemById.set(it.id, it);
}

export const dialogues = DIALOGUES;
export const dialogueById = new Map(DIALOGUES.map((d) => [d.id, d]));

export const GENDER = { m: 'maskulin', f: 'feminin', n: 'neutrum' };

// ---------- Hilfen ----------
function distractors(w, key, n = 3) {
  const taken = new Set([w[key]]);
  const out = [];
  const add = (list) => {
    for (const x of shuffle(list)) {
      if (out.length >= n) return;
      if (taken.has(x[key])) continue;
      taken.add(x[key]);
      out.push(x[key]);
    }
  };
  const unit = unitById.get(w.unit).items.filter((x) => x !== w);
  add(unit.filter((x) => Boolean(x.g) === Boolean(w.g))); // gleiche Wortart wirkt glaubwürdiger
  add(unit);
  add(words);
  return out;
}

const options = (correct, wrong) => shuffle([{ label: correct, correct: true }, ...wrong.map((label) => ({ label }))]);

function sentenceTokens(sentence) {
  return sentence.split(/\s+/).map((t) => t.replace(/^[„"(]+|[.,!?:;“")]+$/g, '')).filter(Boolean);
}

export function canBuild(w) {
  const n = sentenceTokens(w.ex).length;
  return n >= 3 && n <= 8;
}

function hintFor(answer) {
  return answer.split(' ').map((part) => part[0] + '·'.repeat(Math.max(0, part.length - 1))).join(' ');
}

// ---------- Aufgaben zu Wörtern ----------
export const introEx = (w) => ({ kind: 'intro', word: w });

/** Auswahlaufgabe. mode: 'hr-de' (erkennen), 'de-hr' (abrufen), 'listen' (nur hören). */
export function mcEx(w, mode) {
  if (mode === 'listen' && !canSpeak('hr')) mode = 'hr-de';
  const reveal = { hr: w.hr, de: w.de, say: w.hr };
  if (mode === 'de-hr') {
    return {
      kind: 'mc', cardId: w.id, reveal, sayAfter: true,
      instruction: 'Wie heißt das auf Kroatisch?',
      prompt: { text: w.de },
      options: options(w.hr, distractors(w, 'hr')), optionsLang: 'hr',
    };
  }
  return {
    kind: 'mc', cardId: w.id, reveal, sayAfter: false,
    instruction: mode === 'listen' ? 'Was hörst du?' : 'Was bedeutet das?',
    prompt: { text: w.hr, lang: 'hr', say: w.hr, audioOnly: mode === 'listen' },
    options: options(w.de, distractors(w, 'de')),
  };
}

/** Deutsch sehen, Kroatisch tippen. */
export function typeEx(w) {
  return {
    kind: 'type', cardId: w.id, sayAfter: true,
    instruction: 'Schreibe auf Kroatisch',
    prompt: { text: w.de },
    answers: [w.hr, ...(w.alt || [])],
    hint: hintFor(w.hr),
    reveal: { hr: w.hr, de: w.de, say: w.hr },
  };
}

/** Diktat: Wort oder Beispielsatz hören und schreiben. */
export function dictationEx(w, sentence = false) {
  if (!canSpeak('hr')) return typeEx(w);
  const hr = sentence ? w.ex : w.hr;
  return {
    kind: 'type', cardId: w.id, sayAfter: false,
    instruction: 'Schreibe, was du hörst',
    prompt: { say: hr, audioOnly: true },
    answers: sentence ? [hr] : [hr, ...(w.alt || [])],
    reveal: { hr, de: sentence ? w.exDe : w.de, say: hr },
  };
}

/** Den Beispielsatz aus gemischten Wörtern zusammensetzen. */
export function buildEx(w) {
  const tokens = sentenceTokens(w.ex);
  let mixed = shuffle(tokens);
  for (let i = 0; i < 5 && mixed.join(' ') === tokens.join(' '); i++) mixed = shuffle(tokens);
  return {
    kind: 'build', cardId: w.id, sayAfter: true,
    instruction: 'Bilde den Satz',
    prompt: { text: w.exDe },
    tokens: mixed,
    solution: w.ex,
    reveal: { hr: w.ex, de: w.exDe, say: w.ex },
  };
}

/** Passende Wiederholungsaufgabe: je gefestigter das Wort, desto mehr eigenes Abrufen und Schreiben. */
export function reviewEx(w, card) {
  const s = card ? card.s : 0;
  const r = Math.random();
  if (s < 4) return r < 0.35 ? mcEx(w, 'hr-de') : r < 0.65 ? mcEx(w, 'listen') : mcEx(w, 'de-hr');
  if (s < 15) {
    if (r < 0.45) return typeEx(w);
    if (r < 0.65) return dictationEx(w);
    if (r < 0.85 && canBuild(w)) return buildEx(w);
    return mcEx(w, 'de-hr');
  }
  if (r < 0.55) return typeEx(w);
  if (r < 0.75) return dictationEx(w, true);
  return canBuild(w) ? buildEx(w) : typeEx(w);
}

/**
 * Lerneinheit für neue Wörter: vorstellen, sofort wiedererkennen, dann – mit wachsendem Abstand –
 * abrufen, hören und selbst schreiben.
 */
export function learnSession(ws) {
  const q = [];
  ws.forEach((w, i) => {
    q.push(introEx(w), mcEx(w, 'hr-de'));
    if (i % 2 === 1) q.push(mcEx(ws[i - 1], 'listen'));
  });
  shuffle(ws).forEach((w) => q.push(mcEx(w, 'de-hr')));
  pick(ws, Math.ceil(ws.length / 2)).forEach((w) => q.push(mcEx(w, 'listen')));
  shuffle(ws).forEach((w) => q.push(typeEx(w)));
  pick(ws.filter(canBuild), 2).forEach((w) => q.push(buildEx(w)));
  return q;
}

// ---------- Aufgaben zur Grammatik ----------
function fullSentence(item) {
  return item.q.replace(/\s*\([^)]*\)\s*$/, '').replace('___', item.a);
}

/** typed = true verlangt die Lösung getippt statt als Auswahl. */
export function grammarEx(item, typed = false) {
  if (item.t === 'm') {
    return {
      kind: 'mc', cardId: item.id, sayAfter: false,
      instruction: 'Wähle die richtige Antwort',
      prompt: { text: item.q, small: true },
      options: options(item.o[0], item.o.slice(1)),
      reveal: { hr: item.o[0] },
    };
  }
  if (item.t === 'd') {
    if (!canSpeak('hr')) {
      return {
        kind: 'type', cardId: item.id, sayAfter: true, instruction: 'Schreibe auf Kroatisch',
        prompt: { text: item.de }, answers: [item.hr], hint: hintFor(item.hr),
        reveal: { hr: item.hr, de: item.de, say: item.hr },
      };
    }
    return {
      kind: 'type', cardId: item.id, sayAfter: false,
      instruction: 'Schreibe, was du hörst',
      prompt: { say: item.hr, audioOnly: true },
      answers: [item.hr],
      reveal: { hr: item.hr, de: item.de, say: item.hr },
    };
  }
  const full = fullSentence(item);
  const isPair = item.q.includes('→');
  const base = {
    cardId: item.id, sayAfter: true,
    prompt: { text: item.q, cloze: true, sub: item.de, lang: 'hr' },
    reveal: { hr: full, de: item.de, say: isPair ? item.a : full, mark: item.a },
  };
  if (item.o && !typed) {
    return { ...base, kind: 'mc', instruction: 'Was passt in die Lücke?', options: options(item.a, item.o), optionsLang: 'hr' };
  }
  return { ...base, kind: 'type', instruction: 'Ergänze die Lücke', answers: [item.a], strict: true };
}

/** Wiederholung einer Grammatikkarte: sobald sie etwas gefestigt ist, wird getippt statt gewählt. */
export const grammarReviewEx = (item, card) => grammarEx(item, Boolean(card && card.s >= 4));

// ---------- Dialoge ----------
export function quizEx([question, opts]) {
  return {
    kind: 'mc', sayAfter: false,
    instruction: 'Hast du es verstanden?',
    prompt: { text: question, small: true },
    options: options(opts[0], opts.slice(1)),
    reveal: { hr: opts[0] },
  };
}

export const speakEx = ([speaker, hr, de]) => ({ kind: 'speak', line: { speaker, hr, de } });

// ---------- Aufgabe zu einer beliebigen Karte ----------
export function exerciseForCard(id, card) {
  const w = wordById.get(id);
  if (w) return reviewEx(w, card);
  const g = grammarItemById.get(id);
  if (g) return grammarReviewEx(g, card);
  return null; // Karte gehört zu einem Inhalt, den es nicht mehr gibt
}

export const sameSentence = (a, b) => normalize(a) === normalize(b);
