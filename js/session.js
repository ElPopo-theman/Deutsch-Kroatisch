// Eine Lernsitzung: zeigt Aufgaben nacheinander, gibt sofort Rückmeldung,
// holt falsch beantwortete Aufgaben in derselben Sitzung zurück und bewertet die Karten.

import { h, shuffle, checkAnswer, toCyrillic } from './util.js';
import { store } from './store.js';
import { speak, stopSpeaking, canSpeak, canRecord, record } from './speech.js';
import { GENDER, sameSentence } from './content.js';
import { AGAIN, HARD, GOOD, EASY } from './srs.js';
import { icon, audioButton, confirmDialog, progressBar } from './ui.js';

const PRAISE = ['Točno!', 'Odlično!', 'Bravo!', 'Super!', 'Tako je!'];
const GRADED = new Set(['mc', 'type', 'build']);
const keepKeyboard = (e) => e.preventDefault();

let active = null;

export const sessionOpen = () => Boolean(active);

/**
 * @param {object} o
 * @param {object[]} o.exercises
 * @param {'learn'|'review'|'free'} o.mode  learn: neue Wörter, bewertet wird am Ende der Einheit
 *                                          review: jede Karte wird bei ihrer ersten Antwort bewertet
 *                                          free: ohne Karten (Verständnisfragen, Nachsprechen)
 * @param {string} [o.title]
 * @param {Function} [o.onFinish]  wird nach vollständig beendeter Sitzung aufgerufen
 * @param {Function} [o.again]     startet eine weitere Runde
 * @param {Function} [o.canAgain]  ob eine weitere Runde gerade sinnvoll ist (wird am Ende gefragt)
 */
