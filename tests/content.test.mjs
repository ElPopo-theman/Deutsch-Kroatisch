// Prüft die Lerninhalte auf Vollständigkeit und innere Stimmigkeit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import {
  units, words, lessons, lessonById, dialogues, dialogueById, grammarItemById, wordById,
  learnSession, exerciseForCard, grammarEx, buildEx, canBuild, sameSentence, mcEx, typeEx,
} from '../js/content.js';
import { checkAnswer } from '../js/util.js';
import { VERSION } from '../js/version.js';

const unique = (list) => new Set(list).size === list.length;

test('Wortschatz: vollständige Einträge mit eindeutigen Kennungen', () => {
  assert.ok(words.length >= 500, `nur ${words.length} Wörter`);
  assert.ok(unique(words.map((w) => w.id)), 'doppelte Wort-Kennung');
  for (const w of words) {
    for (const key of ['hr', 'de', 'ex', 'exDe']) {
      assert.ok(typeof w[key] === 'string' && w[key].trim() === w[key] && w[key].length > 0, `${w.id}: Feld ${key}`);
    }
    if (w.g) assert.ok(['m', 'f', 'n'].includes(w.g), `${w.id}: Genus ${w.g}`);
    assert.match(w.ex, /[.!?]$/, `${w.id}: Beispielsatz ohne Satzzeichen`);
    assert.match(w.exDe, /[.!?]$/, `${w.id}: Übersetzung ohne Satzzeichen`);
    assert.ok(!/[()/]/.test(w.hr), `${w.id}: Klammern oder Schrägstrich im kroatischen Wort`);
  }
});

test('Wortschatz: innerhalb einer Lektion ist jede Übersetzung eindeutig', () => {
  for (const u of units) {
    assert.ok(unique(u.items.map((w) => w.de)), `${u.id}: doppelte deutsche Bedeutung`);
    assert.ok(u.items.length >= 12, `${u.id}: zu wenige Wörter`);
  }
});

test('Kurs: Verweise auf Grammatik und Dialoge stimmen', () => {
  const usedLessons = new Set();
  const usedDialogues = new Set();
  for (const u of units) {
    for (const g of u.grammar) {
      assert.ok(lessonById.has(g), `${u.id}: Grammatik ${g} fehlt`);
      assert.ok(!usedLessons.has(g), `Grammatik ${g} doppelt zugeordnet`);
      usedLessons.add(g);
    }
    if (u.dialogue) {
      assert.ok(dialogueById.has(u.dialogue), `${u.id}: Dialog ${u.dialogue} fehlt`);
      usedDialogues.add(u.dialogue);
    }
  }
  assert.equal(usedLessons.size, lessons.length, 'nicht jede Grammatiklektion gehört zu einer Kurslektion');
  assert.equal(usedDialogues.size, dialogues.length, 'nicht jeder Dialog gehört zu einer Kurslektion');
});

test('Grammatik: Aufgaben sind lösbar und eindeutig', () => {
  let count = 0;
  for (const g of lessons) {
    assert.ok(g.title && g.html && g.summary && g.group, `${g.id}: Angaben fehlen`);
    assert.ok(g.items.length >= 8, `${g.id}: zu wenige Aufgaben`);
    assert.ok(unique(g.items.map((it) => it.id)), `${g.id}: doppelte Aufgabe`);
    for (const it of g.items) {
      count += 1;
      if (it.t === 'c') {
        assert.equal(it.q.split('___').length, 2, `${it.id}: genau eine Lücke erwartet`);
        assert.match(it.q, /^(.*?)___(.*?)(\s*\([^)]*\))?$/, `${it.id}: Lückenformat`);
        assert.ok(it.a && it.de, `${it.id}: Lösung oder Übersetzung fehlt`);
        if (it.o) {
          assert.ok(it.o.length >= 1 && unique([it.a, ...it.o]), `${it.id}: Auswahl nicht eindeutig`);
          // Kein Distraktor darf beim Tippen als richtig durchgehen.
          for (const wrong of it.o) assert.equal(checkAnswer(wrong, [it.a], { strict: true }).ok, false, `${it.id}: „${wrong}“ gilt als richtig`);
        }
      } else if (it.t === 'm') {
        assert.ok(it.o.length >= 2 && unique(it.o), `${it.id}: Auswahl`);
      } else {
        assert.equal(it.t, 'd');
        assert.ok(it.hr && it.de, `${it.id}: Diktat unvollständig`);
      }
      assert.ok(grammarEx(it), `${it.id}: keine Aufgabe erzeugt`);
      assert.ok(grammarEx(it, true), `${it.id}: keine getippte Aufgabe erzeugt`);
    }
  }
  assert.equal(count, grammarItemById.size);
});

