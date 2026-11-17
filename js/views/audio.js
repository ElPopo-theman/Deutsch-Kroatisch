// Audio: Dialoge zum Hören und Nachsprechen sowie der freihändige Audio-Trainer.

import { h, shuffle, sleep } from '../util.js';
import { store } from '../store.js';
import { speak, stopSpeaking, speechMode, canSpeak, keepAwake } from '../speech.js';
import { icon, toast } from '../ui.js';
import { dialogues, dialogueById, units, unitById } from '../content.js';
import { startQuiz, startShadowing, startPractice, learnedWords, isLearned } from '../learning.js';
import { notFound } from './course.js';

function voiceNotice() {
  const mode = speechMode('hr');
  if (mode === 'voice') return null;
  return h('a', { class: 'notice', href: '#/einstellungen' },
    mode === 'none'
      ? [h('b', null, 'Keine kroatische Stimme gefunden.'), ' Tippe hier für die Einrichtung.']
      : [h('b', null, 'Kein Ton?'), ' Hier findest du einen Ton-Test und Hilfe.']);
}

export function audio() {
  const el = h('div', { class: 'page' },
    voiceNotice(),
    h('div', { class: 'grid-2' },
      h('a', { class: 'practice-card', href: '#/audio/trainer' },
        h('span', { class: 'emoji' }, '🎧'), h('b', null, 'Audio-Trainer'), h('small', null, 'Freihändig: hören, Pause zum Sprechen, Auflösung. Ideal für unterwegs.')),
      h('button', {
        class: 'practice-card',
        onclick: () => startPractice('listen') || toast(canSpeak('hr') ? 'Lerne zuerst ein paar Wörter im Kurs.' : 'Dafür fehlt eine kroatische Stimme.'),
      }, h('span', { class: 'emoji' }, '👂'), h('b', null, 'Hörtraining'), h('small', null, 'Gelernte Wörter und Sätze nur über das Ohr erkennen.')),
      h('a', { class: 'practice-card', href: '#/grammatik/g01' },
        h('span', { class: 'emoji' }, '🔤'), h('b', null, 'Aussprache'), h('small', null, 'Alle Laute mit Beispielen zum Antippen.')),
    ),

    h('h3', { class: 'section-title' }, 'Dialoge'),
    h('p', { class: 'muted' }, 'Erst hören, dann mitlesen, dann nachsprechen – so wird aus Text echtes Hörverstehen.'),
    h('div', { class: 'list' }, dialogues.map((d, i) =>
      h('a', { class: 'step-card' + (store.isDone('d:' + d.id) ? ' done' : ''), href: '#/audio/dialog/' + d.id },
        h('span', { class: 'num' }, i + 1),
        h('span', { class: 'step-body' }, h('b', { lang: 'hr' }, d.hr), h('span', { class: 'muted' }, d.de)),
        h('span', { class: 'chip' }, d.level),
        store.isDone('d:' + d.id) ? h('span', { class: 'done-mark', 'aria-label': 'erledigt' }, icon('check', 20)) : icon('chevron', 20),
      ))),
    h('p', { class: 'muted small center' }, h('a', { href: '#/einstellungen' }, 'Kein Ton? Zum Ton-Test')),
  );
  return { title: 'Audio', tab: 'audio', el };
}

