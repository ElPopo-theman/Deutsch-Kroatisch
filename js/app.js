// Einstieg: Navigation zwischen den Ansichten, Farbschema, Offline-Betrieb.

import { h } from './util.js';
import { store } from './store.js';
import { initSpeech, stopSpeaking, onVoicesChanged } from './speech.js';
import { icon } from './ui.js';
import { sessionOpen } from './session.js';
import { dueCount } from './learning.js';
import { home } from './views/home.js';
import { course, unit, unitWords, dictionary, notFound } from './views/course.js';
import { practice } from './views/practice.js';
import { audio, dialogue, trainer } from './views/audio.js';
import { grammarList, grammarLesson } from './views/grammar.js';
import { more, stats, settings, method } from './views/more.js';

const ROUTES = [
  [/^\/?$/, home],
  [/^\/kurs$/, course],
  [/^\/kurs\/(\w+)$/, unit],
  [/^\/kurs\/(\w+)\/woerter$/, unitWords],
  [/^\/ueben$/, practice],
  [/^\/audio$/, audio],
  [/^\/audio\/trainer$/, trainer],
  [/^\/audio\/dialog\/(\w+)$/, dialogue],
  [/^\/grammatik$/, grammarList],
  [/^\/grammatik\/(\w+)$/, grammarLesson],
  [/^\/mehr$/, more],
  [/^\/statistik$/, stats],
  [/^\/einstellungen$/, settings],
  [/^\/methode$/, method],
  [/^\/woerterbuch$/, dictionary],
];

const TABS = [
  ['home', '#/', 'home', 'Heute'],
  ['course', '#/kurs', 'course', 'Kurs'],
  ['practice', '#/ueben', 'practice', 'Üben'],
  ['audio', '#/audio', 'audio', 'Audio'],
  ['grammar', '#/grammatik', 'grammar', 'Grammatik'],
  ['more', '#/mehr', 'more', 'Mehr'],
];

const viewEl = document.getElementById('view');
const titleEl = document.getElementById('title');
const backEl = document.getElementById('back');
const navEl = document.getElementById('nav');
let current = null;

function buildNav() {
  navEl.replaceChildren(
    h('a', { class: 'brand', href: '#/', 'aria-label': 'Bok! Startseite' }, h('span', { class: 'brand-mark' }, 'Bok!'), h('small', null, 'Kroatisch lernen')),
    ...TABS.map(([id, href, ico, label]) =>
      h('a', { class: 'tab', href, 'data-tab': id }, icon(ico, 24), h('span', null, label), id === 'practice' && h('i', { class: 'badge', hidden: true }))),
  );
}

function updateNav(tab) {
  navEl.querySelectorAll('.tab').forEach((a) => {
    const on = a.dataset.tab === tab;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const due = dueCount();
  const badge = navEl.querySelector('.badge');
  badge.hidden = due === 0;
  badge.textContent = due > 99 ? '99+' : due;
}

function render({ keepScroll = false } = {}) {
  const path = location.hash.replace(/^#/, '') || '/';
  let view = null;
  for (const [pattern, fn] of ROUTES) {
    const m = path.match(pattern);
    if (m) { view = fn(...m.slice(1)); break; }
  }
  view ||= notFound();

  const scroll = keepScroll ? document.scrollingElement.scrollTop : 0;
  current?.cleanup?.();
  stopSpeaking();
  current = view;
  viewEl.replaceChildren(view.el);
  titleEl.textContent = view.title;
  document.title = view.title === 'Heute' ? 'Bok! – Kroatisch lernen' : `${view.title} · Bok!`;
  backEl.hidden = !view.back;
  backEl.onclick = () => { location.hash = view.back; };
  updateNav(view.tab);
  document.scrollingElement.scrollTop = scroll;
}

function applyTheme() {
  const t = store.settings.theme;
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

// Höhe des sichtbaren Bereichs – auf dem iPhone schrumpft sie, wenn die Tastatur erscheint.
function trackViewport() {
  const vv = window.visualViewport;
  if (!vv) return;
  const update = () => {
    document.documentElement.style.setProperty('--vvh', vv.height + 'px');
    document.documentElement.style.setProperty('--vvt', vv.offsetTop + 'px');
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}

buildNav();
backEl.append(icon('back', 24));
applyTheme();
trackViewport();
initSpeech();
store.onChange(applyTheme);

window.addEventListener('hashchange', () => { if (!sessionOpen()) render(); });
window.addEventListener('app:refresh', () => render({ keepScroll: true }));
window.addEventListener('session-closed', () => render({ keepScroll: true }));
// Sobald das Gerät seine Stimmen meldet, die Hinweise zum Audio aktualisieren.
onVoicesChanged(() => { if (!sessionOpen() && !current?.stateful) render({ keepScroll: true }); });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.installPrompt = e; });
// Nach Mitternacht (bzw. beim Zurückkehren in die App) die fälligen Karten neu zählen.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !sessionOpen() && !current?.stateful) render({ keepScroll: true });
});

render();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  try {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  } catch { /* in eingebetteten Ansichten nicht erlaubt */ }
}
navigator.storage?.persist?.().catch(() => {});
