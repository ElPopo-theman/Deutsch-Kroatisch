// Mehr: Menü, Statistik, Einstellungen und die Erklärung der Lernmethode.

import { h, dayNumber, formatDay } from '../util.js';
import { store } from '../store.js';
import { speak, voicesFor, speechStatus } from '../speech.js';
import { icon, toast, confirmDialog, progressBar } from '../ui.js';
import { units, lessons, words } from '../content.js';
import { summaryStats, forecast, activity, unitProgress } from '../learning.js';

const refresh = () => window.dispatchEvent(new Event('app:refresh'));

// ---------- Menü ----------
export function more() {
  const item = (href, name, title, text) =>
    h('a', { class: 'step-card', href }, h('span', { class: 'menu-icon' }, icon(name, 22)),
      h('span', { class: 'step-body' }, h('b', null, title), h('span', { class: 'muted' }, text)), icon('chevron', 20));
  const el = h('div', { class: 'page' },
    h('div', { class: 'list' },
      item('#/statistik', 'chart', 'Statistik', 'Fortschritt, Serie und anstehende Wiederholungen'),
      item('#/woerterbuch', 'book', 'Wörterbuch', `Alle ${words.length} Wörter des Kurses durchsuchen`),
      item('#/methode', 'bulb', 'Lernmethode', 'Was die Forschung über das Sprachenlernen weiß'),
      item('#/einstellungen', 'settings', 'Einstellungen', 'Tagesziel, Audio, Darstellung, Sicherung, Installation'),
    ),
    h('p', { class: 'muted small center' }, 'Bok! – Kroatisch, Serbisch und Bosnisch lernen. Dein Lernstand bleibt auf diesem Gerät.'),
  );
  return { title: 'Mehr', tab: 'more', el };
}

// ---------- Statistik ----------
/** Säulendiagramm für eine einzelne Zahlenreihe; Werte erscheinen beim Überfahren oder Fokussieren. */
function columnChart(data, { title, head }) {
  const max = Math.max(...data.map((d) => d.value));
  const top = Math.max(4, Math.ceil(max / 4) * 4);
  const peak = data.findIndex((d) => d.value === max);
  return h('figure', { class: 'chart' },
    h('figcaption', null, title),
    h('div', { class: 'chart-plot' },
      h('span', { class: 'chart-top' }, top),
      h('div', { class: 'cols' }, data.map((d, i) =>
        h('div', { class: 'col', tabindex: 0, 'data-tip': d.tip, 'aria-label': d.tip },
          max > 0 && i === peak && h('span', { class: 'col-value' }, d.value),
          h('i', { style: { height: (d.value / top) * 100 + '%' } }),
        ))),
    ),
    h('div', { class: 'chart-x', 'aria-hidden': 'true' }, data.map((d) => h('span', { class: d.strong ? 'strong' : '' }, d.label))),
    h('details', null,
      h('summary', null, 'Als Tabelle anzeigen'),
      h('table', { class: 'gt' },
        h('thead', null, h('tr', null, head.map((x) => h('th', null, x)))),
        h('tbody', null, data.map((d) => h('tr', null, h('th', null, d.long), h('td', null, d.value)))),
      ),
    ),
  );
}