export function startSession({ exercises, mode = 'free', title = '', onFinish, again, canAgain }) {
  if (!exercises.length || active) return;

  const root = document.getElementById('session');
  const queue = exercises.slice();
  const cards = new Map(); // cardId → { errors, graded }
  const stats = { answered: 0, correct: 0, newWords: 0, seconds: 0 };
  let pos = 0;
  let view = null;      // aktuelle Aufgabe: { el, focus, key }
  let action = null;    // Haupttaste: { handler, enabled }
  let pending = null;   // gegebene, aber noch nicht verbuchte Antwort
  let shownAt = Date.now();
  let finished = false;

  const bar = h('div', { class: 's-bar' }, h('i'));
  const body = h('div', { class: 's-body' });
  const foot = h('footer', { class: 's-foot' });
  root.replaceChildren(
    h('header', { class: 's-head' },
      h('button', { class: 'icon-btn', 'aria-label': 'Sitzung schließen', onclick: () => requestClose() }, icon('close')),
      bar,
      title && h('span', { class: 's-title' }, title),
    ),
    body,
    foot,
  );
  root.hidden = false;
  document.body.classList.add('in-session');
  history.pushState({ session: true }, '');
  active = { requestClose };

  // ----- Ablauf -----
  function show() {
    stopSpeaking();
    pending = null;
    const ex = queue[pos];
    bar.firstChild.style.width = Math.round((pos / queue.length) * 100) + '%';
    const api = { setAction, answered: (res) => feedback(ex, res), next };
    view = RENDER[ex.kind](ex, api);
    body.replaceChildren(view.el);
    body.scrollTop = 0;
    shownAt = Date.now();
    view.focus?.();
  }

  function setAction(label, enabled, handler) {
    action = { handler, enabled };
    foot.className = 's-foot';
    foot.replaceChildren(
      h('button', { class: 'btn primary wide', disabled: !enabled, onpointerdown: keepKeyboard, onclick: handler }, label),
    );
  }

  function feedback(ex, res) {
    pending = { ex, res, easy: false };
    stats.seconds += Math.min(60, (Date.now() - shownAt) / 1000);
    const rv = ex.reveal || {};
    const canGradeEasy = mode === 'review' && ex.cardId && !ex.retry;

    const redraw = () => {
      const { res: r } = pending;
      foot.className = 's-foot fb ' + (r.ok ? 'ok' : 'bad');
      foot.replaceChildren(
        h('div', { class: 'fb-text' },
          h('strong', null, r.ok ? (r.soft ? 'Fast perfekt!' : PRAISE[stats.answered % PRAISE.length]) : 'Noch nicht ganz.'),
          r.note && h('p', { class: 'fb-note' }, r.note),
          rv.hr && h('div', { class: 'fb-answer' },
            !r.ok && h('span', { class: 'fb-label' }, 'Richtig ist:'),
            h('b', { lang: 'hr' }, rv.hr),
            rv.de && h('span', null, rv.de),
            rv.say && audioButton(rv.say),
          ),
        ),
        h('div', { class: 'fb-actions' },
          r.ok && canGradeEasy && h('button', {
            class: 'link' + (pending.easy ? ' on' : ''), onpointerdown: keepKeyboard,
            onclick: () => { pending.easy = !pending.easy; redraw(); },
          }, pending.easy ? '✓ Als leicht gemerkt' : 'Das war leicht'),
          !r.ok && r.typed && h('button', {
            class: 'link', onpointerdown: keepKeyboard,
            onclick: () => { pending.res = { ...r, ok: true, soft: true, note: 'Als richtig gewertet.' }; redraw(); },
          }, 'Meine Antwort war richtig'),
          h('button', { class: 'btn primary', onpointerdown: keepKeyboard, onclick: next }, 'Weiter'),
        ),
      );
    };
    redraw();
    action = { handler: next, enabled: true };

    if (store.settings.autoplay && rv.say && (ex.sayAfter || !res.ok)) speak(rv.say);
  }

  /** Verbucht die Antwort: Statistik, Kartenbewertung, Wiedervorlage bei Fehlern. */
  function commit() {
    if (!pending) return;
    const { ex, res, easy } = pending;
    pending = null;
    if (!GRADED.has(ex.kind)) return;

    stats.answered += 1;
    if (res.ok) stats.correct += 1;
    store.logAnswer(res.ok);

    if (ex.cardId) {
      const c = cards.get(ex.cardId) || { errors: 0, graded: false };
      cards.set(ex.cardId, c);
      if (!res.ok) c.errors += 1;
      if (mode === 'review' && !c.graded) {
        c.graded = true;
        if (!store.card(ex.cardId) && !ex.cardId.startsWith('g')) stats.newWords += 1;
        store.grade(ex.cardId, !res.ok ? AGAIN : easy ? EASY : res.soft ? HARD : GOOD);
      }
    }
    // Fehler kommen nach ein paar anderen Aufgaben noch einmal – bis sie sitzen.
    if (!res.ok) queue.splice(Math.min(pos + 4, queue.length), 0, { ...ex, retry: true });
  }

  function next() {
    commit();
    pos += 1;
    if (pos >= queue.length) finish();
    else show();
  }

  function finish() {
    finished = true;
    stopSpeaking();
    if (mode === 'learn') {
      for (const [id, c] of cards) {
        if (!store.card(id)) stats.newWords += 1;
        store.grade(id, c.errors === 0 ? GOOD : c.errors <= 2 ? HARD : AGAIN);
      }
    }
    store.logTime(stats.seconds);
    onFinish?.(stats);
    bar.firstChild.style.width = '100%';
    body.replaceChildren(summary());
    foot.className = 's-foot';
    foot.replaceChildren(
      h('div', { class: 'fb-actions end' },
        again && (!canAgain || canAgain()) && h('button', { class: 'btn ghost', onclick: () => { close(); again(); } }, 'Noch eine Runde'),
        h('button', { class: 'btn primary', onclick: close }, 'Fertig'),
      ),
    );
    action = { handler: close, enabled: true };
  }

  function summary() {
    const pct = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 100;
    const today = store.today();
    const goal = store.settings.goal;
    const mins = Math.max(1, Math.round(stats.seconds / 60));
    return h('div', { class: 'summary' },
      h('div', { class: 'summary-badge', 'aria-hidden': 'true' }, pct >= 90 ? '🌟' : pct >= 60 ? '👏' : '💪'),
      h('h2', null, 'Bravo! Geschafft.'),
      h('p', { class: 'muted' }, pct >= 90 ? 'Das sitzt richtig gut.' : pct >= 60 ? 'Gute Arbeit – die Fehler kommen bald zur Wiederholung.' : 'Schwierige Einheit. Genau dafür gibt es die Wiederholung.'),
      stats.answered > 0 && h('div', { class: 'tiles' },
        h('div', { class: 'tile-stat' }, h('b', null, pct + ' %'), h('span', null, 'richtig')),
        stats.newWords > 0 && h('div', { class: 'tile-stat' }, h('b', null, stats.newWords), h('span', null, stats.newWords === 1 ? 'neues Wort' : 'neue Wörter')),
        h('div', { class: 'tile-stat' }, h('b', null, mins + ' min'), h('span', null, 'gelernt')),
      ),
      h('div', { class: 'goal-box' },
        h('div', { class: 'row between' },
          h('span', null, today.n >= goal ? 'Tagesziel erreicht 🎉' : 'Tagesziel'),
          h('span', { class: 'muted' }, `${Math.min(today.n, goal)} / ${goal}`),
        ),
        progressBar(today.n / goal),
      ),
    );
  }

  // ----- Schließen -----
  async function requestClose() {
    if (finished || stats.answered === 0) return close();
    const text = mode === 'learn'
      ? 'Einheit abbrechen? Die neuen Wörter dieser Einheit werden dann beim nächsten Mal noch einmal vorgestellt.'
      : 'Sitzung beenden? Bereits beantwortete Aufgaben bleiben gespeichert.';
    if (await confirmDialog(text, { ok: 'Beenden', cancel: 'Weiterlernen' })) {
      if (!finished) store.logTime(stats.seconds);
      close();
    }
  }

  function close() {
    if (!active) return;
    active = null;
    stopSpeaking();
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('popstate', onPop);
    root.hidden = true;
    root.replaceChildren();
    document.body.classList.remove('in-session');
    if (history.state?.session) history.back();
    window.dispatchEvent(new Event('session-closed'));
  }

  function onPop() {
    // Zurück-Taste des Browsers: Sitzung nicht kommentarlos verlieren.
    if (finished || stats.answered === 0) return close();
    history.pushState({ session: true }, '');
    requestClose();
  }

  function onKey(e) {
    if (document.querySelector('dialog[open]')) return;
    if (e.key === 'Escape') return requestClose();
    if (e.key === 'Enter') {
      if (action?.enabled) { e.preventDefault(); action.handler(); }
      return;
    }
    if (!pending) view?.key?.(e);
  }

  document.addEventListener('keydown', onKey);
  window.addEventListener('popstate', onPop);
  show();
}