// ---------- Dialog ----------
export function dialogue(id) {
  const d = dialogueById.get(id);
  if (!d) return notFound();

  const speakers = [...new Set(d.lines.map((l) => l[0]))];
  const pitchOf = (name) => (speakers.indexOf(name) % 2 === 0 ? 1 : 0.82);
  let run = 0;          // erhöht sich bei jedem Start/Stopp – so beenden sich alte Abspielschleifen selbst
  let playing = false;
  let slow = false;
  let show = 'none';    // none | hr | both

  const rows = d.lines.map(([who, hr, de], i) =>
    h('li', { class: 'line s' + (speakers.indexOf(who) % 2), onclick: () => playFrom(i, true) },
      h('span', { class: 'who' }, who),
      h('p', { class: 'hr', lang: 'hr' }, hr),
      h('p', { class: 'de' }, de),
    ));
  const list = h('ol', { class: 'lines show-none' }, rows);

  const playBtn = h('button', { class: 'btn primary play', onclick: () => (playing ? stop() : playFrom(0)) });
  const slowBtn = h('button', { class: 'btn ghost', 'aria-pressed': 'false', onclick: () => { slow = !slow; slowBtn.setAttribute('aria-pressed', slow); slowBtn.classList.toggle('on', slow); } }, '🐢 Langsam');

  function drawPlay() {
    playBtn.replaceChildren(icon(playing ? 'pause' : 'play', 20), h('span', null, playing ? 'Pause' : 'Abspielen'));
  }
  function mark(i) {
    rows.forEach((r, j) => r.classList.toggle('now', i === j));
    if (i >= 0) rows[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  async function playFrom(start, single = false) {
    if (!canSpeak('hr')) return toast('Auf diesem Gerät fehlt eine kroatische Stimme.');
    const mine = ++run;
    stopSpeaking();
    playing = !single;
    drawPlay();
    for (let i = start; i < d.lines.length; i++) {
      mark(i);
      await speak(d.lines[i][1], { slow, pitch: pitchOf(d.lines[i][0]) });
      if (mine !== run) return;
      if (single) break;
      await sleep(350);
      if (mine !== run) return;
    }
    playing = false;
    mark(-1);
    drawPlay();
  }
  function stop() {
    run++;
    playing = false;
    stopSpeaking();
    mark(-1);
    drawPlay();
  }
  drawPlay();

  const modes = [['none', 'Nur hören'], ['hr', 'Kroatisch'], ['both', 'Mit Übersetzung']];
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Textanzeige' }, modes.map(([key, label]) =>
    h('button', { class: key === show ? 'on' : '', onclick: (e) => {
      show = key;
      list.className = 'lines show-' + key;
      [...seg.children].forEach((b) => b.classList.toggle('on', b === e.currentTarget));
    } }, label)));

  const el = h('div', { class: 'page dialogue' },
    h('section', { class: 'unit-head' },
      h('span', { class: 'unit-icon big' }, '🎧'),
      h('div', null, h('h2', { lang: 'hr' }, d.hr), h('p', { class: 'muted' }, `${d.de} · Niveau ${d.level}`)),
    ),
    voiceNotice(),
    h('ol', { class: 'steps compact' },
      h('li', null, h('b', null, 'Hören '), 'ohne Text – worum geht es?'),
      h('li', null, h('b', null, 'Mitlesen '), 'und unbekannte Stellen klären.'),
      h('li', null, h('b', null, 'Nachsprechen '), 'Satz für Satz.'),
      h('li', null, h('b', null, 'Verstehen '), 'mit drei kurzen Fragen prüfen.'),
    ),
    h('div', { class: 'player' }, playBtn, slowBtn),
    seg,
    list,
    h('div', { class: 'stack' },
      h('button', { class: 'btn ghost wide', onclick: () => { stop(); startShadowing(d); } }, '🎙 Nachsprechen üben'),
      h('button', { class: 'btn primary wide', onclick: () => { stop(); startQuiz(d); } }, store.isDone('d:' + d.id) ? 'Verständnisfragen wiederholen' : 'Verständnisfragen beantworten'),
    ),
  );
  return { title: 'Dialog', tab: 'audio', back: '#/audio', el, cleanup: stop, stateful: true };
}

