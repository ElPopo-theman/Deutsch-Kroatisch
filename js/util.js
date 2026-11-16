// Kleine Helfer ohne Abhängigkeiten.

/** Erzeugt ein DOM-Element: h('button', { class: 'btn', onclick: fn }, 'Text'). */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = (list, n) => shuffle(list).slice(0, n);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Tage ----------
// Der Lerntag wechselt um 4 Uhr morgens, damit eine späte Sitzung noch zum selben Tag zählt.
const DAY_MS = 86400000;
const ROLLOVER_HOURS = 4;

export function dayNumber(date = new Date()) {
  const d = new Date(date.getTime() - ROLLOVER_HOURS * 3600000);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
}

export function formatDay(day, options) {
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC', ...options }).format(new Date(day * DAY_MS));
}

// ---------- Antworten vergleichen ----------
export function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFC')
    .replace(/[.,!?;:"„“”'’()…–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ersetzt die Sonderzeichen so, wie man sie ohne kroatische Tastatur tippen würde. */
export function fold(s) {
  return normalize(s).replace(/[čć]/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'dj');
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Prüft eine getippte Antwort.
 * kind: 'exact' | 'diacritics' (richtig bis auf č/ć/đ/š/ž) | 'typo' (kleiner Tippfehler) | 'wrong' | 'empty'
 * strict = true lässt keine Tippfehler zu – nötig bei Grammatik, wo ein Buchstabe den Fall ausmacht.
 */
export function checkAnswer(input, answers, { strict = false } = {}) {
  const typed = normalize(input);
  if (!typed) return { ok: false, kind: 'empty' };
  const wanted = answers.map(normalize);
  if (wanted.includes(typed)) return { ok: true, kind: 'exact' };
  const folded = fold(typed);
  if (wanted.some((a) => fold(a) === folded)) return { ok: true, kind: 'diacritics' };
  if (!strict) {
    for (const a of wanted) {
      const tolerance = a.length >= 9 ? 2 : a.length >= 5 ? 1 : 0;
      if (tolerance && levenshtein(fold(a), folded) <= tolerance) return { ok: true, kind: 'typo' };
    }
  }
  return { ok: false, kind: 'wrong' };
}

// ---------- Kyrillisch ----------
const CYRILLIC = {
  lj: 'љ', nj: 'њ', dž: 'џ', a: 'а', b: 'б', c: 'ц', č: 'ч', ć: 'ћ', d: 'д', đ: 'ђ', e: 'е', f: 'ф', g: 'г',
  h: 'х', i: 'и', j: 'ј', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', š: 'ш', t: 'т',
  u: 'у', v: 'в', z: 'з', ž: 'ж',
};

/** Überträgt lateinisch geschriebenen Text 1:1 in die serbische kyrillische Schrift. */
export function toCyrillic(text) {
  return text.replace(/lj|nj|dž|./gi, (m) => {
    const lower = m.toLowerCase();
    const c = CYRILLIC[lower];
    if (!c) return m;
    return m[0] === lower[0] ? c : c.toUpperCase();
  });
}
