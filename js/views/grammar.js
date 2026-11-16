// Grammatik: Übersicht aller Lektionen und die einzelne Lektion mit Erklärung und Übungen.

import { h } from '../util.js';
import { store } from '../store.js';
import { speak, canSpeak } from '../speech.js';
import { icon } from '../ui.js';
import { lessons, lessonById, units } from '../content.js';
import { startGrammar } from '../learning.js';
import { notFound } from './course.js';

export function grammarList() {
  const el = h('div', { class: 'page' },
    h('p', { class: 'lead' }, 'Kurze Erklärungen, sofort geübt. Die Aufgaben jeder Lektion wandern danach automatisch in deine Wiederholungen.'),
    h('div', { class: 'list' }, lessons.map((g, i) => {
      const done = store.isDone('g:' + g.id);
      return h('a', { class: 'step-card' + (done ? ' done' : ''), href: '#/grammatik/' + g.id },
        h('span', { class: 'num' }, i + 1),
        h('span', { class: 'step-body' },
          h('small', null, g.group),
          h('b', null, g.title),
          h('span', { class: 'muted' }, g.summary),
        ),
        done ? h('span', { class: 'done-mark', 'aria-label': 'bearbeitet' }, icon('check', 20)) : icon('chevron', 20),
      );
    })),
  );
  return { title: 'Grammatik', tab: 'grammar', el };
}

export function grammarLesson(id) {
  const g = lessonById.get(id);
  if (!g) return notFound();
  const done = store.isDone('g:' + g.id);
  const unit = units.find((u) => u.grammar.includes(g.id));
  const nextLesson = lessons[lessons.indexOf(g) + 1];

  const content = h('article', { class: 'prose', html: g.html });
  // Kroatische Beispiele lassen sich antippen und werden vorgelesen.
  const speakable = canSpeak('hr');
  content.querySelectorAll('.say').forEach((node) => {
    node.lang = 'hr';
    if (!speakable) return;
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    const play = () => speak(node.textContent);
    node.addEventListener('click', play);
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  });

  const el = h('div', { class: 'page lesson' },
    h('header', { class: 'lesson-head' },
      h('small', null, g.group + (unit ? ` · Lektion ${units.indexOf(unit) + 1}` : '')),
      h('h2', null, g.title),
      h('p', { class: 'muted', lang: 'hr' }, g.hr),
    ),
    speakable && h('p', { class: 'hint-line' }, icon('speaker', 16), ' Unterstrichene Beispiele kannst du antippen und anhören.'),
    content,
    h('section', { class: 'card practice-box' },
      h('h3', null, done ? 'Übungen wiederholen' : 'Jetzt anwenden'),
      h('p', { class: 'muted' }, `${g.items.length} Aufgaben – erst zur Auswahl, bei späteren Wiederholungen zum Selbst-Schreiben.`),
      h('button', { class: 'btn primary wide', onclick: () => startGrammar(g) }, done ? 'Übungen noch einmal starten' : 'Übungen starten'),
      done && h('p', { class: 'ok-text' }, '✓ Bearbeitet. Die Aufgaben tauchen in deinen Wiederholungen wieder auf.'),
    ),
    nextLesson && h('a', { class: 'next-link', href: '#/grammatik/' + nextLesson.id }, h('span', null, 'Nächstes Thema'), h('b', null, nextLesson.title), icon('chevron', 18)),
  );
  return { title: 'Grammatik', tab: 'grammar', back: '#/grammatik', el };
}