test('Grammatik: Erklärungen sind wohlgeformt', () => {
  for (const g of lessons) {
    for (const tag of ['table', 'ul', 'p', 'span', 'b', 'li', 'tr', 'div']) {
      const open = (g.html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
      const closed = (g.html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      assert.equal(open, closed, `${g.id}: <${tag}> nicht ausgeglichen`);
    }
  }
});

test('Dialoge: Zeilen und Verständnisfragen', () => {
  for (const d of dialogues) {
    assert.ok(d.lines.length >= 6, `${d.id}: zu kurz`);
    for (const line of d.lines) assert.ok(line.length === 3 && line.every((x) => x && x.trim() === x), `${d.id}: Zeile unvollständig`);
    assert.equal(d.quiz.length, 3, `${d.id}: drei Fragen erwartet`);
    for (const [q, opts] of d.quiz) assert.ok(q && opts.length >= 3 && unique(opts), `${d.id}: Frage „${q}“`);
  }
});

test('Aufgaben lassen sich für jede Karte erzeugen', () => {
  for (const w of words) {
    for (const s of [1, 8, 40]) assert.ok(exerciseForCard(w.id, { s }), w.id);
    const mc = mcEx(w, 'de-hr');
    assert.equal(mc.options.filter((o) => o.correct).length, 1);
    assert.ok(unique(mc.options.map((o) => o.label)), `${w.id}: doppelte Auswahl`);
    assert.equal(checkAnswer(w.hr, typeEx(w).answers).kind, 'exact');
  }
  for (const id of grammarItemById.keys()) assert.ok(exerciseForCard(id, { s: 1 }) && exerciseForCard(id, { s: 9 }), id);
  assert.equal(exerciseForCard('gibt-es-nicht', { s: 1 }), null);
});

test('Sätze zum Zusammenbauen ergeben wieder den Beispielsatz', () => {
  const buildable = words.filter(canBuild);
  assert.ok(buildable.length > 300);
  for (const w of buildable) {
    const ex = buildEx(w);
    const original = w.ex.split(/\s+/).map((t) => t.replace(/^[„"(]+|[.,!?:;“")]+$/g, '')).filter(Boolean);
    assert.deepEqual([...ex.tokens].sort(), [...original].sort(), w.id);
    assert.ok(sameSentence(original.join(' '), ex.solution), `${w.id}: Lösung wird nicht erkannt`);
  }
});

test('Eine Lerneinheit stellt jedes Wort vor und fragt es mehrfach ab', () => {
  const chunk = units[0].items.slice(0, 6);
  const session = learnSession(chunk);
  for (const w of chunk) {
    assert.equal(session.filter((e) => e.kind === 'intro' && e.word === w).length, 1);
    assert.ok(session.filter((e) => e.cardId === w.id).length >= 3, `${w.id} wird zu selten abgefragt`);
    const intro = session.findIndex((e) => e.kind === 'intro' && e.word === w);
    const firstQuestion = session.findIndex((e) => e.cardId === w.id);
    assert.ok(intro < firstQuestion, `${w.id} wird abgefragt, bevor es vorgestellt wurde`);
  }
  assert.ok(wordById.has(chunk[0].id));
});

test('Service Worker kennt alle Dateien der App', async () => {
  const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  assert.ok(sw.includes(`'bok-${VERSION}'`), 'Versionsnummer in sw.js und js/version.js stimmt nicht überein');
  const listed = [...sw.matchAll(/^\s+'([^']+)',$/gm)].map((m) => m[1]).filter((f) => f !== './');
  const root = new URL('../', import.meta.url);
  for (const file of listed) await assert.doesNotReject(readFile(new URL(file, root)), `${file} fehlt`);

  const onDisk = [];
  for (const dir of ['js', 'js/data', 'js/views', 'css', 'icons']) {
    for (const name of await readdir(new URL(dir + '/', root), { withFileTypes: true })) {
      if (name.isFile()) onDisk.push(`${dir}/${name.name}`);
    }
  }
  for (const file of onDisk) assert.ok(listed.includes(file), `${file} fehlt in sw.js`);
});
