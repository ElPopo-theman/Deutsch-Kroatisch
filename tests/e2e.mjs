// Durchlauf im echten Browser: lernt eine Einheit, bearbeitet Grammatik, Dialog und Wiederholung
// und macht dabei Bildschirmfotos. Aufruf: npm run e2e  (benötigt Playwright mit Chromium)
//
// Die Sprachausgabe wird durch eine stumme Attrappe ersetzt, die protokolliert, was gesprochen würde.

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const { chromium } = createRequire(import.meta.url)('playwright');
const PORT = 8137;
const BASE = `http://localhost:${PORT}/`;
const OUT = process.env.SHOTS || '.screenshots';

/** Ersetzt die Sprachausgabe des Browsers. voices: Liste der Stimmen, die er „auflistet“. */
const fakeSpeech = (voices) => {
  window.__spoken = [];
  window.__utterances = [];
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices: () => voices,
    speak(u) {
      if (u.text.trim()) {
        window.__spoken.push(u.text);
        window.__utterances.push({ text: u.text, lang: u.lang, voice: u.voice ? u.voice.name : null });
      }
      this.speaking = true;
      u.onstart?.();
      setTimeout(() => { this.speaking = false; u.onend?.(); }, 20);
    },
    cancel() { this.speaking = false; },
    resume() {},
    addEventListener() {},
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
};

const WITH_CROATIAN = [
  { name: 'Lana', lang: 'hr-HR', voiceURI: 'lana' },
  { name: 'Anna', lang: 'de-DE', voiceURI: 'anna' },
];
const WITHOUT_CROATIAN = [
  { name: 'Anna', lang: 'de-DE', voiceURI: 'anna' },
  { name: 'Samantha', lang: 'en-US', voiceURI: 'samantha' },
];
const IPHONE_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

/** Löst die gerade angezeigte Aufgabe; mit wrong = true absichtlich falsch. */
async function solve(page, { wrong = false } = {}) {
  // Höraufgaben: abwarten, bis der neue Text gesprochen ist (nach einem Abbruch startet er leicht verzögert).
  if (await page.locator('.s-body .prompt .listen').count() && !(await page.locator('.s-foot.fb').count())) await page.waitForTimeout(260);
  return page.evaluate(async (answerWrong) => {
    const { words, grammarItemById, dialogues } = await import('/js/content.js');
    const norm = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    const $ = (sel) => document.querySelector(sel);
    const foot = () => $('.s-foot .btn.primary');
    if ($('.summary')) return 'summary';
    if ($('.s-foot.fb')) { foot().click(); return 'continue'; }
    if ($('.ex.intro') || $('.ex.speak')) { foot().click(); return 'intro'; }

    const instruction = norm($('.instruction').textContent);
    const prompt = $('.prompt-text') ? norm($('.prompt-text').textContent) : '';
    const sub = $('.prompt-sub') ? norm($('.prompt-sub').textContent) : '';
    const heard = window.__spoken.at(-1);
    const grammar = [...grammarItemById.values()];
    let answers = [];

    if (instruction === 'Was bedeutet das?') answers = words.filter((w) => w.hr === prompt).map((w) => w.de);
    else if (instruction === 'Was hörst du?') answers = words.filter((w) => w.hr === heard).map((w) => w.de);
    else if (instruction === 'Wie heißt das auf Kroatisch?' || instruction === 'Schreibe auf Kroatisch') {
      answers = [...words.filter((w) => w.de === prompt).map((w) => w.hr), ...grammar.filter((g) => g.de === prompt && g.t === 'd').map((g) => g.hr)];
    } else if (instruction === 'Schreibe, was du hörst') answers = [heard];
    else if (instruction === 'Bilde den Satz') answers = words.filter((w) => w.exDe === prompt).map((w) => w.ex);
    else if (instruction === 'Was passt in die Lücke?' || instruction === 'Ergänze die Lücke') {
      answers = grammar.filter((g) => g.t === 'c' && g.de === sub && norm(g.q.replace('___', ' ')) === prompt).map((g) => g.a);
    } else if (instruction === 'Wähle die richtige Antwort') answers = grammar.filter((g) => g.t === 'm' && g.q === prompt).map((g) => g.o[0]);
    else if (instruction === 'Hast du es verstanden?') answers = dialogues.flatMap((d) => d.quiz).filter(([q]) => q === prompt).map(([, o]) => o[0]);
    if (!answers.length) throw new Error(`Keine Lösung für „${instruction}“ / „${prompt}“ / „${sub}“`);

    const options = [...document.querySelectorAll('.opt')];
    if (options.length) {
      const label = (b) => norm(b.querySelector('span').textContent);
      const target = options.find((b) => answers.includes(label(b)) !== answerWrong);
      target.click();
      return 'mc';
    }
    const input = $('.answer');
    if (input) {
      input.value = answerWrong ? 'xyz' : answers[0];
      input.dispatchEvent(new Event('input'));
      foot().click();
      return 'type';
    }
    const tokens = answers[0].split(/\s+/).map((t) => t.replace(/^[„"(]+|[.,!?:;“")]+$/g, '')).filter(Boolean);
    if (answerWrong) tokens.reverse();
    for (const token of tokens) [...document.querySelectorAll('.build-bank .tile')].find((t) => t.textContent === token).click();
    foot().click();
    return 'build';
  }, wrong);
}