// ---------- Audio-Trainer ----------
export function trainer() {
  const learned = learnedWords();
  let source = learned.length >= 5 ? 'learned' : units[0].id;
  let content = 'words';     // words | sentences
  let direction = 'recall';  // recall: Deutsch → Pause → Kroatisch · repeat: Kroatisch → Pause → Kroatisch → Deutsch
  let pause = 1.5;
  let items = [];
  let index = 0;
  let run = 0;
  let playing = false;

  const hrEl = h('p', { class: 'now-hr', lang: 'hr' }, '…');
  const deEl = h('p', { class: 'now-de' }, 'Wähle unten aus, was du hören möchtest, und tippe auf Start.');
  const counter = h('span', { class: 'muted small' });
  const phase = h('span', { class: 'phase' });
  const playBtn = h('button', { class: 'round-btn', 'aria-label': 'Start', onclick: () => (playing ? stop() : start()) });
  const drawPlay = () => playBtn.replaceChildren(icon(playing ? 'pause' : 'play', 34));

  function buildItems() {
    const pool = source === 'learned' ? learned : unitById.get(source).items;
    items = shuffle(pool).slice(0, 30).map((w) => (content === 'words' ? { hr: w.hr, de: w.de } : { hr: w.ex, de: w.exDe }));
    index = 0;
  }
  const gap = (text, factor = 1) => sleep((1100 + text.length * 110) * pause * factor);

  async function start() {
    if (!canSpeak('hr')) return toast('Auf diesem Gerät fehlt eine kroatische Stimme.');
    if (!items.length || index >= items.length) buildItems();
    if (!items.length) return toast('Hier gibt es noch nichts zu hören.');
    const mine = ++run;
    const alive = () => mine === run;
    const germanVoice = canSpeak('de');
    playing = true;
    drawPlay();
    keepAwake(true);

    for (; index < items.length; index++) {
      const it = items[index];
      counter.textContent = `${index + 1} / ${items.length}`;
      if (direction === 'recall') {
        hrEl.textContent = '?';
        deEl.textContent = it.de;
        phase.textContent = 'Wie heißt das auf Kroatisch? Sprich es laut aus.';
        if (germanVoice) await speak(it.de, { lang: 'de' });
        if (!alive()) return;
        await gap(it.hr);
        if (!alive()) return;
        hrEl.textContent = it.hr;
        phase.textContent = 'Auflösung – sprich noch einmal mit.';
        await speak(it.hr);
        if (!alive()) return;
        await gap(it.hr, 0.6);
        if (!alive()) return;
        await speak(it.hr, { slow: true });
      } else {
        hrEl.textContent = it.hr;
        deEl.textContent = '';
        phase.textContent = 'Hör zu …';
        await speak(it.hr);
        if (!alive()) return;
        phase.textContent = 'Sprich nach.';
        await gap(it.hr);
        if (!alive()) return;
        await speak(it.hr);
        if (!alive()) return;
        deEl.textContent = it.de;
        phase.textContent = 'Bedeutung';
        if (germanVoice) await speak(it.de, { lang: 'de' });
        else await sleep(1200);
      }
      if (!alive()) return;
      await sleep(700);
      if (!alive()) return;
    }
    playing = false;
    phase.textContent = 'Fertig! Tippe auf Start für eine neue Runde.';
    drawPlay();
    keepAwake(false);
  }

  function stop() {
    run++;
    playing = false;
    stopSpeaking();
    keepAwake(false);
    phase.textContent = 'Pausiert';
    drawPlay();
  }
  function jump(step) {
    const wasPlaying = playing;
    stop();
    index = Math.max(0, Math.min(items.length - 1, index + step));
    if (wasPlaying) start();
  }
  function changed() {
    stop();
    items = [];
    phase.textContent = '';
    hrEl.textContent = '…';
    deEl.textContent = 'Tippe auf Start.';
    counter.textContent = '';
  }
  drawPlay();

  const select = (label, value, options, onchange) =>
    h('label', { class: 'field' }, h('span', null, label),
      h('select', { onchange: (e) => { onchange(e.target.value); changed(); } },
        options.map(([v, text, disabled]) => h('option', { value: v, selected: v === value, disabled }, text))));

  const el = h('div', { class: 'page trainer' },
    voiceNotice(),
    h('section', { class: 'now card' }, counter, hrEl, deEl, phase),
    h('div', { class: 'transport' },
      h('button', { class: 'icon-btn', 'aria-label': 'Zurück', onclick: () => jump(-1) }, icon('prev', 26)),
      playBtn,
      h('button', { class: 'icon-btn', 'aria-label': 'Weiter', onclick: () => jump(1) }, icon('next', 26)),
    ),
    h('section', { class: 'card fields' },
      select('Was', source, [
        ['learned', `Meine gelernten Wörter (${learned.length})`, learned.length === 0],
        ...units.map((u, i) => [u.id, `Lektion ${i + 1}: ${u.hr}` + (u.items.some(isLearned) ? '' : ' – neu')]),
      ], (v) => { source = v; }),
      select('Inhalt', content, [['words', 'Einzelne Wörter'], ['sentences', 'Ganze Sätze']], (v) => { content = v; }),
      select('Ablauf', direction, [
        ['recall', 'Abrufen (Deutsch zuerst)'],
        ['repeat', 'Nachsprechen (Kroatisch zuerst)'],
      ], (v) => { direction = v; }),
      select('Pausen', String(pause), [['1', 'kurz'], ['1.5', 'mittel'], ['2.2', 'lang']], (v) => { pause = Number(v); }),
    ),
    h('p', { class: 'muted small' }, 'Der Bildschirm bleibt während des Trainings an. Sprich in den Pausen laut – erst das eigene Abrufen macht das Zuhören wirksam.'),
  );
  return { title: 'Audio-Trainer', tab: 'audio', back: '#/audio', el, cleanup: stop, stateful: true };
}
