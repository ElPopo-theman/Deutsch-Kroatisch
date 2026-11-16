// Wiederverwendbare Bausteine der Oberfläche.

import { h } from './util.js';
import { speak, canSpeak } from './speech.js';

const PATHS = {
  speaker: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  course: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h12"/><path d="M9 8h6"/>',
  practice: '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/><path d="M4 20v-4.5h4.5"/>',
  audio: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  grammar: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 10h16M10 10v10"/>',
  more: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
  settings: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.5"/><circle cx="8" cy="17" r="2.5"/>',
  chart: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
  book: '<path d="M12 6c-2-1.4-5-2-8-2v14c3 0 6 .6 8 2 2-1.4 5-2 8-2V4c-3 0-6 .6-8 2z"/><path d="M12 6v14"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2h5c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke-linejoin="round"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
  next: '<path d="M6 5l9 7-9 7z" fill="currentColor" stroke-linejoin="round"/><path d="M18 5v14"/>',
  prev: '<path d="M18 5l-9 7 9 7z" fill="currentColor" stroke-linejoin="round"/><path d="M6 5v14"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
};

export function icon(name, size = 24) {
  const span = document.createElement('span');
  span.className = 'ico';
  span.innerHTML =
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
  return span;
}

/** Runde Taste, die einen kroatischen Text vorliest. */
export function audioButton(text, { slow = false, big = false, lang = 'hr' } = {}) {
  if (!canSpeak(lang)) return null;
  const btn = h(
    'button',
    {
      type: 'button',
      class: 'audio-btn' + (big ? ' big' : '') + (slow ? ' slow' : ''),
      'aria-label': slow ? 'Langsam anhören' : 'Anhören',
      title: slow ? 'Langsam anhören' : 'Anhören',
      onpointerdown: (e) => e.preventDefault(), // Tastatur offen lassen
      onclick: async (e) => {
        e.stopPropagation();
        btn.classList.add('playing');
        await speak(text, { lang, slow });
        btn.classList.remove('playing');
      },
    },
    slow ? h('span', { class: 'turtle', 'aria-hidden': 'true' }, '🐢') : icon('speaker', big ? 34 : 22),
  );
  return btn;
}

let toastTimer;
export function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/** Rückfrage in einem kleinen Dialog. Liefert true, wenn bestätigt wurde. */
export function confirmDialog(message, { ok = 'OK', cancel = 'Abbrechen', danger = false } = {}) {
  return new Promise((resolve) => {
    const dlg = h('dialog', { class: 'dialog' },
      h('p', null, message),
      h('div', { class: 'dialog-actions' },
        h('button', { class: 'btn ghost', onclick: () => dlg.close('no') }, cancel),
        h('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), onclick: () => dlg.close('yes') }, ok),
      ),
    );
    dlg.addEventListener('close', () => { dlg.remove(); resolve(dlg.returnValue === 'yes'); });
    document.body.append(dlg);
    dlg.showModal();
  });
}

/** Fortschrittsring (0–1) mit Inhalt in der Mitte. */
export function ring(fraction, content, size = 76) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const wrap = h('div', { class: 'ring', style: { width: size + 'px', height: size + 'px' } });
  wrap.innerHTML =
    `<svg viewBox="0 0 80 80" aria-hidden="true"><circle class="ring-track" cx="40" cy="40" r="${r}"/>` +
    `<circle class="ring-fill" cx="40" cy="40" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, fraction))}"/></svg>`;
  wrap.append(h('div', { class: 'ring-content' }, content));
  return wrap;
}

export function progressBar(fraction) {
  return h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': Math.round(fraction * 100), 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('i', { style: { width: Math.round(Math.min(1, fraction) * 100) + '%' } }));
}