export function stats() {
  const s = summaryStats();
  const today = dayNumber();
  const short = (d) => formatDay(d, { weekday: 'short' }).replace('.', '');
  const long = (d) => formatDay(d, { weekday: 'short', day: 'numeric', month: 'numeric' });

  const act = activity(14).map((a) => ({
    value: a.n, label: a.day === today ? 'heute' : (today - a.day) % 2 === 0 ? short(a.day) : '', strong: a.day === today,
    long: long(a.day), tip: `${long(a.day)}: ${a.n} ${a.n === 1 ? 'Aufgabe' : 'Aufgaben'}`,
  }));
  const fc = forecast(7).map((f) => ({
    value: f.n, label: f.day === today ? 'heute' : short(f.day), strong: f.day === today,
    long: long(f.day), tip: `${long(f.day)}: ${f.n} ${f.n === 1 ? 'Karte' : 'Karten'} fällig`,
  }));

  const tile = (value, label) => h('div', { class: 'tile-stat' }, h('b', null, value), h('span', null, label));
  const el = h('div', { class: 'page' },
    h('section', { class: 'tiles six' },
      tile(s.learned, `von ${s.total} Wörtern gelernt`),
      tile(s.solid, 'Wörter gefestigt'),
      tile(s.due, 'Karten heute fällig'),
      tile(s.streak, s.streak === 1 ? 'Tag in Folge' : 'Tage in Folge'),
      tile(s.accuracy == null ? '–' : s.accuracy + ' %', 'richtig (7 Tage)'),
      tile(`${s.lessonsDone}/${lessons.length}`, 'Grammatikthemen'),
    ),
    h('section', { class: 'card' }, columnChart(act, { title: 'Beantwortete Aufgaben – letzte 14 Tage', head: ['Tag', 'Aufgaben'] })),
    h('section', { class: 'card' }, columnChart(fc, { title: 'Anstehende Wiederholungen – nächste 7 Tage', head: ['Tag', 'Karten'] })),
    h('section', { class: 'card' },
      h('h3', null, 'Wortschatz nach Lektion'),
      h('ul', { class: 'meters' }, units.map((u, i) => {
        const p = unitProgress(u);
        return h('li', null,
          h('a', { href: '#/kurs/' + u.id }, h('span', null, `${i + 1}. ${u.hr}`), h('span', { class: 'muted' }, `${p.learned} / ${p.words}`)),
          progressBar(p.learned / p.words),
        );
      })),
    ),
    h('p', { class: 'muted small' }, '„Gefestigt“ heißt: Die App rechnet damit, dass du das Wort auch nach drei Wochen Pause noch mit 90 % Wahrscheinlichkeit weißt.'),
  );
  return { title: 'Statistik', tab: 'more', back: '#/mehr', el };
}

// ---------- Einstellungen ----------
function seg(key, options) {
  return h('div', { class: 'seg', role: 'group' }, options.map(([value, label]) =>
    h('button', { class: store.settings[key] === value ? 'on' : '', 'aria-pressed': String(store.settings[key] === value), onclick: () => { store.set(key, value); refresh(); } }, label)));
}

const row = (label, help, control) =>
  h('div', { class: 'setting' }, h('div', null, h('b', null, label), help && h('p', { class: 'muted small' }, help)), control);

