// Kurs: Lektionen, Lektionsseite, Wortlisten und Wörterbuch.

import { h, fold, toCyrillic } from '../util.js';
import { store } from '../store.js';
import { icon, audioButton, progressBar } from '../ui.js';
import { units, unitById, words, lessonById, dialogueById, GENDER } from '../content.js';
import { unitProgress, nextStep, startLearn, startPractice, isLearned, wordLevel } from '../learning.js';

const LEVEL = ['neu', 'lernend', 'gefestigt'];

export function notFound() {
  return { title: 'Nicht gefunden', tab: 'home', back: '#/', el: h('div', { class: 'page' }, h('p', { class: 'muted' }, 'Diese Seite gibt es nicht.')) };
}

export function course() {
  const next = nextStep();
  const el = h('div', { class: 'page' },
    h('p', { class: 'lead' }, 'Jede Lektion verbindet Wortschatz, ein Grammatikthema und einen Dialog. Die Reihenfolge ist empfohlen, aber nicht vorgeschrieben.'),
    h('div', { class: 'list' }, units.map((u, i) => {
      const p = unitProgress(u);
      return h('a', { class: 'unit-card' + (p.complete ? ' done' : '') + (next?.unit === u ? ' current' : ''), href: '#/kurs/' + u.id },
        h('span', { class: 'unit-icon' }, u.icon),
        h('span', { class: 'unit-body' },
          h('small', null, `Lektion ${i + 1}` + (next?.unit === u ? ' · hier geht es weiter' : '')),
          h('b', { lang: 'hr' }, u.hr),
          h('span', { class: 'muted' }, u.de),
          progressBar(p.fraction),
        ),
        p.complete ? h('span', { class: 'done-mark', 'aria-label': 'abgeschlossen' }, icon('check', 20)) : icon('chevron', 20),
      );
    })),
  );
  return { title: 'Kurs', tab: 'course', el };
}

function stepCard({ href, emoji, kicker, title, sub, done }) {
  return h('a', { class: 'step-card' + (done ? ' done' : ''), href },
    h('span', { class: 'emoji' }, emoji),
    h('span', { class: 'step-body' }, h('small', null, kicker), h('b', null, title), sub && h('span', { class: 'muted' }, sub)),
    done ? h('span', { class: 'done-mark', 'aria-label': 'erledigt' }, icon('check', 20)) : icon('chevron', 20),
  );
}

export function unit(id) {
  const u = unitById.get(id);
  if (!u) return notFound();
  const p = unitProgress(u);
  const open = p.words - p.learned;
  const chunk = Math.min(open, store.settings.newPerSession);
  const learned = u.items.filter(isLearned);

  const el = h('div', { class: 'page' },
    h('section', { class: 'unit-head' },
      h('span', { class: 'unit-icon big' }, u.icon),
      h('div', null, h('h2', { lang: 'hr' }, u.hr), h('p', { class: 'muted' }, u.de)),
    ),

    h('section', { class: 'card' },
      h('div', { class: 'row between' }, h('h3', null, 'Wortschatz'), h('span', { class: 'muted' }, `${p.learned} von ${p.words} gelernt`)),
      progressBar(p.learned / p.words),
      h('div', { class: 'stack' },
        open > 0
          ? h('button', { class: 'btn primary wide', onclick: () => startLearn(u) }, `${chunk} neue ${chunk === 1 ? 'Wort' : 'Wörter'} lernen`)
          : h('p', { class: 'ok-text' }, '✓ Alle Wörter dieser Lektion sind gelernt.'),
        learned.length >= 4 && h('button', { class: 'btn ghost wide', onclick: () => startPractice('mix', learned, u.hr) }, 'Gelernte Wörter üben'),
        h('a', { class: 'btn ghost wide', href: `#/kurs/${u.id}/woerter` }, 'Wortliste ansehen'),
      ),
    ),

    u.grammar.length > 0 && h('section', null,
      h('h3', { class: 'section-title' }, 'Grammatik'),
      h('div', { class: 'list' }, u.grammar.map((gid) => {
        const g = lessonById.get(gid);
        return stepCard({ href: '#/grammatik/' + g.id, emoji: '🧩', kicker: g.hr, title: g.title, sub: g.summary, done: store.isDone('g:' + g.id) });
      })),
    ),

    u.dialogue && h('section', null,
      h('h3', { class: 'section-title' }, 'Dialog'),
      (() => {
        const d = dialogueById.get(u.dialogue);
        return stepCard({ href: '#/audio/dialog/' + d.id, emoji: '🎧', kicker: 'Hören · Mitlesen · Nachsprechen', title: d.hr, sub: d.de, done: store.isDone('d:' + d.id) });
      })(),
    ),
  );
  return { title: `Lektion ${units.indexOf(u) + 1}`, tab: 'course', back: '#/kurs', el };
}

export function wordRow(w) {
  const level = wordLevel(w);
  return h('li', { class: 'word-item' },
    h('span', { class: 'lvl lvl-' + level, title: LEVEL[level], 'aria-label': LEVEL[level] }),
    h('div', { class: 'word-main' },
      h('div', null,
        h('b', { lang: 'hr' }, w.hr),
        w.g && h('span', { class: 'g', title: GENDER[w.g] }, w.g),
        store.settings.cyrillic && h('span', { class: 'cyr-inline', lang: 'sr' }, toCyrillic(w.hr)),
      ),
      h('span', { class: 'de' }, w.de),
      h('small', { lang: 'hr' }, w.ex),
      w.sr && h('small', { class: 'sr' }, 'Serbisch: ' + w.sr),
    ),
    audioButton(w.hr),
  );
}

const legend = () => h('p', { class: 'legend' },
  h('span', { class: 'lvl lvl-0' }), 'neu', h('span', { class: 'lvl lvl-1' }), 'lernend', h('span', { class: 'lvl lvl-2' }), 'gefestigt');

export function unitWords(id) {
  const u = unitById.get(id);
  if (!u) return notFound();
  const el = h('div', { class: 'page' },
    h('h2', { lang: 'hr' }, u.hr),
    legend(),
    h('ul', { class: 'word-list' }, u.items.map(wordRow)),
  );
  return { title: 'Wortliste', tab: 'course', back: '#/kurs/' + u.id, el };
}

export function dictionary() {
  const list = h('ul', { class: 'word-list' });
  const info = h('p', { class: 'muted small' });
  const input = h('input', {
    class: 'search', type: 'search', placeholder: 'Kroatisch oder Deutsch suchen …', 'aria-label': 'Wörterbuch durchsuchen',
    autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
  });

  function draw() {
    const q = fold(input.value);
    const hits = q
      ? words.filter((w) => fold(w.hr).includes(q) || fold(w.de).includes(q) || (w.sr && fold(w.sr).includes(q)))
      : words.filter(isLearned);
    const shown = hits.slice(0, 80);
    list.replaceChildren(...shown.map(wordRow));
    info.textContent = q
      ? `${hits.length} Treffer` + (hits.length > shown.length ? ` – die ersten ${shown.length} werden angezeigt` : '')
      : hits.length
        ? `Deine ${hits.length} gelernten Wörter` + (hits.length > shown.length ? ` – die ersten ${shown.length} werden angezeigt` : '')
        : `Tippe etwas ein, um in allen ${words.length} Wörtern des Kurses zu suchen.`;
  }
  input.addEventListener('input', draw);
  draw();

  const el = h('div', { class: 'page' }, h('div', { class: 'search-wrap' }, icon('search', 20), input), info, legend(), list);
  return { title: 'Wörterbuch', tab: 'more', back: '#/mehr', el, stateful: true };
}
