import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, fold, normalize, levenshtein, toCyrillic, dayNumber } from '../js/util.js';

test('normalize ignoriert Groß-/Kleinschreibung und Satzzeichen', () => {
  assert.equal(normalize('  Kako  si? '), 'kako si');
  assert.equal(normalize('Dobar dan, gospodine!'), 'dobar dan gospodine');
  assert.equal(normalize('„Ja sam“ – on'), 'ja sam on');
});

test('fold bildet Sonderzeichen auf einfache Buchstaben ab', () => {
  assert.equal(fold('čaj'), 'caj');
  assert.equal(fold('kuća'), 'kuca');
  assert.equal(fold('žena'), 'zena');
  assert.equal(fold('škola'), 'skola');
  assert.equal(fold('đak'), 'djak');
});

test('checkAnswer: genaue Treffer und Alternativen', () => {
  assert.deepEqual(checkAnswer('Hvala', ['hvala']), { ok: true, kind: 'exact' });
  assert.equal(checkAnswer('bog', ['bok', 'bog']).kind, 'exact');
  assert.equal(checkAnswer('   ', ['hvala']).kind, 'empty');
});

test('checkAnswer: fehlende Sonderzeichen zählen als fast richtig', () => {
  assert.equal(checkAnswer('caj', ['čaj']).kind, 'diacritics');
  assert.equal(checkAnswer('dovidjenja', ['doviđenja']).kind, 'diacritics');
  assert.equal(checkAnswer('kuca', ['kuća']).ok, true);
});

test('checkAnswer: kleine Tippfehler nur bei längeren Wörtern', () => {
  assert.equal(checkAnswer('prijatelj', ['prijatelj']).kind, 'exact');
  assert.equal(checkAnswer('prijatlj', ['prijatelj']).kind, 'typo');
  assert.equal(checkAnswer('pas', ['pes']).ok, false);
  assert.equal(checkAnswer('sok', ['sol']).ok, false);
  assert.equal(checkAnswer('mačka', ['pas']).ok, false);
});

test('checkAnswer: bei Grammatik zählt jeder Buchstabe', () => {
  assert.equal(checkAnswer('kava', ['kavu'], { strict: true }).ok, false);
  assert.equal(checkAnswer('Zagreba', ['Zagrebu'], { strict: true }).ok, false);
  assert.equal(checkAnswer('skoli', ['školi'], { strict: true }).kind, 'diacritics');
  assert.equal(checkAnswer('školi', ['školi'], { strict: true }).kind, 'exact');
});

test('levenshtein', () => {
  assert.equal(levenshtein('kava', 'kava'), 0);
  assert.equal(levenshtein('kava', 'kavu'), 1);
  assert.equal(levenshtein('', 'abc'), 3);
  assert.equal(levenshtein('mlijeko', 'mleko'), 2);
});

test('toCyrillic überträgt Buchstabe für Buchstabe, Digraphen als ein Zeichen', () => {
  assert.equal(toCyrillic('hvala'), 'хвала');
  assert.equal(toCyrillic('Dobar dan'), 'Добар дан');
  assert.equal(toCyrillic('ljubav'), 'љубав');
  assert.equal(toCyrillic('Njemačka'), 'Њемачка');
  assert.equal(toCyrillic('džep'), 'џеп');
  assert.equal(toCyrillic('kuća, žena, škola, đak'), 'кућа, жена, школа, ђак');
});

test('der Lerntag wechselt um 4 Uhr morgens', () => {
  const evening = dayNumber(new Date(2026, 4, 10, 23, 30));
  const night = dayNumber(new Date(2026, 4, 11, 3, 30));
  const morning = dayNumber(new Date(2026, 4, 11, 4, 30));
  assert.equal(night, evening);
  assert.equal(morning, evening + 1);
});