// ---------- Darstellung der Aufgabentypen ----------

function promptView(ex) {
  const p = ex.prompt;
  const el = h('div', { class: 'prompt' }, h('p', { class: 'instruction' }, ex.instruction));
  let blank = null;

  if (p.audioOnly) {
    el.append(h('div', { class: 'listen' }, audioButton(p.say, { big: true }), audioButton(p.say, { slow: true })));
  } else {
    const text = h('div', { class: 'prompt-text' + (p.small ? ' small' : '') + (p.cloze ? ' cloze' : ''), lang: p.lang });
    if (p.cloze) {
      const m = p.text.match(/^(.*?)___(.*?)(\s*\([^)]*\))?$/);
      blank = h('span', { class: 'blank' }, ' ');
      text.append(m[1], blank, m[2]);
      if (m[3]) text.append(h('span', { class: 'cloze-hint', lang: 'de' }, m[3]));
    } else {
      text.append(p.text);
    }
    el.append(h('div', { class: 'prompt-row' }, text, p.say && audioButton(p.say), p.say && audioButton(p.say, { slow: true })));
    if (p.sub) el.append(h('p', { class: 'prompt-sub' }, p.sub));
  }
  if (p.say && store.settings.autoplay) speak(p.say);

  return {
    el,
    /** Trägt nach der Antwort die richtige Lösung in die Lücke ein. */
    fill(answer) {
      if (!blank) return;
      blank.textContent = answer;
      blank.classList.add('filled');
    },
  };
}

