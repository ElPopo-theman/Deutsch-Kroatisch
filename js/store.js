// Lernstand und Einstellungen – alles bleibt lokal auf dem Gerät (localStorage).

import { dayNumber } from './util.js';
import { review } from './srs.js';

const KEY = 'bok.state.v1';

export const DEFAULT_SETTINGS = {
  goal: 30,            // Tagesziel in beantworteten Aufgaben
  newPerSession: 6,    // neue Wörter pro Lerneinheit
  reviewsPerSession: 20,
  retention: 0.9,      // angestrebte Behaltensquote
  rate: 0.9,           // Sprechgeschwindigkeit
  autoplay: true,      // Kroatisch automatisch vorlesen
  voiceHr: '',
  voiceDe: '',
  theme: 'auto',       // auto | light | dark
  cyrillic: false,     // kyrillische Schreibweise einblenden
};

function emptyState() {
  return { v: 1, settings: { ...DEFAULT_SETTINGS }, cards: {}, done: {}, days: {}, started: dayNumber() };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const s = JSON.parse(raw);
    return { ...emptyState(), ...s, settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) } };
  } catch {
    return emptyState();
  }
}

let state = load();
let timer = null;

function persist() {
  timer = null;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Speicher voll oder gesperrt (z. B. privates Surfen) – die Sitzung läuft trotzdem weiter. */
  }
}

function save() {
  if (!timer) timer = setTimeout(persist, 250);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', persist);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && persist());
}

const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

export const store = {
  get settings() { return state.settings; },
  get cards() { return state.cards; },

  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  set(key, value) {
    state.settings[key] = value;
    save();
    emit();
  },

  // ----- Karten -----
  card(id) { return state.cards[id] || null; },

  /** Bewertet eine Karte (1–4) und plant die nächste Wiederholung. */
  grade(id, grade) {
    const isNew = !state.cards[id];
    state.cards[id] = review(state.cards[id], grade, dayNumber(), state.settings.retention);
    if (isNew && !id.startsWith('g')) this.today().nw = (this.today().nw || 0) + 1;
    save();
    return state.cards[id];
  },

  dueIds(day = dayNumber()) {
    return Object.keys(state.cards).filter((id) => state.cards[id].due <= day);
  },

  // ----- Abgeschlossene Schritte (Grammatiklektion gelesen, Dialog verstanden …) -----
  isDone(key) { return Boolean(state.done[key]); },
  markDone(key) {
    if (!state.done[key]) { state.done[key] = dayNumber(); save(); }
  },

  // ----- Tagesstatistik -----
  today() {
    const d = dayNumber();
    return (state.days[d] ||= { n: 0, c: 0 });
  },
  day(d) { return state.days[d] || { n: 0, c: 0 }; },
  logAnswer(correct) {
    const t = this.today();
    t.n += 1;
    if (correct) t.c += 1;
    save();
  },
  logTime(seconds) {
    const t = this.today();
    t.s = (t.s || 0) + Math.round(seconds);
    save();
  },

  /** Aufeinanderfolgende Tage mit erreichtem Mindestpensum (10 Aufgaben). Heute zählt, sobald es geschafft ist. */
  streak() {
    const active = (d) => (state.days[d]?.n || 0) >= 10;
    let d = dayNumber();
    if (!active(d)) d -= 1;
    let n = 0;
    while (active(d)) { n += 1; d -= 1; }
    return n;
  },

  // ----- Sicherung -----
  export() { persist(); return JSON.stringify(state); },
  import(json) {
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object' || !data.cards || !data.settings) throw new Error('Keine gültige Sicherung');
    state = { ...emptyState(), ...data, settings: { ...DEFAULT_SETTINGS, ...data.settings } };
    persist();
    emit();
  },
  reset() {
    const settings = state.settings;
    state = emptyState();
    state.settings = settings;
    persist();
    emit();
  },
};