async function exportData() {
  const name = `bok-lernstand-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([store.export()], name, { type: 'application/json' });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Bok! Lernstand' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = h('a', { href: URL.createObjectURL(file), download: name });
  document.body.append(a);
  a.click();
  a.remove();
  toast('Sicherung gespeichert');
}

async function importData(file) {
  if (!file) return;
  if (!(await confirmDialog('Sicherung einspielen? Der Lernstand auf diesem Gerät wird dadurch ersetzt.', { ok: 'Einspielen' }))) return;
  try {
    store.import(await file.text());
    toast('Lernstand übernommen');
    refresh();
  } catch {
    toast('Diese Datei ist keine gültige Sicherung.');
  }
}

export function settings() {
  const hrVoices = voicesFor('hr');
  const status = speechStatus('hr');
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: (e) => importData(e.target.files[0]) });
  const test = () => speak('Dobar dan! Kako ste? Ja učim hrvatski.');

  const el = h('div', { class: 'page settings' },
    h('section', { class: 'card' },
      h('h3', null, 'Lernen'),
      row('Tagesziel', 'Beantwortete Aufgaben pro Tag. 30 Aufgaben dauern etwa zehn Minuten.', seg('goal', [[15, '15'], [30, '30'], [50, '50'], [80, '80']])),
      row('Neue Wörter pro Einheit', 'Weniger ist oft mehr: Kleine Portionen bleiben besser haften.', seg('newPerSession', [[4, '4'], [6, '6'], [8, '8'], [10, '10']])),
      row('Wiederholungen pro Sitzung', null, seg('reviewsPerSession', [[10, '10'], [20, '20'], [30, '30'], [50, '50']])),
      row('Behaltensquote', 'Wie sicher du ein Wort bei der Wiederholung noch wissen sollst. Höher bedeutet mehr Wiederholungen.', seg('retention', [[0.85, '85 %'], [0.9, '90 %'], [0.93, '93 %']])),
    ),

    h('section', { class: 'card', id: 'audio' },
      h('h3', null, 'Audio'),
      h('p', { class: 'status ' + status },
        status === 'yes' ? `✓ Kroatische Stimme gefunden (${hrVoices.length} verfügbar).`
          : status === 'maybe' ? 'Der Browser hat noch keine Stimmen gemeldet. Tippe auf „Testen“.'
            : 'Auf diesem Gerät wurde keine kroatische, bosnische oder serbische Stimme gefunden.'),
      hrVoices.length > 0 && row('Stimme', null,
        h('select', { 'aria-label': 'Stimme', onchange: (e) => { store.set('voiceHr', e.target.value); test(); } },
          hrVoices.map((v, i) => h('option', { value: v.voiceURI, selected: store.settings.voiceHr ? v.voiceURI === store.settings.voiceHr : i === 0 }, `${v.name} (${v.lang})`)))),
      row('Sprechtempo', 'Für den Anfang etwas langsamer. Jede Aufgabe hat zusätzlich eine 🐢-Taste.',
        seg('rate', [[0.7, 'langsam'], [0.9, 'normal'], [1, 'schnell']])),
      row('Automatisch vorlesen', 'Kroatisch bei jeder Aufgabe von selbst abspielen.', seg('autoplay', [[true, 'an'], [false, 'aus']])),
      h('button', { class: 'btn ghost', onclick: test }, icon('speaker', 18), ' Testen'),
      status !== 'yes' && h('div', { class: 'help' },
        h('b', null, 'So richtest du eine Stimme ein'),
        h('ul', null,
          h('li', null, h('b', null, 'iPhone, iPad: '), 'Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Kroatisch. Dort lässt sich die Stimme „Lana“ laden.'),
          h('li', null, h('b', null, 'Mac: '), 'Systemeinstellungen → Bedienungshilfen → Gesprochene Inhalte → Systemstimme → Stimmen verwalten → Kroatisch.'),
          h('li', null, h('b', null, 'Windows: '), 'Am einfachsten die App in Microsoft Edge öffnen – Edge bringt kroatische Stimmen mit. Sonst: Einstellungen → Zeit und Sprache → Sprache → Stimmen hinzufügen → Kroatisch.'),
          h('li', null, h('b', null, 'Android: '), 'Einstellungen → Sprachausgabe → Sprachdaten installieren → Kroatisch.'),
        ),
        h('p', { class: 'muted small' }, 'Die Menünamen unterscheiden sich je nach Version etwas. Lade die App danach neu.'),
      ),
    ),

    h('section', { class: 'card' },
      h('h3', null, 'Darstellung'),
      row('Farbschema', null, seg('theme', [['auto', 'System'], ['light', 'Hell'], ['dark', 'Dunkel']])),
      row('Kyrillische Schrift', 'Zeigt bei Wörtern zusätzlich die Schreibweise, die in Serbien üblich ist.', seg('cyrillic', [[false, 'aus'], [true, 'an']])),
    ),

    h('section', { class: 'card', id: 'install' },
      h('h3', null, 'Als App installieren'),
      standalone
        ? h('p', { class: 'ok-text' }, '✓ Die App ist installiert und funktioniert auch ohne Internet.')
        : h('div', null,
          window.installPrompt && h('button', { class: 'btn primary', onclick: async () => { await window.installPrompt.prompt(); window.installPrompt = null; refresh(); } }, 'Jetzt installieren'),
          h('ul', { class: 'plain' },
            h('li', null, h('b', null, 'iPhone, iPad: '), 'in Safari öffnen → Teilen-Symbol → „Zum Home-Bildschirm“.'),
            h('li', null, h('b', null, 'Windows, Linux (Chrome, Edge): '), 'Installations-Symbol rechts in der Adressleiste oder Menü → „App installieren“.'),
            h('li', null, h('b', null, 'Mac (Safari): '), 'Ablage → „Zum Dock hinzufügen“.'),
            h('li', null, h('b', null, 'Android: '), 'Menü → „App installieren“.'),
          ),
          h('p', { class: 'muted small' }, 'Nach der Installation startet die App wie jede andere – im Vollbild und offline.'),
        ),
    ),

    h('section', { class: 'card' },
      h('h3', null, 'Lernstand sichern und übertragen'),
      h('p', { class: 'muted' }, 'Dein Lernstand liegt nur auf diesem Gerät. Mit einer Sicherungsdatei nimmst du ihn vom iPhone auf den Computer mit – oder umgekehrt.'),
      h('div', { class: 'row gap wrap' },
        h('button', { class: 'btn ghost', onclick: exportData }, 'Sicherung erstellen'),
        h('button', { class: 'btn ghost', onclick: () => fileInput.click() }, 'Sicherung einspielen'),
        fileInput,
      ),
      h('button', {
        class: 'link danger',
        onclick: async () => {
          if (await confirmDialog('Wirklich den gesamten Lernstand löschen? Das lässt sich nicht rückgängig machen.', { ok: 'Alles löschen', danger: true })) {
            store.reset();
            toast('Lernstand gelöscht');
            refresh();
          }
        },
      }, 'Lernstand zurücksetzen'),
    ),
  );
  return { title: 'Einstellungen', tab: 'more', back: '#/mehr', el };
}

// ---------- Lernmethode ----------
const PRINCIPLES = [
  ['Abrufen statt Wiederlesen',
    'Sich selbst abzufragen gehört zu den wirksamsten Lerntechniken überhaupt – deutlich wirksamer als mehrfaches Lesen oder Markieren. In der großen Übersichtsarbeit von Dunlosky und Kollegen (2013) erhielten nur zwei von zehn Techniken die Bestnote: das Selbst-Testen und das verteilte Üben.',
    'Jede Aufgabe verlangt eine Antwort von dir, bevor du die Lösung siehst. Reines Durchblättern gibt es nicht.'],
  ['Verteilt wiederholen',
    'Wiederholungen mit wachsendem Abstand schlagen das Pauken am Stück. Für Fremdsprachen bestätigt das eine Meta-Analyse von Kim und Webb (2022) über 48 Experimente: Der Vorteil ist klein bis mittelgroß und zeigt sich vor allem langfristig.',
    'Der Zeitplan folgt FSRS, einem offenen Verfahren, das für jede Karte schätzt, wann du sie zu vergessen drohst. Fällig wird sie kurz davor.'],
  ['Erst erkennen, dann selbst produzieren',
    'Ein Wort zu erkennen ist leichter, als es selbst hervorzubringen – und beides muss geübt werden. Karteikarten-Training ist dabei besonders effizient (Webb u. a., 2020).',
    'Neue Wörter beginnen mit Auswahlaufgaben. Je sicherer ein Wort sitzt, desto öfter musst du es schreiben oder aus dem Gehörten notieren.'],
  ['Vier Stränge im Gleichgewicht',
    'Paul Nation beschreibt guten Sprachunterricht als vier etwa gleich große Teile: verständliches Hören und Lesen, eigenes Sprechen und Schreiben, gezieltes Lernen von Wörtern und Regeln sowie flüssiges Anwenden von bereits Bekanntem.',
    'Dialoge liefern verständlichen Input, Schreib- und Nachsprechaufgaben den Output, Wortschatz und Grammatik das gezielte Lernen – und Wiederholung sowie Audio-Trainer die Geläufigkeit.'],
  ['Regeln ausdrücklich erklären',
    'Erwachsene lernen Grammatik schneller, wenn Regeln benannt und danach geübt werden, als wenn sie sie nur aus Beispielen erschließen sollen (Norris & Ortega, 2000; Goo u. a., 2015). Für eine Sprache mit sieben Fällen ist das besonders hilfreich.',
    'Jedes Grammatikthema ist eine kurze Erklärung mit Tabelle und Beispielen, direkt gefolgt von Aufgaben.'],
  ['Themen mischen',
    'Abwechselnd statt blockweise zu üben fühlt sich mühsamer an, führte in Studien zur Grammatik aber oft zu besserem Behalten (Nakata & Suzuki, 2019; Pan u. a., 2019). Die Befunde sind nicht einheitlich, überwiegen aber zugunsten des Mischens.',
    'Wiederholungen mischen Wörter und Grammatik aus allen Lektionen. Innerhalb des Kurses wechseln sich Wortschatz und Grammatik ab.'],
  ['Häufige Wörter zuerst',
    'Ein kleiner Kern sehr häufiger Wörter trägt den Großteil jeder Unterhaltung. Für das Englische decken die rund 2000 häufigsten Wortfamilien etwa 80 bis 90 Prozent üblicher Texte ab; das Prinzip gilt für andere Sprachen ebenso.',
    'Der Kurs beginnt mit dem Alltagskern: Begrüßung, die wichtigsten Verben, Essen, Zahlen, Orientierung.'],
  ['Hören und Nachsprechen',
    'Gleichzeitiges oder direktes Nachsprechen („Shadowing“) verbessert nachweislich das Hörverstehen (Hamada, 2016). Für die Aussprache ist die Studienlage dünner, aber ebenfalls ermutigend.',
    'Jedes Wort und jeder Satz hat Ton, auch verlangsamt. Dialoge lassen sich Satz für Satz nachsprechen, aufnehmen und mit dem Original vergleichen.'],
  ['Wörter im Zusammenhang',
    'Ein Wort zu kennen heißt mehr, als seine Übersetzung zu wissen: Dazu gehören Klang, Schreibung, Formen und typische Verbindungen.',
    'Zu jedem Wort gehört ein Beispielsatz, der später als Diktat und zum Zusammensetzen wiederkehrt.'],
  ['Kurz, aber täglich',
    'Lernen wirkt über Regelmäßigkeit. Zehn Minuten am Tag bringen mehr als eine lange Sitzung pro Woche – das folgt direkt aus dem Vorteil des verteilten Übens.',
    'Ein kleines Tagesziel, eine Serie und Einheiten von wenigen Minuten machen das Dranbleiben leicht.'],
];

const SOURCES = [
  ['Dunlosky u. a. (2013): Improving Students’ Learning With Effective Learning Techniques. Psychological Science in the Public Interest 14(1)', 'https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html'],
  ['Kim & Webb (2022): The Effects of Spaced Practice on Second Language Learning – A Meta-Analysis. Language Learning 72(1)', 'https://doi.org/10.1111/lang.12479'],
  ['Nation (2007): The Four Strands. Innovation in Language Learning and Teaching 1(1), S. 2–13', null],
  ['Norris & Ortega (2000) und Goo u. a. (2015): Wirksamkeit expliziter Grammatikvermittlung', 'https://www.degruyterbrill.com/document/doi/10.1075/sibil.48.18goo/html'],
  ['Pan u. a. (2019): Interleaved practice bei Verbformen; Nakata & Suzuki (2019)', 'https://sc-pan.github.io/pdf/PLPR_2019.pdf'],
  ['Nation (2006) und Folgestudien: Wie viel Wortschatz braucht man?', 'https://www.cambridge.org/core/journals/language-teaching/article/how-much-vocabulary-is-needed-to-use-english-replication-of-van-zeeland-schmitt-2012-nation-2006-and-cobb-2007/1D217A56A2E0056E67802A6A8360FDDE'],
  ['Hamada: Shadowing als Hörtraining. The Language Teacher 38(1)', 'https://jalt-publications.org/sites/default/files/pdf-article/38.1tlt_art1.pdf'],
  ['FSRS – Free Spaced Repetition Scheduler (open-spaced-repetition)', 'https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm'],
];

export function method() {
  const el = h('div', { class: 'page prose method' },
    h('p', { class: 'lead' }, 'Diese App ist um das herum gebaut, was die Lernforschung über das Sprachenlernen am besten belegt hat. Zehn Grundsätze – und wie du sie hier wiederfindest.'),
    PRINCIPLES.map(([title, research, app], i) =>
      h('section', { class: 'principle' },
        h('h3', null, h('span', { class: 'num' }, i + 1), title),
        h('p', null, research),
        h('p', { class: 'in-app' }, h('b', null, 'In der App: '), app),
      )),
    h('section', { class: 'card soft' },
      h('h3', null, 'Was die App nicht ersetzt'),
      h('p', null, 'Echte Gespräche. Sobald du die ersten Lektionen hinter dir hast, such dir Gelegenheiten zum Sprechen – im Urlaub, mit Bekannten, mit einer Tandempartnerin. Die App liefert dafür das Fundament.'),
    ),
    h('h3', null, 'Quellen'),
    h('ul', { class: 'sources' }, SOURCES.map(([text, url]) =>
      h('li', null, url ? h('a', { href: url, target: '_blank', rel: 'noopener' }, text) : text))),
  );
  return { title: 'Lernmethode', tab: 'more', back: '#/mehr', el };
}
