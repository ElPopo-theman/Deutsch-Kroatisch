// Sprachausgabe über die Stimmen des Geräts (Web Speech API) und Aufnahme der eigenen Stimme.
//
// Eigenheiten, auf die dieser Code Rücksicht nimmt – vor allem auf iPhone und iPad:
//  1. Safari listet nur die fest eingebauten Stimmen auf. Nachgeladene Stimmen (auch Kroatisch) fehlen
//     in der Liste, lassen sich aber ansprechen, wenn man nur die Sprache anfordert.
//  2. Die erste Ausgabe muss direkt aus einem Tipp heraus starten.
//  3. Wird direkt nach einem Abbruch neu gesprochen, verschluckt der Browser die neue Ausgabe.
//  4. Bei stummgeschaltetem Gerät bleibt die Sprachausgabe von Webseiten stumm.

import { store } from './store.js';

const inBrowser = typeof window !== 'undefined';
const synth = inBrowser && 'speechSynthesis' in window ? window.speechSynthesis : null;
const agent = inBrowser ? navigator.userAgent : '';

/** iPhone und iPad (das iPad gibt sich als Mac aus, hat aber einen Touchscreen). */
export const isIOS = /iPad|iPhone|iPod/.test(agent) || (inBrowser && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(agent);

// Bosnisch und Serbisch sprechen lateinisch geschriebenes Kroatisch praktisch gleich aus.
const FAMILIES = { hr: ['hr', 'bs', 'sr'], de: ['de'] };
const LANGUAGE_TAG = { hr: 'hr-HR', de: 'de-DE' };
const SETTLE_MS = 180; // Pause nach einem Abbruch, bevor neu gesprochen wird
const TEST_PHRASE = 'Dobar dan! Kako ste? Ja učim hrvatski.';

let voices = [];
let current = null;    // laufende Ausgabe: { utterance, finish } – die Referenz hält sie auch am Leben
let cancelledAt = 0;
let sequence = 0;      // jede neue Ausgabe und jeder Stopp macht ältere, noch wartende ungültig
let lastTest = null;
const listeners = new Set();

// ---------- Stimmen ----------
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
}

export const onVoicesChanged = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

const langOf = (v) => v.lang.toLowerCase().replace('_', '-');
const label = (v) => `${v.name} (${v.lang})`;

function score(v, family) {
  const rank = family.findIndex((p) => langOf(v).startsWith(p));
  let s = (family.length - rank) * 100;
  if (/natural|neural|premium|enhanced|erweitert|siri/i.test(v.name)) s += 20;
  if (/compact|espeak/i.test(v.name)) s -= 10;
  return s;
}

/** Alle aufgelisteten Stimmen für 'hr' oder 'de', die beste zuerst. */
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
 * Auf welchem Weg die App eine Sprache spricht:
 *  'voice' – mit einer Stimme aus der Liste des Browsers
 *  'lang'  – ohne gelistete Stimme: Es wird nur die Sprache angefordert, das System wählt die Stimme.
 *            So klappt es auf iPhone und Android, die nicht alle installierten Stimmen auflisten.
 *  'none'  – gar nicht (keine Sprachausgabe oder am Computer keine passende Stimme)
 */
export function speechMode(lang = 'hr') {
  if (!synth) return 'none';
  if (voicesFor(lang).length) return 'voice';
  if (!voices.length || isIOS || isAndroid || store.settings.forceSpeech) return 'lang';
  return 'none';
}

export const canSpeak = (lang = 'hr') => speechMode(lang) !== 'none';

// ---------- Stummschaltung auf dem iPhone ----------
// Ein kurzer, lautloser Ton stellt die Tonausgabe der Seite auf „Medienwiedergabe“ um; danach ist
// auch die Sprachausgabe trotz Stummschalter zu hören. Abschaltbar in den Einstellungen.
let silentClip = null;

function silentWav(seconds = 0.25, rate = 8000) {
  const n = Math.round(seconds * rate);
  const bytes = new Uint8Array(44 + n).fill(128); // 8 Bit: 128 bedeutet Stille
  const view = new DataView(bytes.buffer);
  const text = (at, s) => [...s].forEach((ch, i) => view.setUint8(at + i, ch.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, 36 + n, true); text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true);
  text(36, 'data'); view.setUint32(40, n, true);
  return 'data:audio/wav;base64,' + btoa(String.fromCharCode(...bytes));
}

function prepareAudio() {
  if (!isIOS || !store.settings.unmute) return;
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
  } catch { /* ältere Versionen kennen das nicht */ }
  try {
    silentClip ||= new Audio(silentWav());
    silentClip.currentTime = 0;
    silentClip.play()?.catch(() => {});
  } catch { /* ohne diesen Kniff geht es bei eingeschaltetem Ton trotzdem */ }
}