const RENDER = {
  intro(ex, api) {
    const w = ex.word;
    if (store.settings.autoplay) speak(w.hr);
    api.setAction('Weiter', true, api.next);
    return {
      el: h('div', { class: 'ex intro' },
        h('span', { class: 'tag' }, 'Neues Wort'),
        h('div', { class: 'word-row' }, h('h2', { lang: 'hr' }, w.hr), audioButton(w.hr), audioButton(w.hr, { slow: true })),
        store.settings.cyrillic && h('div', { class: 'cyr', lang: 'sr' }, toCyrillic(w.hr)),
        h('p', { class: 'meaning' }, w.de),
        (w.g || w.sr) && h('div', { class: 'chips' },
          w.g && h('span', { class: 'chip g-' + w.g }, GENDER[w.g]),
          w.sr && h('span', { class: 'chip' }, 'Serbisch: ', h('b', { lang: 'sr' }, w.sr)),
        ),
        w.n && h('p', { class: 'word-note' }, w.n),
        h('div', { class: 'example' },
          h('div', { class: 'example-row' }, h('p', { lang: 'hr' }, w.ex), audioButton(w.ex)),
          h('p', { class: 'muted' }, w.exDe),
        ),
      ),
    };
  },

  mc(ex, api) {
    const prompt = promptView(ex);
    const opts = ex.retry ? shuffle(ex.options) : ex.options;
    let locked = false;
    const buttons = opts.map((o, i) =>
      h('button', { class: 'opt', lang: ex.optionsLang, onclick: () => choose(i) }, h('kbd', null, i + 1), h('span', null, o.label)));

    function choose(i) {
      if (locked || !opts[i]) return;
      locked = true;
      buttons.forEach((b, j) => { b.disabled = true; if (opts[j].correct) b.classList.add('right'); });
      const ok = Boolean(opts[i].correct);
      if (!ok) buttons[i].classList.add('wrong');
      if (ex.reveal?.mark) prompt.fill(ex.reveal.mark);
      api.answered({ ok });
    }

    api.setAction('Wähle eine Antwort', false, () => {});
    return {
      el: h('div', { class: 'ex' }, prompt.el, h('div', { class: 'opts' + (opts.length <= 2 ? ' two' : '') }, buttons)),
      key(e) {
        const n = Number(e.key);
        if (n >= 1 && n <= opts.length && e.target.tagName !== 'INPUT') choose(n - 1);
      },
    };
  },

  type(ex, api) {
    const prompt = promptView(ex);
    let usedHint = false;
    const input = h('input', {
      class: 'answer', type: 'text', lang: 'hr', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off',
      spellcheck: 'false', enterkeyhint: 'done', placeholder: 'Antwort auf Kroatisch', 'aria-label': 'Antwort auf Kroatisch',
    });
    const refresh = () => api.setAction('Prüfen', input.value.trim() !== '', submit);
    input.addEventListener('input', refresh);

    const chars = h('div', { class: 'chars', 'aria-label': 'Sonderzeichen' }, ['č', 'ć', 'đ', 'š', 'ž'].map((ch) =>
      h('button', { type: 'button', class: 'char', onpointerdown: keepKeyboard, onclick: () => insert(ch) }, ch)));
    const hintBox = h('span', { class: 'hint-text', lang: 'hr' });
    const hintBtn = ex.hint && h('button', {
      type: 'button', class: 'link', onpointerdown: keepKeyboard,
      onclick: () => { usedHint = true; hintBox.textContent = ex.hint; hintBtn.hidden = true; },
    }, 'Hinweis zeigen');

    function insert(ch) {
      if (input.readOnly) return;
      const a = input.selectionStart ?? input.value.length;
      const b = input.selectionEnd ?? a;
      input.value = input.value.slice(0, a) + ch + input.value.slice(b);
      input.setSelectionRange(a + 1, a + 1);
      input.focus();
      refresh();
    }

    function submit() {
      const res = checkAnswer(input.value, ex.answers, { strict: ex.strict });
      if (res.kind === 'empty' || input.readOnly) return;
      input.readOnly = true;
      input.classList.add(res.ok ? 'right' : 'wrong');
      if (ex.reveal?.mark) prompt.fill(ex.reveal.mark);
      const note =
        res.kind === 'diacritics' ? 'Achte auf die Sonderzeichen č, ć, đ, š, ž.' :
        res.kind === 'typo' ? 'Kleiner Tippfehler – sieh dir die Schreibweise an.' : '';
      api.answered({ ok: res.ok, soft: res.kind !== 'exact' || usedHint, note, typed: true });
    }

    refresh();
    return {
      el: h('div', { class: 'ex' }, prompt.el, input, h('div', { class: 'type-tools' }, chars, hintBtn, hintBox)),
      focus: () => input.focus({ preventScroll: true }),
    };
  },

  build(ex, api) {
    const prompt = promptView(ex);
    const chosen = [];
    let locked = false;
    const line = h('div', { class: 'build-line', lang: 'hr' });
    const bank = h('div', { class: 'build-bank', lang: 'hr' });
    const tiles = ex.tokens.map((t, i) => h('button', { type: 'button', class: 'tile', onclick: () => toggle(i) }, t));

    function toggle(i) {
      if (locked) return;
      const at = chosen.indexOf(i);
      if (at >= 0) chosen.splice(at, 1);
      else chosen.push(i);
      draw();
    }
    function draw() {
      line.replaceChildren(...chosen.map((i) => tiles[i]));
      bank.replaceChildren(...tiles.filter((_, i) => !chosen.includes(i)));
      line.classList.toggle('empty', chosen.length === 0);
      api.setAction('Prüfen', chosen.length === tiles.length, submit);
    }
    function submit() {
      locked = true;
      const ok = sameSentence(chosen.map((i) => ex.tokens[i]).join(' '), ex.solution);
      line.classList.add(ok ? 'right' : 'wrong');
      api.answered({ ok });
    }

    draw();
    return { el: h('div', { class: 'ex' }, prompt.el, line, bank) };
  },

  speak(ex, api) {
    const { line } = ex;
    if (store.settings.autoplay) speak(line.hr);
    api.setAction('Weiter', true, api.next);

    let rec = null;
    const playback = h('audio', { controls: true, hidden: true, class: 'playback' });
    const recBtn = canRecord() && h('button', { type: 'button', class: 'btn ghost rec', onclick: toggleRec }, icon('mic', 20), h('span', null, 'Aufnehmen'));

    async function toggleRec() {
      try {
        if (!rec) {
          rec = await record();
          recBtn.classList.add('recording');
          recBtn.lastChild.textContent = 'Stopp';
        } else {
          const url = await rec.stop();
          rec = null;
          recBtn.classList.remove('recording');
          recBtn.lastChild.textContent = 'Neu aufnehmen';
          playback.src = url;
          playback.hidden = false;
          playback.play().catch(() => {});
        }
      } catch {
        rec = null;
        recBtn.lastChild.textContent = 'Mikrofon nicht verfügbar';
        recBtn.disabled = true;
      }
    }

    return {
      el: h('div', { class: 'ex speak' },
        h('p', { class: 'instruction' }, 'Höre zu und sprich laut nach'),
        h('span', { class: 'speaker' }, line.speaker),
        h('p', { class: 'speak-text', lang: 'hr' }, line.hr),
        h('p', { class: 'muted' }, line.de),
        h('div', { class: 'listen' }, audioButton(line.hr, { big: true }), audioButton(line.hr, { slow: true })),
        !canSpeak('hr') && h('p', { class: 'muted' }, 'Auf diesem Gerät fehlt eine kroatische Stimme – lies den Satz laut vor.'),
        recBtn && h('div', { class: 'rec-row' }, recBtn, playback),
        recBtn && h('p', { class: 'muted small' }, 'Nimm dich auf und vergleiche deine Aussprache mit dem Original.'),
      ),
    };
  },
};

/** Schließt eine laufende Sitzung von außen (z. B. beim Seitenwechsel). */
export function closeSession() {
  active?.requestClose();
}
