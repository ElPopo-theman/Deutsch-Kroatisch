// Üben: fällige Wiederholungen und gezielte Trainingsformen.

import { h } from '../util.js';
import { store } from '../store.js';
import { canSpeak } from '../speech.js';
import { icon, toast } from '../ui.js';
import { grammarItemById } from '../content.js';
import { dueCount, learnedWords, startReview, startPractice, PRACTICE, forecast } from '../learning.js';

export function practice() {
  const due = dueCount();
  const learned = learnedWords().length;
  const grammarCards = [...grammarItemById.keys()].filter((id) => store.card(id)).length;
  const tomorrow = forecast(2)[1].n;

  function available(p) {
    if (p.needsAudio && !canSpeak('hr')) return 'Dafür fehlt auf diesem Gerät eine kroatische Stimme.';
    if (p.id === 'grammar') return grammarCards >= 4 ? '' : 'Bearbeite zuerst eine Grammatiklektion.';
    return learned >= 4 ? '' : 'Lerne zuerst ein paar Wörter im Kurs.';
  }

  const el = h('div', { class: 'page' },
    due > 0
      ? h('button', { class: 'cta review', onclick: startReview },
          h('span', { class: 'cta-icon' }, icon('practice', 26)),
          h('span', { class: 'cta-text' }, h('b', null, 'Wiederholung starten'), h('small', null, `${due} ${due === 1 ? 'Karte ist' : 'Karten sind'} heute fällig`)),
          icon('chevron', 20),
        )
      : h('section', { class: 'card' },
          h('h3', null, learned ? 'Heute ist nichts mehr fällig ✓' : 'Noch keine Wiederholungen'),
          h('p', { class: 'muted' }, learned
            ? (tomorrow ? `Morgen warten ${tomorrow} ${tomorrow === 1 ? 'Karte' : 'Karten'} auf dich. ` : '') + 'Wenn du magst, kannst du unten frei weiterüben.'
            : 'Sobald du im Kurs die ersten Wörter gelernt hast, plant die App hier deine Wiederholungen.'),
          !learned && h('a', { class: 'btn primary', href: '#/kurs' }, 'Zum Kurs'),
        ),

    h('h3', { class: 'section-title' }, 'Gezielt trainieren'),
    h('div', { class: 'grid-2' }, PRACTICE.map((p) => {
      const blocked = available(p);
      return h('button', {
        class: 'practice-card' + (blocked ? ' blocked' : ''),
        'aria-disabled': blocked ? 'true' : null,
        onclick: () => (blocked ? toast(blocked) : startPractice(p.id)),
      },
        h('span', { class: 'emoji' }, p.icon),
        h('b', null, p.title),
        h('small', null, blocked || p.text),
      );
    })),

    h('section', { class: 'card soft' },
      h('h3', null, 'Wie wird geplant?'),
      h('p', { class: 'muted' }, 'Für jedes Wort schätzt die App, wie fest es im Gedächtnis sitzt, und legt es dir wieder vor, kurz bevor du es vergessen würdest. Richtige Antworten verlängern den Abstand – von Tagen auf Wochen und Monate. Zu Beginn wählst du aus Antworten aus, später schreibst du selbst.'),
      h('a', { href: '#/methode' }, 'Mehr zur Lernmethode'),
    ),
  );
  return { title: 'Üben', tab: 'practice', el };
}