// ---------- Sprechen ----------
function clean(text) {
  return String(text).replace(/\s*\([^)]*\)/g, '').replace(/[„“”]/g, '').replace(/\s+/g, ' ').trim();
}

function cancelCurrent() {
  if (!synth) return;
  const active = current;
  current = null;
  if (active || synth.speaking || synth.pending) {
    synth.cancel();
    cancelledAt = Date.now();
  }
  active?.finish(false, 'interrupted');
}

/**
 * Spricht einen Text und meldet, was daraus wurde:
 * { ok, mode, voice, started, error, ms } – error ist null oder z. B. 'timeout', 'interrupted', 'not-allowed'.
 */
function utter(text, { lang = 'hr', slow = false, pitch = 1 } = {}) {
  return new Promise((resolve) => {
    const phrase = clean(text);
    const mode = speechMode(lang);
    const result = { ok: false, mode, voice: null, started: false, error: null, ms: 0 };
    if (!phrase || mode === 'none') return resolve(result);

    const voice = pickVoice(lang);
    const u = new SpeechSynthesisUtterance(phrase);
    if (voice) {
      u.voice = voice;
      result.voice = label(voice);
    }
    u.lang = voice ? voice.lang.replace('_', '-') : LANGUAGE_TAG[lang];
    const base = lang === 'hr' ? store.settings.rate : 1;
    u.rate = slow ? Math.max(0.5, base * 0.65) : base;
    u.pitch = pitch;

    const mine = ++sequence;
    const calledAt = Date.now();
    let done = false;
    let guard = 0;
    let delay = 0;
    const finish = (ok, error = null) => {
      if (done) return;
      done = true;
      clearTimeout(guard);
      clearTimeout(delay);
      if (current?.utterance === u) current = null;
      Object.assign(result, { ok, error, ms: Date.now() - calledAt });
      resolve(result);
    };
    u.onstart = () => { result.started = true; };
    u.onend = () => finish(true);
    u.onerror = (e) => finish(false, e?.error || 'error');
    // Manche Browser melden das Ende nie – nach großzügiger Wartezeit geht es trotzdem weiter.
    guard = setTimeout(() => finish(false, 'timeout'), 6000 + phrase.length * 220);

    cancelCurrent();
    prepareAudio(); // noch im Tipp des Nutzers, damit iOS den Ton zulässt

    const begin = () => {
      if (mine !== sequence) return finish(false, 'interrupted');
      current = { utterance: u, finish };
      if (synth.paused) synth.resume(); // nach einem Wechsel in den Hintergrund hängt iOS gern im Pausenzustand
      synth.speak(u);
    };
    // Die erste Ausgabe startet sofort (iOS verlangt das); nur nach einem Abbruch wird kurz gewartet.
    const wait = cancelledAt + SETTLE_MS - Date.now();
    if (wait > 0) delay = setTimeout(begin, wait);
    else begin();
  });
}

/**
 * Liest Text vor. Die Zusage löst sich auf, sobald die Ausgabe endet (true) oder nicht möglich war (false).
 * options: lang 'hr' | 'de', slow (langsamer), pitch (Stimmlage, um in Dialogen die Sprecher zu unterscheiden)
 */
export const speak = (text, options) => utter(text, options).then((r) => r.ok);

export function stopSpeaking() {
  sequence += 1;
  cancelCurrent();
}

// ---------- Ton-Test und Diagnose ----------
/** Spricht einen Testsatz und liefert das Ergebnis von utter(). */
export async function testSpeech() {
  lastTest = await utter(TEST_PHRASE);
  return lastTest;
}

/** Alles, was der Browser über seine Sprachausgabe verrät – für die Fehlersuche auf fremden Geräten. */
export function speechDiagnostics() {
  let session = null;
  try { session = inBrowser && navigator.audioSession ? navigator.audioSession.type : null; } catch { /* egal */ }
  return {
    supported: Boolean(synth),
    mode: speechMode('hr'),
    total: voices.length,
    hr: voicesFor('hr').map(label),
    de: voicesFor('de').map(label),
    languages: [...new Set(voices.map(langOf))].sort(),
    ios: isIOS,
    audioSession: session,
    lastTest,
  };
}

// ---------- Aufnahme zum Vergleichen der eigenen Aussprache ----------
export const canRecord = () =>
  inBrowser && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined';

/** Startet eine Aufnahme. stop() liefert eine abspielbare URL. */
export async function record() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'play-and-record';
  } catch { /* nicht vorhanden */ }
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
