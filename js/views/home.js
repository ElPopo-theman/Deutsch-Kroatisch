// Startseite „Heute“: Was ist fällig, wie geht es weiter, wie läuft es?

import { h, dayNumber, formatDay } from '../util.js';
import { store } from '../store.js';
import { speak, speechStatus } from '../speech.js';
import { icon, ring, audioButton } from '../ui.js';
import { summaryStats, nextStep, describeStep, startLearn, startReview } from '../learning.js';
import { TIPS } from '../data/dialogues.js';

export function runStep(step) {
  if (step.type === 'words') startLearn(step.unit);
  else if (step.type === 'grammar') location.hash = '#/grammatik/' + step.lesson.id;
  else location.hash = '#/audio/dialog/' + step.dialogue.id;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return ['Dobro jutro!', 'Guten Morgen!'];
  if (hour >= 11 && hour < 18) return ['Dobar dan!', 'Guten Tag!'];
  return ['Dobra večer!', 'Guten Abend!'];
}

export function home() {
  const s = summaryStats();
  const step = nextStep();
  const d = describeStep(step);
  const today = store.today();
  const goal = store.settings.goal;
  const [hello, helloDe] = greeting();
  const isNew = s.learned === 0 && today.n === 0;

  const el = h('div', { class: 'page home' },
    h('section', { class: 'hero' },
      h('div', { class: 'hero-text' },
        h('p', { class: 'eyebrow' }, formatDay(dayNumber(), { weekday: 'long', day: 'numeric', month: 'long' })),
        h('h2', { lang: 'hr', class: 'hello', onclick: () => speak(hello) }, hello),
        h('p', { class: 'muted' }, helloDe + (today.n >= goal ? ' Tagesziel erreicht – stark!' : today.n > 0 ? ' Noch ein Stück bis zum Tagesziel.' : ' Zeit für ein paar Minuten Kroatisch.')),
      ),
      ring(today.n / goal, [h('b', null, Math.min(today.n, 999)), h('small', null, 'von ' + goal)], 88),
    ),

    h('section', { class: 'tiles' },
      h('div', { class: 'tile-stat' }, h('b', null, '🔥 ' + s.streak), h('span', null, s.streak === 1 ? 'Tag in Folge' : 'Tage in Folge')),
      h('div', { class: 'tile-stat' }, h('b', null, s.learned), h('span', null, 'Wörter gelernt')),
      h('div', { class: 'tile-stat' }, h('b', null, s.due), h('span', null, 'heute fällig')),
    ),

    speechStatus('hr') === 'no' && h('a', { class: 'notice', href: '#/einstellungen' },
      h('b', null, 'Keine kroatische Stimme gefunden.'), ' Tippe hier, um das Audio einzurichten.'),

    s.due > 0 && h('button', { class: 'cta review', onclick: startReview },
      h('span', { class: 'cta-icon' }, icon('practice', 26)),
      h('span', { class: 'cta-text' }, h('b', null, 'Wiederholen'), h('small', null, `${s.due} ${s.due === 1 ? 'Karte ist' : 'Karten sind'} fällig – zuerst festigen, was du kannst`)),
      icon('chevron', 20),
    ),

    step && h('button', { class: 'cta learn' + (s.due > 0 ? ' outline' : ''), onclick: () => runStep(step) },
      h('span', { class: 'cta-icon emoji' }, d.icon),
      h('span', { class: 'cta-text' }, h('b', null, isNew ? 'Los geht es' : 'Weiterlernen'), h('small', null, `${d.head} – ${d.text}`)),
      icon('chevron', 20),
    ),

    isNew && h('section', { class: 'card welcome' },
      h('h3', null, 'Dobro došli! So funktioniert es'),
      h('ol', { class: 'steps' },
        h('li', null, h('b', null, 'Lernen: '), 'Jede Einheit bringt wenige neue Wörter – mit Ton, Beispielsatz und sofortigem Abrufen.'),
        h('li', null, h('b', null, 'Wiederholen: '), 'Die App legt dir jedes Wort genau dann wieder vor, kurz bevor du es vergessen würdest.'),
        h('li', null, h('b', null, 'Hören & Sprechen: '), 'Dialoge, Diktate und der Audio-Trainer bringen die Sprache ins Ohr.'),
      ),
      h('div', { class: 'row gap' },
        audioButton('Dobro došli! Učimo hrvatski.'),
        h('span', { class: 'muted' }, 'Ton testen – hörst du Kroatisch?'),
      ),
    ),

    !step && s.due === 0 && h('section', { class: 'card' },
      h('h3', null, 'Alles erledigt 🎉'),
      h('p', { class: 'muted' }, 'Du hast den ganzen Kurs durchgearbeitet und heute ist nichts fällig. Halte die Sprache mit Dialogen und dem Audio-Trainer lebendig.'),
    ),

    h('section', { class: 'quick' },
      h('a', { class: 'quick-item', href: '#/audio/trainer' }, h('span', { class: 'emoji' }, '🎧'), h('b', null, 'Audio-Trainer'), h('small', null, 'Freihändig hören und nachsprechen')),
      h('a', { class: 'quick-item', href: '#/audio' }, h('span', { class: 'emoji' }, '💬'), h('b', null, 'Dialoge'), h('small', null, 'Alltagsgespräche verstehen')),
      h('a', { class: 'quick-item', href: '#/woerterbuch' }, h('span', { class: 'emoji' }, '📖'), h('b', null, 'Wörterbuch'), h('small', null, 'Alle Wörter nachschlagen')),
      h('a', { class: 'quick-item', href: '#/statistik' }, h('span', { class: 'emoji' }, '📈'), h('b', null, 'Statistik'), h('small', null, 'Dein Fortschritt')),
    ),

    h('section', { class: 'card tipcard' },
      h('span', { class: 'tip-icon' }, icon('bulb', 22)),
      h('div', null,
        h('b', null, 'Lerntipp'),
        h('p', null, TIPS[dayNumber() % TIPS.length]),
        h('a', { href: '#/methode' }, 'Warum die App so aufgebaut ist'),
      ),
    ),
  );

  return { title: 'Heute', tab: 'home', el };
}