async function finishSession(page, { firstWrong = false } = {}) {
  const kinds = new Set();
  let wrongDone = !firstWrong;
  for (let i = 0; i < 400; i++) {
    const graded = await page.evaluate(() => !document.querySelector('.s-foot.fb, .ex.intro, .ex.speak, .summary'));
    const kind = await solve(page, { wrong: graded && !wrongDone });
    if (graded && !wrongDone) {
      wrongDone = true;
      assert.ok(await page.locator('.s-foot.fb.bad').count(), 'falsche Antwort wird als falsch gemeldet');
    }
    if (kind === 'summary') return kinds;
    kinds.add(kind);
  }
  throw new Error('Sitzung endet nicht');
}

async function run(name, contextOptions) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ locale: 'de-DE', ...contextOptions });
  await context.addInitScript(fakeSpeech, WITH_CROATIAN);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = (label) => page.screenshot({ path: `${OUT}/${name}-${label}.png` });
  const go = async (hash) => { await page.goto(BASE + hash); await page.waitForSelector('#view > *'); };

  // Start
  await go('');
  await shot('01-start');
  assert.match(await page.locator('.cta.learn').innerText(), /Lektion 1/);

  // Neue Wörter lernen – die erste Aufgabe absichtlich falsch
  await page.locator('.cta.learn').click();
  await page.waitForSelector('.ex.intro');
  await shot('02-neues-wort');
  await solve(page);
  await page.waitForSelector('.opts');
  await shot('03-auswahl');
  const kinds = await finishSession(page, { firstWrong: true });
  for (const k of ['mc', 'type', 'build']) assert.ok(kinds.has(k), `Aufgabentyp ${k} kam nicht vor`);
  await shot('04-geschafft');
  await page.locator('.s-foot .btn.primary').click();
  await page.waitForSelector('#session', { state: 'hidden' });
  const learned = await page.evaluate(async () => Object.keys((await import('/js/store.js')).store.cards).length);
  assert.equal(learned, 6, 'sechs neue Wörter sind als Karten angelegt');
  await shot('05-start-danach');

  // Tippen: Aufgabe mit Tastatur zeigen
  await go('#/ueben');
  await shot('06-ueben');
  await page.locator('.practice-card', { hasText: 'Schreibtraining' }).click();
  await page.waitForSelector('.answer');
  await page.locator('.answer').fill('dob');
  await shot('07-schreiben');
  await finishSession(page);
  await page.locator('.s-foot .btn.primary').click();

  // Kurs und Lektion
  await go('#/kurs');
  await shot('08-kurs');
  await go('#/kurs/u01');
  await shot('09-lektion');
  await go('#/kurs/u01/woerter');
  assert.equal(await page.locator('.word-item').count(), 25);

  // Grammatik
  await go('#/grammatik');
  assert.equal(await page.locator('.step-card').count(), 22);
  await go('#/grammatik/g05');
  await shot('10-grammatik');
  await page.locator('.say').first().click();
  assert.ok((await page.evaluate(() => window.__spoken.at(-1))).length > 2, 'Beispiel wird vorgelesen');
  await page.locator('.practice-box .btn').click();
  await page.waitForSelector('.prompt-text.cloze');
  await shot('11-luecke');
  await finishSession(page);
  await page.locator('.s-foot .btn.primary').click();
  await page.waitForSelector('.practice-box .ok-text');

  // Dialog
  await go('#/audio');
  await shot('12-audio');
  await go('#/audio/dialog/d05');
  await page.locator('.seg button', { hasText: 'Mit Übersetzung' }).click();
  await shot('13-dialog');
  await page.locator('.player .play').click();
  await page.waitForFunction(() => window.__spoken.includes('Odmah stiže.'), null, { timeout: 15000 });
  await page.locator('.btn', { hasText: 'Verständnisfragen' }).click();
  await finishSession(page);
  await page.locator('.s-foot .btn.primary').click();
  await page.locator('.btn', { hasText: 'Nachsprechen' }).click();
  await page.waitForSelector('.ex.speak');
  await shot('14-nachsprechen');
  await finishSession(page);
  await page.locator('.s-foot .btn.primary').click();

  // Audio-Trainer
  await go('#/audio/trainer');
  await page.locator('.round-btn').click();
  await page.waitForFunction(() => document.querySelector('.now-hr').textContent.length > 1 && document.querySelector('.now-hr').textContent !== '?', null, { timeout: 15000 });
  await shot('15-trainer');
  await page.locator('.round-btn').click();

  // Wiederholung: alle Karten künstlich fällig stellen
  await page.evaluate(async () => {
    const { store } = await import('/js/store.js');
    for (const c of Object.values(store.cards)) { c.due -= 30; c.last -= 30; }
    store.set('goal', store.settings.goal); // speichert den geänderten Stand
  });
  await go('');
  assert.ok(await page.locator('.cta.review').count(), 'fällige Karten werden angeboten');
  await shot('16-faellig');
  await page.locator('.cta.review').click();
  await finishSession(page);
  await page.locator('.s-foot .btn.primary').click();

  // Übrige Seiten
  for (const [hash, label] of [['#/statistik', '17-statistik'], ['#/einstellungen', '18-einstellungen'], ['#/methode', '19-methode'], ['#/woerterbuch', '20-woerterbuch'], ['#/mehr', '21-mehr']]) {
    await go(hash);
    await shot(label);
  }
  await go('#/woerterbuch');
  await page.locator('.search').fill('kava');
  assert.ok(await page.locator('.word-item').count() >= 1);

  // Dunkles Schema
  await go('#/einstellungen');
  await page.locator('.seg button', { hasText: 'Dunkel' }).click();
  await go('');
  await shot('22-dunkel');

  // Offline: Nach dem ersten Besuch muss die App ohne Netz starten.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(async () => (await caches.keys()).length > 0 && (await (await caches.open((await caches.keys())[0])).keys()).length > 20);
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('.hero');
  await page.locator('.tab', { hasText: 'Grammatik' }).click();
  await page.waitForFunction(() => document.querySelectorAll('.step-card').length === 22); // Grammatik ist offline verfügbar
  await context.setOffline(false);

  assert.deepEqual(errors, [], 'keine Fehler in der Konsole');
  await browser.close();
  console.log(`✓ ${name}`);
}

