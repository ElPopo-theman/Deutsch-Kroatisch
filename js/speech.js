// Sprachausgabe über die Stimmen des Geräts (Web Speech API) und Aufnahme der eigenen Stimme.
//
// Kroatische Stimmen bringen iPhone, iPad und Mac von Haus aus mit, ebenso Microsoft Edge und Android.
// Fehlt eine passende Stimme, bleibt die App benutzbar und erklärt in den Einstellungen, wie man eine einrichtet.

import { store } from './store.js';

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

// Bosnisch und Serbisch sprechen lateinisch geschriebenes Kroatisch praktisch gleich aus.
const FAMILIES = { hr: ['hr', 'bs', 'sr'], de: ['de'] };

let voices = [];
let current = null; // Referenz halten – sonst räumt Safari die Ausgabe weg, bevor „onend“ feuert.
let warmup = null;  // stumme Ausgabe, die iOS die Sprachausgabe freischalten lässt
const listeners = new Set();

function refresh() {
  if (!synth) return;
  const list = synth.getVoices();
  if (list.length !== voices.length) {
    voices = list;
    listeners.forEach((fn) => fn());
  }
}

export function initSpeech() {
  if (!synth) return;
  refresh();
  synth.addEventListener?.('voiceschanged', refresh);
  // Safari meldet neue Stimmen nicht zuverlässig – deshalb zusätzlich ein paar Mal nachsehen.
  let tries = 0;
  const poll = setInterval(() => { refresh(); if (++tries > 12) clearInterval(poll); }, 500);

  // iOS erlaubt Sprachausgabe erst nach einer Berührung. Die erste Berührung schaltet sie frei.
  const unlock = () => {
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      u.onend = u.onerror = () => { warmup = null; };
      warmup = u;
      setTimeout(() => { warmup = null; }, 1500);
      synth.speak(u);
    } catch { /* nicht unterstützt */ }
    refresh();
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

export const onVoicesChanged = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

const langOf = (v) => v.lang.toLowerCase().replace('_', '-');

function score(v, family) {
  const rank = family.findIndex((p) => langOf(v).startsWith(p));
  let s = (family.length - rank) * 100;
  if (/natural|neural|premium|enhanced|erweitert|siri/i.test(v.name)) s += 20;
  if (/compact|espeak/i.test(v.name)) s -= 10;
  return s;
}

/** Alle Stimmen für 'hr' oder 'de', die beste zuerst. */
export function voicesFor(lang) {
  const family = FAMILIES[lang];
  return voices
    .filter((v) => family.some((p) => langOf(v).startsWith(p)))
    .sort((a, b) => score(b, family) - score(a, family));
}

function pickVoice(lang) {
  const list = voicesFor(lang);
  const wanted = store.settings[lang === 'hr' ? 'voiceHr' : 'voiceDe'];
  return list.find((v) => v.voiceURI === wanted) || list[0] || null;
}

/**
 * 'yes'   – passende Stimme vorhanden
 * 'maybe' – der Browser nennt (noch) keine Stimmen; ein Versuch lohnt sich
 * 'no'    – Sprachausgabe fehlt ganz oder es gibt keine Stimme für diese Sprache
 */
export function speechStatus(lang = 'hr') {
  if (!synth) return 'no';
  if (voicesFor(lang).length) return 'yes';
  return voices.length ? 'no' : 'maybe';
}

export const canSpeak = (lang = 'hr') => speechStatus(lang) !== 'no';

function clean(text) {
  return String(text).replace(/\s*\([^)]*\)/g, '').replace(/[„“”]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Liest Text vor. Die Zusage löst sich auf, sobald die Ausgabe endet (true) oder nicht möglich war (false).
 * options: lang 'hr' | 'de', slow (langsamer sprechen), interrupt (laufende Ausgabe abbrechen, Standard: ja),
 *          pitch (Stimmlage, um in Dialogen die Sprecher zu unterscheiden)
 */
export function speak(text, { lang = 'hr', slow = false, interrupt = true, pitch = 1 } = {}) {
  return new Promise((resolve) => {
    const phrase = clean(text);
    if (!synth || !phrase || speechStatus(lang) === 'no') return resolve(false);

    const voice = pickVoice(lang);
    const u = new SpeechSynthesisUtterance(phrase);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang.replace('_', '-') : lang === 'hr' ? 'hr-HR' : 'de-DE';
    const base = lang === 'hr' ? store.settings.rate : 1;
    u.rate = slow ? Math.max(0.5, base * 0.65) : base;
    u.pitch = pitch;

    let finished = false;
    const finish = (ok) => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      if (current === u) current = null;
      resolve(ok);
    };
    u.onend = () => finish(true);
    u.onerror = () => finish(false);
    // Manche Browser melden das Ende nie – nach großzügiger Wartezeit geht es trotzdem weiter.
    const guard = setTimeout(() => finish(false), 5000 + phrase.length * 220);

    const start = () => { current = u; synth.speak(u); };
    // Läuft nur die stumme Freischaltung, wird sie nicht abgebrochen: Die erste echte Ausgabe muss
    // auf dem iPhone unmittelbar aus der Berührung heraus starten.
    if (interrupt && !warmup && (synth.speaking || synth.pending)) {
      synth.cancel();
      setTimeout(start, 80); // direkt nach cancel() verschlucken einige Browser die nächste Ausgabe
    } else {
      start();
    }
  });
}

export function stopSpeaking() {
  if (synth) synth.cancel();
}

// ---------- Aufnahme zum Vergleichen der eigenen Aussprache ----------
export const canRecord = () =>
  typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined';

/** Startet eine Aufnahme. stop() liefert eine abspielbare URL. */
export async function record() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.start();
  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/mp4' })));
        };
        recorder.stop();
      }),
  };
}

// ---------- Bildschirm wach halten (Audio-Trainer) ----------
let wakeLock = null;
export async function keepAwake(on) {
  try {
    if (on && !wakeLock && navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen');
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { /* nicht verfügbar – kein Problem */ }
}