/**
 * Der Browser listet keine kroatische Stimme auf – so verhält sich Safari auf dem iPhone, wenn die Stimme
 * nachgeladen wurde. Auf dem iPhone muss die App trotzdem sprechen (nur über die Sprachangabe),
 * am Computer erst nach „Trotzdem versuchen“.
 */
async function withoutListedVoice() {
  const browser = await chromium.launch();

  // iPhone
  let context = await browser.newContext({ locale: 'de-DE', userAgent: IPHONE_AGENT, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await context.addInitScript(fakeSpeech, WITHOUT_CROATIAN);
  let page = await context.newPage();
  await page.goto(BASE);
  await page.waitForSelector('.hero');
  assert.equal(await page.locator('.notice').count(), 0, 'iPhone: kein Hinweis „keine Stimme“');
  await page.locator('.cta.learn').click();
  await page.waitForSelector('.ex.intro');
  let said = await page.evaluate(() => window.__utterances.at(-1));
  assert.deepEqual(said, { text: 'bok', lang: 'hr-HR', voice: null }, 'iPhone: spricht über die Sprachangabe');
  await page.locator('.s-head .icon-btn').click();
  await page.goto(BASE + '#/einstellungen');
  await page.waitForSelector('#audio');
  await page.locator('#audio .btn.primary').click();
  await page.waitForSelector('.test-result.ok, .test-result.bad');
  await page.locator('.diag summary').click();
  const diagnosis = await page.locator('.diag-text').innerText();
  assert.match(diagnosis, /Weg: lang/);
  assert.match(diagnosis, /Letzter Test: beendet, gestartet: ja/);
  assert.equal(await page.locator('#audio .help ol li').count(), 4, 'iPhone: Hilfe bei fehlendem Ton');
  await page.screenshot({ path: `${OUT}/iphone-23-ton-test.png`, fullPage: true });
  await context.close();

  // Computer
  context = await browser.newContext({ locale: 'de-DE', viewport: { width: 1280, height: 860 } });
  await context.addInitScript(fakeSpeech, WITHOUT_CROATIAN);
  page = await context.newPage();
  await page.goto(BASE);
  await page.waitForSelector('.hero');
  assert.equal(await page.locator('.notice').count(), 1, 'Computer: Hinweis auf die fehlende Stimme');
  await page.goto(BASE + '#/einstellungen');
  await page.locator('.btn', { hasText: 'Trotzdem versuchen' }).click();
  await page.locator('#audio .btn.primary').click();
  await page.waitForFunction(() => window.__utterances.length > 0);
  said = await page.evaluate(() => window.__utterances.at(-1));
  assert.equal(said.lang, 'hr-HR');
  assert.equal(said.voice, null);
  await browser.close();
  console.log('✓ ohne gelistete Stimme');
}

/** Tippt man weiter, während noch gesprochen wird, darf die neue Ausgabe nicht verloren gehen. */
async function interruptedSpeech() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ locale: 'de-DE', viewport: { width: 390, height: 844 } });
  await context.addInitScript(fakeSpeech, WITH_CROATIAN);
  const page = await context.newPage();
  await page.goto(BASE + '#/grammatik/g05');
  await page.waitForSelector('.say');
  await page.evaluate(() => {
    // Diese Attrappe spricht lange und verschluckt – wie Safari – alles, was direkt nach einem Abbruch kommt.
    const synth = window.speechSynthesis;
    let cancelled = 0;
    synth.speak = function (u) {
      if (Date.now() - cancelled < 100) return;
      window.__spoken.push(u.text);
      this.speaking = true;
      u.onstart?.();
    };
    synth.cancel = function () { if (this.speaking) cancelled = Date.now(); this.speaking = false; };
  });
  const examples = page.locator('.exl .say');
  await examples.nth(0).click();
  await examples.nth(1).click();
  await page.waitForFunction(() => window.__spoken.length === 2, null, { timeout: 3000 });
  assert.deepEqual(await page.evaluate(() => window.__spoken), ['Pijem kavu.', 'Imam brata i sestru.']);
  await browser.close();
  console.log('✓ Unterbrechen und neu sprechen');
}

await mkdir(OUT, { recursive: true });
const server = spawn(process.execPath, ['tools/serve.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
try {
  await run('iphone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await run('desktop', { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 });
  await withoutListedVoice();
  await interruptedSpeech();
} finally {
  server.kill();
}
