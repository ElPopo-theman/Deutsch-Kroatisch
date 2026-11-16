// Grammatik – kurze, explizite Erklärungen mit sofortiger Übung.
//
// Übungsformate:
//   c(Satz mit ___, Lösung, Übersetzung, [Distraktoren])  Lückentext; mit Distraktoren zuerst als Auswahl,
//                                                         bei späteren Wiederholungen zum Selbst-Tippen
//   m(Frage, [richtige Antwort, ...falsche Antworten])    Auswahlfrage
//   d(kroatisch, deutsch)                                 Diktat (hören und schreiben)

const c = (q, a, de, o) => ({ t: 'c', q, a, de, o });
const m = (q, o) => ({ t: 'm', q, o });
const d = (hr, de) => ({ t: 'd', hr, de });

const ex = (pairs) =>
  '<ul class="exl">' + pairs.map(([hr, de]) => `<li><span class="say">${hr}</span><i>${de}</i></li>`).join('') + '</ul>';
const tbl = (head, rows) =>
  '<div class="tw"><table class="gt"><thead><tr>' + head.map((x) => `<th>${x}</th>`).join('') + '</tr></thead><tbody>' +
  rows.map((r) => '<tr>' + r.map((x, i) => (i === 0 ? `<th>${x}</th>` : `<td>${x}</td>`)).join('') + '</tr>').join('') +
  '</tbody></table></div>';
const tip = (s) => `<p class="tip">${s}</p>`;

export const GRAMMAR = [
  {
    id: 'g01', group: 'Grundlagen', title: 'Alphabet & Aussprache', hr: 'Abeceda i izgovor',
    summary: '30 Buchstaben, jeder Laut wird immer gleich gesprochen.',
    html: `
<p>Kroatisch wird fast genau so geschrieben, wie es gesprochen wird: <b>„Piši kao što govoriš“</b> – schreib, wie du sprichst. Jeder der 30 Buchstaben steht für genau einen Laut. Wer die folgenden Zeichen kennt, kann jedes Wort richtig vorlesen.</p>
${tbl(['Buchstabe', 'Aussprache', 'Beispiel'], [
  ['c', 'wie deutsches <b>z</b> („ts“)', '<span class="say">cesta</span> Straße'],
  ['č', 'hartes <b>tsch</b> wie in „Matsch“', '<span class="say">čaj</span> Tee'],
  ['ć', 'weiches <b>tch</b>, fast „tj“', '<span class="say">kuća</span> Haus'],
  ['dž', 'hartes <b>dsch</b> wie in „Dschungel“', '<span class="say">džep</span> Hosentasche'],
  ['đ', 'weiches <b>dj</b>', '<span class="say">đak</span> Schüler'],
  ['h', 'wie <b>ch</b> in „ach“, etwas weicher', '<span class="say">hvala</span> danke'],
  ['lj', 'wie <b>lj</b> in „Million“', '<span class="say">ljubav</span> Liebe'],
  ['nj', 'wie <b>gn</b> in „Cognac“', '<span class="say">njemački</span> deutsch'],
  ['r', 'gerollt; kann eine Silbe tragen', '<span class="say">trg</span> Platz'],
  ['s', 'immer stimmlos wie <b>ß</b>', '<span class="say">sat</span> Stunde'],
  ['š', 'wie <b>sch</b>', '<span class="say">škola</span> Schule'],
  ['v', 'wie deutsches <b>w</b>', '<span class="say">voda</span> Wasser'],
  ['z', 'stimmhaftes <b>s</b> wie in „Sonne“', '<span class="say">zima</span> Winter'],
  ['ž', 'wie <b>j</b> in „Journal“', '<span class="say">žena</span> Frau'],
])}
<p>Die Vokale <b>a, e, i, o, u</b> werden immer klar und offen gesprochen – es gibt keine Umlaute und kein verschlucktes „e“ wie in „bitte“. Alle anderen Buchstaben klingen wie im Deutschen.</p>
${tip('<b>Betonung:</b> In mehrsilbigen Wörtern liegt sie nie auf der letzten Silbe, meist auf der ersten oder vorletzten. Tippe ein Wort an und sprich es laut nach – Hören und Nachsprechen prägt die Laute am besten ein.')}
<p><b>č oder ć?</b> Beide klingen für deutsche Ohren ähnlich. Viele Muttersprachler unterscheiden sie selbst kaum – verstanden wirst du in jedem Fall. Die Schreibung lernst du am besten mit jedem Wort mit.</p>`,
    ex: [
      m('Wie spricht man das „c“ in „cesta“ (Straße) aus?', ['wie „ts“ (deutsches z)', 'wie „k“', 'wie „s“', 'wie „tsch“']),
      m('Welcher Buchstabe klingt wie das deutsche „sch“?', ['š', 'ž', 'č', 's']),
      m('Wie klingt „v“ in „voda“ (Wasser)?', ['wie deutsches „w“', 'wie deutsches „f“', 'wie „u“', 'es bleibt stumm']),
      m('„ž“ in „žena“ klingt wie …', ['das „j“ in „Journal“', 'das „sch“ in „Schule“', 'das „z“ in „Zahn“', 'das „ß“ in „Straße“']),
      m('„z“ in „zima“ (Winter) klingt wie …', ['das stimmhafte „s“ in „Sonne“', 'das „z“ in „Zahn“', 'das „sch“ in „Schule“', 'das „ß“ in „Straße“']),
      m('In welchem Wort trägt das „r“ eine ganze Silbe?', ['trg', 'riba', 'more', 'ruka']),
      m('„nj“ in „njemački“ klingt wie …', ['„gn“ in „Cognac“', '„ng“ in „singen“', 'einfaches „n“', '„nk“ in „Bank“']),
      m('„h“ in „hvala“ klingt am ehesten wie …', ['das „ch“ in „ach“', 'ein stummes h', 'das „k“ in „Kino“', 'das „sch“ in „Schule“']),
      m('Wo liegt die Betonung in mehrsilbigen Wörtern nie?', ['auf der letzten Silbe', 'auf der ersten Silbe', 'auf der vorletzten Silbe']),
      m('Was bedeutet „Piši kao što govoriš“?', ['Schreib, wie du sprichst', 'Sprich langsam und deutlich', 'Lies jeden Tag', 'Hör gut zu']),
      d('hvala', 'danke'),
      d('škola', 'Schule'),
      d('čaj', 'Tee'),
      d('žena', 'Frau'),
      d('ljubav', 'Liebe'),
      d('dobar dan', 'guten Tag'),
    ],
  },
  {
    id: 'g02', group: 'Grundlagen', title: 'Personalpronomen & „sein“', hr: 'Zamjenice i glagol biti',
    summary: 'ja sam, ti si, on je … und die Verneinung nisam.',
    html: `
<p>Das Verb <b>biti</b> (sein) ist das wichtigste Verb überhaupt – du brauchst es auch für die Vergangenheit.</p>
${tbl(['', 'Pronomen', 'sein', 'nicht sein'], [
  ['ich', 'ja', 'sam', 'nisam'],
  ['du', 'ti', 'si', 'nisi'],
  ['er / sie / es', 'on / ona / ono', 'je', 'nije'],
  ['wir', 'mi', 'smo', 'nismo'],
  ['ihr / Sie', 'vi', 'ste', 'niste'],
  ['sie', 'oni / one / ona', 'su', 'nisu'],
])}
${ex([
  ['Ja sam student.', 'Ich bin Student.'],
  ['Ona je iz Zagreba.', 'Sie ist aus Zagreb.'],
  ['Mi nismo umorni.', 'Wir sind nicht müde.'],
  ['Jeste li vi gospodin Horvat?', 'Sind Sie Herr Horvat?'],
])}
<p><b>Das Pronomen fällt meist weg</b>, weil die Verbform schon zeigt, wer gemeint ist: <span class="say">Umoran sam.</span> – Ich bin müde.</p>
${tip('<b>Wichtig:</b> Die Kurzformen <b>sam, si, je …</b> können nie am Satzanfang stehen. Also <i>Ja sam student</i> oder <i>Student sam</i>, aber nicht <s>Sam student</s>.')}
<p>Für Fragen und Kurzantworten gibt es die langen Formen <b>jesam, jesi, jest, jesmo, jeste, jesu</b>: <span class="say">Jesi li umoran?</span> – <span class="say">Jesam.</span> (Bist du müde? – Ja.)</p>
<p><b>vi</b> ist zugleich „ihr“ und die höfliche Anrede „Sie“.</p>`,
    ex: [
      c('Ja ___ student.', 'sam', 'Ich bin Student.', ['si', 'je', 'smo']),
      c('Ti ___ iz Njemačke.', 'si', 'Du bist aus Deutschland.', ['sam', 'je', 'ste']),
      c('Ona ___ učiteljica.', 'je', 'Sie ist Lehrerin.', ['si', 'su', 'sam']),
      c('Mi ___ u Zagrebu.', 'smo', 'Wir sind in Zagreb.', ['su', 'ste', 'sam']),
      c('Vi ___ jako ljubazni.', 'ste', 'Sie sind sehr freundlich.', ['smo', 'su', 'si']),
      c('Oni ___ prijatelji.', 'su', 'Sie sind Freunde.', ['smo', 'je', 'ste']),
      c('Ja ___ umoran.', 'nisam', 'Ich bin nicht müde.', ['nisi', 'nije', 'nismo']),
      c('On ___ kod kuće.', 'nije', 'Er ist nicht zu Hause.', ['nisam', 'nisu', 'nisi']),
      c('___ li ti Ana?', 'Jesi', 'Bist du Ana?', ['Jesam', 'Jeste', 'Jesu']),
      c('Mi ___ iz Austrije.', 'nismo', 'Wir sind nicht aus Österreich.', ['nisu', 'niste', 'nisam']),
      m('Welcher Satz ist richtig?', ['Student sam.', 'Sam student.', 'Sam ja student.']),
      m('Was bedeutet „vi“?', ['ihr / Sie', 'wir', 'sie (mehrere)', 'du']),
      d('Ja sam iz Njemačke.', 'Ich bin aus Deutschland.'),
    ],
  },
  {
    id: 'g03', group: 'Grundlagen', title: 'Geschlecht & Plural', hr: 'Rod i množina imenica',
    summary: 'Die Endung verrät das Geschlecht: grad, žena, selo.',
    html: `
<p>Kroatisch hat drei Geschlechter, aber <b>keine Artikel</b>. Das Geschlecht erkennst du fast immer an der Endung:</p>
${tbl(['', 'Endung', 'Einzahl', 'Mehrzahl'], [
  ['maskulin', 'Konsonant', '<span class="say">student</span>', '<span class="say">studenti</span> (-i)'],
  ['feminin', '-a', '<span class="say">žena</span>', '<span class="say">žene</span> (-e)'],
  ['neutrum', '-o / -e', '<span class="say">selo</span>, <span class="say">more</span>', '<span class="say">sela</span>, <span class="say">mora</span> (-a)'],
])}
<p><b>Besonderheiten im Plural:</b></p>
<ul>
<li>Einsilbige maskuline Wörter bekommen meist <b>-ovi</b> oder <b>-evi</b>: <span class="say">grad – gradovi</span>, <span class="say">stol – stolovi</span>, <span class="say">muž – muževi</span>.</li>
<li>Vor <b>-i</b> wird k → c, g → z, h → s: <span class="say">učenik – učenici</span>.</li>
<li>Feminine Wörter auf Konsonant enden im Plural auf <b>-i</b>: <span class="say">noć – noći</span>.</li>
<li>Unregelmäßig: <span class="say">čovjek – ljudi</span>, <span class="say">dijete – djeca</span>, <span class="say">brat – braća</span>.</li>
</ul>
${tip('<b>Ausnahmen beim Geschlecht:</b> Einige Wörter auf Konsonant sind feminin (<i>noć, riječ, sol, ljubav, obitelj</i>). Männliche Personen auf -a sind maskulin (<i>tata, kolega</i>). <i>auto</i> ist maskulin.')}`,
    ex: [
      m('Welches Geschlecht hat „kuća“ (Haus)?', ['feminin', 'maskulin', 'neutrum']),
      m('Welches Geschlecht hat „grad“ (Stadt)?', ['maskulin', 'feminin', 'neutrum']),
      m('Welches Geschlecht hat „more“ (Meer)?', ['neutrum', 'maskulin', 'feminin']),
      m('Welches Geschlecht hat „noć“ (Nacht)?', ['feminin', 'maskulin', 'neutrum']),
      m('Welches Geschlecht hat „tata“ (Papa)?', ['maskulin', 'feminin', 'neutrum']),
      c('student → ___ (Plural)', 'studenti', 'Student → Studenten', ['studente', 'studenta', 'studentovi']),
      c('žena → ___ (Plural)', 'žene', 'Frau → Frauen', ['ženi', 'žena', 'ženovi']),
      c('grad → ___ (Plural)', 'gradovi', 'Stadt → Städte', ['gradi', 'grade', 'grada']),
      c('selo → ___ (Plural)', 'sela', 'Dorf → Dörfer', ['seli', 'sele', 'selovi']),
      c('kuća → ___ (Plural)', 'kuće', 'Haus → Häuser', ['kući', 'kuća', 'kućovi']),
      c('prijatelj → ___ (Plural)', 'prijatelji', 'Freund → Freunde', ['prijatelje', 'prijatelja', 'prijateljovi']),
      c('čovjek → ___ (Plural)', 'ljudi', 'Mensch → Menschen', ['čovjeci', 'čovjeki', 'čovjekovi']),
      c('dijete → ___ (Plural)', 'djeca', 'Kind → Kinder', ['dijeti', 'dijeta', 'djeti']),
      c('učenik → ___ (Plural)', 'učenici', 'Schüler → Schüler (Pl.)', ['učeniki', 'učenike', 'učenikovi']),
      c('noć → ___ (Plural)', 'noći', 'Nacht → Nächte', ['noće', 'noća', 'noćevi']),
      c('stol → ___ (Plural)', 'stolovi', 'Tisch → Tische', ['stoli', 'stole', 'stola']),
    ],
  },
  {
    id: 'g04', group: 'Verben', title: 'Präsens: die drei Konjugationen', hr: 'Prezent',
    summary: 'gledam, govorim, pišem – drei Muster für alle Verben.',
    html: `
<p>Im Präsens gibt es drei Muster. Welches gilt, zeigt die <b>ich-Form</b> – lerne sie deshalb mit jedem Verb gleich mit.</p>
${tbl(['', '-am<br><small>gledati</small>', '-im<br><small>govoriti</small>', '-em<br><small>pisati</small>'], [
  ['ja', 'gled<b>am</b>', 'govor<b>im</b>', 'piš<b>em</b>'],
  ['ti', 'gled<b>aš</b>', 'govor<b>iš</b>', 'piš<b>eš</b>'],
  ['on / ona', 'gled<b>a</b>', 'govor<b>i</b>', 'piš<b>e</b>'],
  ['mi', 'gled<b>amo</b>', 'govor<b>imo</b>', 'piš<b>emo</b>'],
  ['vi', 'gled<b>ate</b>', 'govor<b>ite</b>', 'piš<b>ete</b>'],
  ['oni', 'gled<b>aju</b>', 'govor<b>e</b>', 'piš<b>u</b>'],
])}
${ex([
  ['Govorim malo hrvatski.', 'Ich spreche ein bisschen Kroatisch.'],
  ['Što gledaš?', 'Was schaust du?'],
  ['Oni rade u Zagrebu.', 'Sie arbeiten in Zagreb.'],
])}
<p><b>Häufige Verben mit -em:</b> <span class="say">piti – pijem</span> (trinken), <span class="say">jesti – jedem</span> (essen), <span class="say">ići – idem</span> (gehen), <span class="say">putovati – putujem</span> (reisen), <span class="say">zvati – zovem</span> (rufen). Verben auf <b>-ovati</b> bilden immer <b>-ujem</b>.</p>
<p><b>Unregelmäßig:</b> <span class="say">moći – mogu, možeš, može, možemo, možete, mogu</span> (können) und <span class="say">htjeti – hoću, hoćeš, hoće …</span> (wollen).</p>
${tip('Es gibt nur <b>eine</b> Gegenwartsform: <i>Čitam</i> heißt sowohl „ich lese“ als auch „ich lese gerade“.')}`,
    ex: [
      c('Ja ___ hrvatski. (govoriti)', 'govorim', 'Ich spreche Kroatisch.', ['govoriš', 'govori', 'govorimo']),
      c('Ti ___ televiziju. (gledati)', 'gledaš', 'Du siehst fern.', ['gledam', 'gleda', 'gledate']),
      c('Ona ___ pismo. (pisati)', 'piše', 'Sie schreibt einen Brief.', ['pišem', 'pisa', 'pišu']),
      c('Mi ___ kavu. (piti)', 'pijemo', 'Wir trinken Kaffee.', ['pijem', 'pijete', 'piju']),
      c('Vi ___ u Beču. (živjeti)', 'živite', 'Sie leben in Wien.', ['živimo', 'žive', 'živiš']),
      c('Oni ___ u banci. (raditi)', 'rade', 'Sie arbeiten in der Bank.', ['radi', 'radimo', 'radiju']),
      c('Oni ___ film. (gledati)', 'gledaju', 'Sie schauen einen Film.', ['gleda', 'glede', 'gledate']),
      c('Ja ___ u Hrvatsku. (putovati)', 'putujem', 'Ich reise nach Kroatien.', ['putovam', 'putuješ', 'putuju']),
      c('Prijatelji ___ sok. (piti)', 'piju', 'Die Freunde trinken Saft.', ['pije', 'pijemo', 'pijete']),
      c('Ti ___ dobro. (pjevati)', 'pjevaš', 'Du singst gut.', ['pjevam', 'pjeva', 'pjevate']),
      c('On ___ u školu. (ići)', 'ide', 'Er geht zur Schule.', ['idem', 'ideš', 'idu']),
      c('Mi ___ kruh. (jesti)', 'jedemo', 'Wir essen Brot.', ['jedem', 'jedete', 'jedu']),
      c('Ja ne ___ doći. (moći)', 'mogu', 'Ich kann nicht kommen.', ['možem', 'može', 'možeš']),
      d('Govorim malo hrvatski.', 'Ich spreche ein bisschen Kroatisch.'),
    ],
  },
  {
    id: 'g05', group: 'Die Fälle', title: 'Akkusativ: wen oder was?', hr: 'Akuzativ',
    summary: 'Pijem kavu. Imam brata. Idem u grad.',
    html: `
<p>Kroatisch hat sieben Fälle. Der <b>Akkusativ</b> ist der erste, den du brauchst: Er markiert das direkte Objekt (wen? was?) und die Richtung (wohin?).</p>
${tbl(['', 'Nominativ', 'Akkusativ', 'Regel'], [
  ['feminin', 'kava', 'kav<b>u</b>', '-a → -u'],
  ['maskulin, unbelebt', 'grad', 'grad', 'bleibt gleich'],
  ['maskulin, belebt', 'brat', 'brat<b>a</b>', '+ -a'],
  ['neutrum', 'more', 'more', 'bleibt gleich'],
])}
${ex([
  ['Pijem kavu.', 'Ich trinke Kaffee.'],
  ['Imam brata i sestru.', 'Ich habe einen Bruder und eine Schwester.'],
  ['Vidim more.', 'Ich sehe das Meer.'],
  ['Idem u školu.', 'Ich gehe in die Schule.'],
])}
<p><b>Belebt oder unbelebt?</b> Nur maskuline Wörter für Menschen und Tiere bekommen ein <b>-a</b>: <span class="say">Imam psa.</span> (pas → psa: das „a“ im Stamm fällt weg.)</p>
<p><b>Adjektive</b> passen sich an: <span class="say">dobru kavu</span>, <span class="say">dobrog prijatelja</span>.</p>
<p><b>Plural:</b> maskulin <b>-e</b> (<span class="say">studente</span>), feminin <b>-e</b> (<span class="say">žene</span>), neutrum <b>-a</b> (<span class="say">sela</span>).</p>
${tip('<b>Pronomen im Akkusativ:</b> me, te, ga, je, nas, vas, ih – <span class="say">Volim te.</span> Ich liebe dich. <span class="say">Vidim ga.</span> Ich sehe ihn.')}`,
    ex: [
      c('Pijem ___. (kava)', 'kavu', 'Ich trinke Kaffee.', ['kava', 'kave', 'kavom']),
      c('Imam ___. (brat)', 'brata', 'Ich habe einen Bruder.', ['brat', 'bratu', 'bratom']),
      c('Čitam ___. (knjiga)', 'knjigu', 'Ich lese ein Buch.', ['knjiga', 'knjige', 'knjizi']),
      c('Vidim ___. (grad)', 'grad', 'Ich sehe die Stadt.', ['grada', 'gradu', 'gradom']),
      c('Volim ___. (more)', 'more', 'Ich liebe das Meer.', ['mora', 'moru', 'morem']),
      c('Imaš li ___? (sestra)', 'sestru', 'Hast du eine Schwester?', ['sestra', 'sestre', 'sestri']),
      c('Tražim ___. (hotel)', 'hotel', 'Ich suche ein Hotel.', ['hotela', 'hotelu', 'hotelom']),
      c('Poznajem ___. (Marko)', 'Marka', 'Ich kenne Marko.', ['Marko', 'Marku', 'Markom']),
      c('Kupujem ___. (riba)', 'ribu', 'Ich kaufe Fisch.', ['riba', 'ribe', 'ribi']),
      c('Idem u ___. (škola)', 'školu', 'Ich gehe in die Schule.', ['škola', 'školi', 'škole']),
      c('Imamo ___. (pas)', 'psa', 'Wir haben einen Hund.', ['pas', 'pasa', 'psu']),
      c('Jedem ___. (juha)', 'juhu', 'Ich esse Suppe.', ['juha', 'juhe', 'juhi']),
      c('Volim ___. (ti)', 'te', 'Ich liebe dich.', ['ti', 'tebi', 'tobom']),
      c('Idemo na ___. (plaža)', 'plažu', 'Wir gehen an den Strand.', ['plaža', 'plaži', 'plaže']),
    ],
  },
  {
    id: 'g06', group: 'Grundlagen', title: 'Fragen & Verneinung', hr: 'Pitanja i negacija',
    summary: 'Govoriš li …? Tko, što, gdje? Ne znam. Nemam.',
    html: `
<p><b>Ja/Nein-Fragen</b> bildest du mit dem Wörtchen <b>li</b> direkt nach dem Verb:</p>
${ex([
  ['Govoriš li hrvatski?', 'Sprichst du Kroatisch?'],
  ['Imate li sobu?', 'Haben Sie ein Zimmer?'],
  ['Jesi li umoran?', 'Bist du müde?'],
  ['Je li to daleko?', 'Ist das weit?'],
])}
<p>In Serbien und Bosnien hörst du stattdessen oft <b>Da li …?</b> – <span class="say">Da li govoriš srpski?</span></p>
${tbl(['Fragewort', 'Bedeutung', 'Fragewort', 'Bedeutung'], [
  ['tko', 'wer', 'kada', 'wann'],
  ['što', 'was', 'kako', 'wie'],
  ['gdje', 'wo', 'zašto', 'warum'],
  ['kamo', 'wohin', 'koliko', 'wie viel'],
  ['odakle', 'woher', 'koji / koja / koje', 'welcher'],
])}
<p><b>Verneinung:</b> <b>ne</b> steht direkt vor dem Verb: <span class="say">Ne razumijem.</span> Drei Verben verschmelzen damit:</p>
<ul>
<li>biti → <b>nisam</b>, nisi, nije …</li>
<li>imati → <b>nemam</b>, nemaš, nema …</li>
<li>htjeti → <b>neću</b>, nećeš, neće …</li>
</ul>
${tip('<b>Doppelte Verneinung ist Pflicht:</b> <span class="say">Ništa ne razumijem.</span> (wörtlich: „Nichts nicht verstehe ich.“) – ebenso mit <i>nikad</i> (nie), <i>nitko</i> (niemand), <i>nigdje</i> (nirgends).')}`,
    ex: [
      c('___ je to? – To je moj brat.', 'Tko', 'Wer ist das? – Das ist mein Bruder.', ['Što', 'Gdje', 'Kada']),
      c('___ radiš? – Čitam knjigu.', 'Što', 'Was machst du? – Ich lese ein Buch.', ['Tko', 'Gdje', 'Koliko']),
      c('___ stanuješ? – U Splitu.', 'Gdje', 'Wo wohnst du? – In Split.', ['Kada', 'Tko', 'Zašto']),
      c('___ si? – Iz Njemačke.', 'Odakle', 'Woher bist du? – Aus Deutschland.', ['Kamo', 'Kada', 'Kako']),
      c('___ dolaziš? – Sutra.', 'Kada', 'Wann kommst du? – Morgen.', ['Gdje', 'Što', 'Tko']),
      c('___ košta kava?', 'Koliko', 'Wie viel kostet der Kaffee?', ['Kako', 'Kada', 'Što']),
      c('___ učiš hrvatski? – Jer volim Hrvatsku.', 'Zašto', 'Warum lernst du Kroatisch? – Weil ich Kroatien liebe.', ['Kako', 'Kada', 'Gdje']),
      c('___ ideš? – Idem u kino.', 'Kamo', 'Wohin gehst du? – Ich gehe ins Kino.', ['Odakle', 'Tko', 'Koliko']),
      c('Govoriš ___ engleski?', 'li', 'Sprichst du Englisch?', ['da', 'ne', 'je']),
      c('Ja ___ govorim talijanski.', 'ne', 'Ich spreche kein Italienisch.', ['ni', 'nije', 'nema']),
      c('___ vremena. (imati, ja)', 'Nemam', 'Ich habe keine Zeit.', ['Ne imam', 'Nisam', 'Neću']),
      c('Ništa ___ razumijem.', 'ne', 'Ich verstehe nichts.', ['li', 'nije', 'da']),
      c('Ona ___ ne pije alkohol.', 'nikad', 'Sie trinkt nie Alkohol.', ['uvijek', 'ništa', 'nitko']),
      d('Govorite li njemački?', 'Sprechen Sie Deutsch?'),
    ],
  },
  {
    id: 'g07', group: 'Grundlagen', title: 'Adjektive & Possessivpronomen', hr: 'Pridjevi i posvojne zamjenice',
    summary: 'dobar – dobra – dobro, moj – moja – moje.',
    html: `
<p>Adjektive und Possessivpronomen richten sich nach dem <b>Geschlecht</b> des Substantivs:</p>
${tbl(['', 'maskulin', 'feminin', 'neutrum'], [
  ['gut', 'dobar', 'dobr<b>a</b>', 'dobr<b>o</b>'],
  ['neu', 'nov', 'nov<b>a</b>', 'nov<b>o</b>'],
  ['mein', 'moj', 'moj<b>a</b>', 'moj<b>e</b>'],
  ['dein', 'tvoj', 'tvoj<b>a</b>', 'tvoj<b>e</b>'],
  ['unser', 'naš', 'naš<b>a</b>', 'naš<b>e</b>'],
  ['euer / Ihr', 'vaš', 'vaš<b>a</b>', 'vaš<b>e</b>'],
])}
${ex([
  ['To je dobar hotel.', 'Das ist ein gutes Hotel.'],
  ['To je dobra kava.', 'Das ist ein guter Kaffee.'],
  ['To je dobro vino.', 'Das ist ein guter Wein.'],
  ['Ovo je moja sestra.', 'Das ist meine Schwester.'],
])}
<p><b>Flüchtiges a:</b> Viele Adjektive verlieren das <b>a</b> der letzten Silbe, sobald eine Endung dazukommt: <span class="say">dobar – dobra</span>, <span class="say">umoran – umorna</span>, <span class="say">hladan – hladno</span>.</p>
<p><b>Weitere Possessiva:</b> njegov (sein), njezin (ihr, Sg.), njihov (ihr, Pl.) – alle mit -a / -o. Nach weichen Konsonanten (j, š, ž, č, ć) steht im Neutrum <b>-e</b> statt -o: <span class="say">moje dijete</span>, <span class="say">naše more</span>.</p>
<p><b>Plural:</b> maskulin -i, feminin -e, neutrum -a: <span class="say">dobri prijatelji</span>, <span class="say">dobre knjige</span>.</p>
${tip('<b>dieser:</b> ovaj (m), ova (f), ovo (n) – <span class="say">Ovaj stan je lijep.</span> <b>Ovo je …</b> / <b>To je …</b> („das ist …“) bleibt immer gleich.')}`,
    ex: [
      c('To je ___ kuća. (lijep)', 'lijepa', 'Das ist ein schönes Haus.', ['lijep', 'lijepo', 'lijepi']),
      c('To je ___ vino. (dobar)', 'dobro', 'Das ist ein guter Wein.', ['dobar', 'dobra', 'dobri']),
      c('Ovo je ___ brat. (moj)', 'moj', 'Das ist mein Bruder.', ['moja', 'moje', 'moji']),
      c('Ovo je ___ sestra. (moj)', 'moja', 'Das ist meine Schwester.', ['moj', 'moje', 'moji']),
      c('___ dijete je malo. (naš)', 'Naše', 'Unser Kind ist klein.', ['Naš', 'Naša', 'Naši']),
      c('Ana je ___. (umoran)', 'umorna', 'Ana ist müde.', ['umoran', 'umorno', 'umorana']),
      c('More je ___. (topao)', 'toplo', 'Das Meer ist warm.', ['topao', 'topla', 'topli']),
      c('Gdje je ___ hotel? (vaš)', 'vaš', 'Wo ist Ihr Hotel?', ['vaša', 'vaše', 'vaši']),
      c('To su ___ prijatelji. (dobar)', 'dobri', 'Das sind gute Freunde.', ['dobar', 'dobre', 'dobra']),
      c('___ žena je liječnica. (njegov)', 'Njegova', 'Seine Frau ist Ärztin.', ['Njegov', 'Njegovo', 'Njegovi']),
      c('Kava je ___. (hladan)', 'hladna', 'Der Kaffee ist kalt.', ['hladan', 'hladno', 'hladana']),
      c('Ovo su ___ knjige. (tvoj)', 'tvoje', 'Das sind deine Bücher.', ['tvoj', 'tvoja', 'tvoji']),
      c('___ stan je lijep. (ovaj)', 'Ovaj', 'Diese Wohnung ist schön.', ['Ova', 'Ovo', 'Ovi']),
    ],
  },
  {
    id: 'g08', group: 'Die Fälle', title: 'Lokativ: wo?', hr: 'Lokativ',
    summary: 'u gradu, u školi, na moru – nach u, na, o.',
    html: `
<p>Der <b>Lokativ</b> steht nur nach Präpositionen – vor allem nach <b>u</b> (in), <b>na</b> (auf, an) und <b>o</b> (über) – und antwortet auf die Frage <b>wo?</b></p>
${tbl(['', 'Nominativ', 'Lokativ', 'Regel'], [
  ['maskulin', 'grad', 'u grad<b>u</b>', '+ -u'],
  ['neutrum', 'more', 'na mor<b>u</b>', '-o / -e → -u'],
  ['feminin', 'škola', 'u škol<b>i</b>', '-a → -i'],
])}
${ex([
  ['Živim u Zagrebu.', 'Ich lebe in Zagreb.'],
  ['Djeca su u školi.', 'Die Kinder sind in der Schule.'],
  ['Mi smo na plaži.', 'Wir sind am Strand.'],
  ['Razgovaramo o filmu.', 'Wir sprechen über den Film.'],
])}
<p><b>Lautwechsel:</b> Bei femininen Wörtern wird vor <b>-i</b> k → c, g → z, h → s: <span class="say">banka – u banci</span>, <span class="say">knjiga – u knjizi</span>.</p>
<p><b>Ländernamen</b> auf -ska sind eigentlich Adjektive und bekommen <b>-oj</b>: <span class="say">u Hrvatskoj</span>, <span class="say">u Njemačkoj</span>.</p>
<p><b>u oder na?</b> <b>u</b> für geschlossene Räume, Städte und Länder; <b>na</b> für Flächen, Inseln, Veranstaltungen und einige feste Orte: <span class="say">na moru</span>, <span class="say">na otoku</span>, <span class="say">na poslu</span>, <span class="say">na trgu</span>, <span class="say">na koncertu</span>.</p>
${tip('<b>Wohin oder wo?</b> Dieselbe Präposition, anderer Fall: <span class="say">Idem u grad.</span> (wohin? → Akkusativ) – <span class="say">Ja sam u gradu.</span> (wo? → Lokativ). Genau wie im Deutschen: „in die Stadt“ – „in der Stadt“.')}`,
    ex: [
      c('Živim u ___. (Zagreb)', 'Zagrebu', 'Ich lebe in Zagreb.', ['Zagreb', 'Zagreba', 'Zagrebom']),
      c('Radim u ___. (škola)', 'školi', 'Ich arbeite in der Schule.', ['škola', 'školu', 'škole']),
      c('Mi smo na ___. (plaža)', 'plaži', 'Wir sind am Strand.', ['plaža', 'plažu', 'plaže']),
      c('Knjiga je na ___. (stol)', 'stolu', 'Das Buch liegt auf dem Tisch.', ['stol', 'stola', 'stolom']),
      c('Novac je u ___. (banka)', 'banci', 'Das Geld ist auf der Bank.', ['banki', 'banku', 'banka']),
      c('Oni su u ___. (Hrvatska)', 'Hrvatskoj', 'Sie sind in Kroatien.', ['Hrvatsku', 'Hrvatska', 'Hrvatske']),
      c('Stanujem u ___. (hotel)', 'hotelu', 'Ich wohne im Hotel.', ['hotel', 'hotela', 'hotelom']),
      c('Večeras smo u ___. (kino)', 'kinu', 'Heute Abend sind wir im Kino.', ['kino', 'kina', 'kinom']),
      c('Ljetujemo na ___. (more)', 'moru', 'Wir verbringen den Sommer am Meer.', ['more', 'mora', 'morem']),
      c('Ona je u ___. (Njemačka)', 'Njemačkoj', 'Sie ist in Deutschland.', ['Njemačku', 'Njemačka', 'Njemačke']),
      c('Razgovaramo o ___. (film)', 'filmu', 'Wir sprechen über den Film.', ['film', 'filma', 'filmom']),
      c('Djeca su u ___. (soba)', 'sobi', 'Die Kinder sind im Zimmer.', ['soba', 'sobu', 'sobe']),
      c('Idem u ___. (grad – wohin?)', 'grad', 'Ich gehe in die Stadt.', ['gradu', 'grada', 'gradom']),
      c('Ja sam u ___. (grad – wo?)', 'gradu', 'Ich bin in der Stadt.', ['grad', 'grada', 'gradom']),
    ],
  },
  {
    id: 'g09', group: 'Die Fälle', title: 'Genitiv: woher? wovon? wessen?', hr: 'Genitiv',
    summary: 'iz Njemačke, čaša vode, nema kruha, bez šećera.',
    html: `
<p>Der <b>Genitiv</b> ist der häufigste Fall nach dem Nominativ. Du brauchst ihn für:</p>
<ul>
<li><b>Herkunft und viele Präpositionen:</b> iz (aus), od (von), do (bis), bez (ohne), kod (bei), blizu (nahe), pored (neben), poslije (nach), prije (vor), ispred (vor, räumlich), iza (hinter)</li>
<li><b>Mengen:</b> čaša vode, kilo jabuka, puno ljudi, malo vremena</li>
<li><b>Besitz:</b> auto mog brata – das Auto meines Bruders</li>
<li><b>„Es gibt kein …“:</b> nema + Genitiv</li>
</ul>
${tbl(['', 'Nominativ', 'Genitiv', 'Regel'], [
  ['maskulin', 'grad', 'grad<b>a</b>', '+ -a'],
  ['neutrum', 'more', 'mor<b>a</b>', '-o / -e → -a'],
  ['feminin', 'voda', 'vod<b>e</b>', '-a → -e'],
])}
${ex([
  ['Ja sam iz Njemačke.', 'Ich bin aus Deutschland.'],
  ['Čašu vode, molim.', 'Ein Glas Wasser, bitte.'],
  ['Nema kruha.', 'Es gibt kein Brot.'],
  ['Kava bez šećera.', 'Kaffee ohne Zucker.'],
])}
<p><b>Plural:</b> Die meisten Wörter enden auf <b>-a</b>: <span class="say">pet gradova</span>, <span class="say">puno žena</span>. Zwischen zwei Endkonsonanten schiebt sich oft ein <b>a</b>: <span class="say">student – studenata</span>, <span class="say">sestra – sestara</span>. Einige enden auf -i: <span class="say">ljudi</span>, <span class="say">sati</span>, <span class="say">mjeseci</span>.</p>
${tip('<b>Unregelmäßig:</b> <span class="say">vrijeme – vremena</span> (Zeit), <span class="say">ime – imena</span> (Name), <span class="say">posao – posla</span> (Arbeit), <span class="say">otac – oca</span> (Vater).')}`,
    ex: [
      c('Ja sam iz ___. (Njemačka)', 'Njemačke', 'Ich bin aus Deutschland.', ['Njemačka', 'Njemačku', 'Njemačkoj']),
      c('Čaša ___, molim. (voda)', 'vode', 'Ein Glas Wasser, bitte.', ['voda', 'vodu', 'vodi']),
      c('Nema ___. (kruh)', 'kruha', 'Es gibt kein Brot.', ['kruh', 'kruhu', 'kruhom']),
      c('Kava bez ___. (šećer)', 'šećera', 'Kaffee ohne Zucker.', ['šećer', 'šećeru', 'šećerom']),
      c('To je auto mog ___. (brat)', 'brata', 'Das ist das Auto meines Bruders.', ['brat', 'bratu', 'bratom']),
      c('Stanujem blizu ___. (more)', 'mora', 'Ich wohne in der Nähe des Meeres.', ['more', 'moru', 'morem']),
      c('Idem do ___. (trg)', 'trga', 'Ich gehe bis zum Platz.', ['trg', 'trgu', 'trgom']),
      c('Kilo ___, molim. (jabuke – Plural)', 'jabuka', 'Ein Kilo Äpfel, bitte.', ['jabuke', 'jabuku', 'jabukama']),
      c('Ja sam kod ___. (prijatelj)', 'prijatelja', 'Ich bin bei einem Freund.', ['prijatelj', 'prijatelju', 'prijateljem']),
      c('Poslije ___ idemo kući. (posao)', 'posla', 'Nach der Arbeit gehen wir nach Hause.', ['posao', 'poslu', 'poslom']),
      c('Šalica ___. (čaj)', 'čaja', 'Eine Tasse Tee.', ['čaj', 'čaju', 'čajem']),
      c('On je iz ___. (Austrija)', 'Austrije', 'Er ist aus Österreich.', ['Austrija', 'Austriju', 'Austriji']),
      c('Nemam ___. (vrijeme)', 'vremena', 'Ich habe keine Zeit.', ['vrijeme', 'vrijema', 'vremenu']),
      c('Hotel je daleko od ___. (grad)', 'grada', 'Das Hotel ist weit von der Stadt entfernt.', ['grad', 'gradu', 'gradom']),
    ],
  },
  {
    id: 'g12', group: 'Grundlagen', title: 'Zahlen & Zählen', hr: 'Brojevi',
    summary: 'jedna kava, dvije kave, pet kava.',
    html: `
<p>Nach Zahlen steht das Substantiv in unterschiedlichen Formen – das ist ungewohnt, folgt aber einer klaren Regel:</p>
${tbl(['Zahl', 'Form', 'maskulin', 'feminin'], [
  ['1', 'Nominativ Singular', 'jedan dan', 'jedna kava'],
  ['2, 3, 4', 'Genitiv Singular', 'dva dan<b>a</b>', 'dvije kav<b>e</b>'],
  ['5 – 20', 'Genitiv Plural', 'pet dan<b>a</b>', 'pet kav<b>a</b>'],
])}
<p><b>1 und 2 haben eigene Formen je Geschlecht:</b> jedan / jedna / jedno und <b>dva</b> (m, n) / <b>dvije</b> (f).</p>
<p>Ab 21 zählt die <b>letzte Ziffer</b>: <span class="say">dvadeset jedan dan</span>, <span class="say">dvadeset dva dana</span>, <span class="say">dvadeset pet dana</span>.</p>
${ex([
  ['Dva piva, molim.', 'Zwei Bier, bitte.'],
  ['Imam tri brata.', 'Ich habe drei Brüder.'],
  ['To košta pet eura.', 'Das kostet fünf Euro.'],
  ['Imam trideset godina.', 'Ich bin dreißig Jahre alt.'],
])}
<p><b>Uhrzeit:</b> <span class="say">Koliko je sati?</span> – <span class="say">Jedan je sat.</span> <span class="say">Dva su sata.</span> <span class="say">Pet je sati.</span> „Um“ heißt <b>u</b>: <span class="say">u osam sati</span>.</p>
${tip('<b>pola devet</b> bedeutet wie im Deutschen „halb neun“, also 8:30.')}
<p><b>Die Zehner:</b> deset, dvadeset, trideset, četrdeset, pedeset, šezdeset, sedamdeset, osamdeset, devedeset, sto. <b>Ordnungszahlen:</b> prvi, drugi, treći, četvrti, peti …</p>`,
    ex: [
      c('jedna ___ (kava)', 'kava', 'ein Kaffee', ['kave', 'kavu', 'kavi']),
      c('dvije ___ (kava)', 'kave', 'zwei Kaffee', ['kava', 'kavu', 'kavi']),
      c('pet ___ (kava)', 'kava', 'fünf Kaffee', ['kave', 'kavu', 'kavi']),
      c('dva ___ (pivo)', 'piva', 'zwei Bier', ['pivo', 'pive', 'pivi']),
      c('tri ___ (dan)', 'dana', 'drei Tage', ['dan', 'dani', 'dane']),
      c('četiri ___ (sat)', 'sata', 'vier Stunden', ['sat', 'sati', 'sate']),
      c('sedam ___ (sat)', 'sati', 'sieben Stunden', ['sat', 'sata', 'sate']),
      c('Imam dva ___. (brat)', 'brata', 'Ich habe zwei Brüder.', ['brat', 'brati', 'brate']),
      c('Imam dvadeset ___. (godina)', 'godina', 'Ich bin zwanzig Jahre alt.', ['godine', 'godinu', 'godini']),
      c('Imam dvadeset dvije ___. (godina)', 'godine', 'Ich bin zweiundzwanzig Jahre alt.', ['godina', 'godinu', 'godini']),
      c('___ sestre (2)', 'dvije', 'zwei Schwestern', ['dva', 'dvoje', 'dvi']),
      c('___ brata (2)', 'dva', 'zwei Brüder', ['dvije', 'dvoje', 'dve']),
      c('To košta pet ___. (euro)', 'eura', 'Das kostet fünf Euro.', ['euro', 'euri', 'eure']),
      m('Wie spät ist „pola osam“?', ['7:30 Uhr', '8:30 Uhr', '8:00 Uhr', '7:15 Uhr']),
      d('Koliko je sati?', 'Wie spät ist es?'),
    ],
  },
  {
    id: 'g21', group: 'Die Fälle', title: 'Wohin? Wo? Woher?', hr: 'Prijedlozi: kamo, gdje, odakle',
    summary: 'u Zagreb – u Zagrebu – iz Zagreba.',
    html: `
<p>Jeder Ort kommt in drei Varianten vor – je nachdem, ob du hingehst, dort bist oder von dort kommst:</p>
${tbl(['', 'wohin?<br><small>Akkusativ</small>', 'wo?<br><small>Lokativ</small>', 'woher?<br><small>Genitiv</small>'], [
  ['u ↔ iz', 'Idem <b>u</b> Zagreb.', 'Ja sam <b>u</b> Zagrebu.', 'Dolazim <b>iz</b> Zagreba.'],
  ['na ↔ s', 'Idem <b>na</b> more.', 'Ja sam <b>na</b> moru.', 'Dolazim <b>s</b> mora.'],
  ['Personen', 'Idem <b>k</b> liječniku.', 'Ja sam <b>kod</b> liječnika.', 'Dolazim <b>od</b> liječnika.'],
])}
<p>Was mit <b>u</b> steht, kommt mit <b>iz</b> zurück; was mit <b>na</b> steht, mit <b>s</b>.</p>
<p><b>Ortsangaben mit Genitiv:</b> ispred (vor), iza (hinter), pored (neben), između (zwischen), blizu (nahe), preko puta (gegenüber): <span class="say">Auto je ispred kuće.</span></p>
<p><b>Zeitangaben:</b></p>
${ex([
  ['Vidimo se u ponedjeljak.', 'Wir sehen uns am Montag. (u + Akkusativ)'],
  ['Radim od osam do četiri.', 'Ich arbeite von acht bis vier. (od … do + Genitiv)'],
  ['Dolazim za tjedan dana.', 'Ich komme in einer Woche. (za + Akkusativ)'],
  ['Bio sam tamo prije godinu dana.', 'Ich war vor einem Jahr dort. (prije + Genitiv)'],
])}
${tip('<b>za</b> (für) und <b>kroz</b> (durch) stehen immer mit Akkusativ: <span class="say">Ovo je za tebe.</span> <b>bez</b> (ohne) immer mit Genitiv: <span class="say">bez mlijeka</span>.')}`,
    ex: [
      c('Idem ___ Zagreb.', 'u', 'Ich fahre nach Zagreb.', ['iz', 'kod', 's']),
      c('Dolazim ___ Zagreba.', 'iz', 'Ich komme aus Zagreb.', ['u', 'na', 'za']),
      c('Idemo ___ more.', 'na', 'Wir fahren ans Meer.', ['iz', 'kod', 'od']),
      c('Vraćamo se ___ mora.', 's', 'Wir kommen vom Meer zurück.', ['u', 'na', 'za']),
      c('Ja sam ___ liječnika.', 'kod', 'Ich bin beim Arzt.', ['u', 'na', 'k']),
      c('Vidimo se ___ ponedjeljak.', 'u', 'Wir sehen uns am Montag.', ['na', 'iz', 'od']),
      c('Radim od osam ___ četiri.', 'do', 'Ich arbeite von acht bis vier.', ['u', 'za', 'iz']),
      c('Auto je ___ kuće. (vor)', 'ispred', 'Das Auto steht vor dem Haus.', ['iza', 'između', 'iz']),
      c('Idem u ___. (trgovina)', 'trgovinu', 'Ich gehe ins Geschäft.', ['trgovini', 'trgovine', 'trgovina']),
      c('Ja sam u ___. (trgovina)', 'trgovini', 'Ich bin im Geschäft.', ['trgovinu', 'trgovine', 'trgovina']),
      c('Dolazim iz ___. (trgovina)', 'trgovine', 'Ich komme aus dem Geschäft.', ['trgovinu', 'trgovini', 'trgovina']),
      c('Kava ___ šećera. (ohne)', 'bez', 'Kaffee ohne Zucker.', ['za', 'kod', 'od']),
      c('Ovo je ___ tebe. (für)', 'za', 'Das ist für dich.', ['bez', 'iz', 'kod']),
      c('Dolazim ___ tjedan dana. (in einer Woche)', 'za', 'Ich komme in einer Woche.', ['u', 'na', 'prije']),
    ],
  },
  {
    id: 'g10', group: 'Die Fälle', title: 'Dativ: wem?', hr: 'Dativ',
    summary: 'Dajem bratu. Sviđa mi se. Hladno mi je.',
    html: `
<p>Der <b>Dativ</b> hat im Singular dieselben Endungen wie der Lokativ: maskulin und neutrum <b>-u</b>, feminin <b>-i</b>.</p>
${ex([
  ['Dajem knjigu bratu.', 'Ich gebe dem Bruder das Buch.'],
  ['Pišem sestri.', 'Ich schreibe der Schwester.'],
  ['Pomažem prijatelju.', 'Ich helfe einem Freund.'],
])}
<p>Viel wichtiger als die Substantive sind die <b>kurzen Dativ-Pronomen</b> – sie stecken in vielen Alltagswendungen:</p>
${tbl(['', 'mir', 'dir', 'ihm', 'ihr', 'uns', 'euch / Ihnen', 'ihnen'], [
  ['Dativ', 'mi', 'ti', 'mu', 'joj', 'nam', 'vam', 'im'],
])}
${ex([
  ['Sviđa mi se Zagreb.', 'Zagreb gefällt mir.'],
  ['Hladno mi je.', 'Mir ist kalt.'],
  ['Žao mi je.', 'Es tut mir leid.'],
  ['Kako ti je?', 'Wie geht es dir?'],
  ['Treba mi pomoć.', 'Ich brauche Hilfe.'],
  ['Drago mi je.', 'Freut mich.'],
])}
<p><b>Verben mit Dativ:</b> pomoći (helfen), dati (geben), reći (sagen), pisati (schreiben), pokazati (zeigen), vjerovati (glauben). <b>Präposition:</b> k / ka (zu): <span class="say">Idem k liječniku.</span></p>
${tip('<b>Achtung:</b> Bei <i>boljeti</i> (wehtun) steht der Akkusativ: <span class="say">Boli me glava.</span> – nicht <s>boli mi</s>.')}`,
    ex: [
      c('Pišem ___. (majka)', 'majci', 'Ich schreibe der Mutter.', ['majki', 'majku', 'majke']),
      c('Dajem knjigu ___. (brat)', 'bratu', 'Ich gebe dem Bruder das Buch.', ['brata', 'brat', 'bratom']),
      c('Pomažem ___. (sestra)', 'sestri', 'Ich helfe der Schwester.', ['sestru', 'sestre', 'sestra']),
      c('Sviđa ___ se Zagreb. (ja)', 'mi', 'Zagreb gefällt mir.', ['me', 'ja', 'mene']),
      c('Je li ___ hladno? (ti)', 'ti', 'Ist dir kalt?', ['te', 'tebe', 'tobom']),
      c('Kako ___ je? (on)', 'mu', 'Wie geht es ihm?', ['ga', 'on', 'joj']),
      c('Treba ___ pomoć. (mi – wir)', 'nam', 'Wir brauchen Hilfe.', ['nas', 'mi', 'vam']),
      c('Žao ___ je. (ja)', 'mi', 'Es tut mir leid.', ['me', 'ja', 'mu']),
      c('Idem k ___. (liječnik)', 'liječniku', 'Ich gehe zum Arzt.', ['liječnika', 'liječnik', 'liječnikom']),
      c('Reci ___ istinu! (ona)', 'joj', 'Sag ihr die Wahrheit!', ['je', 'ju', 'mu']),
      c('Sviđa li ___ se Hrvatska? (vi)', 'vam', 'Gefällt Ihnen Kroatien?', ['vas', 'vi', 'nam']),
      c('Kupujem poklon ___. (prijateljica)', 'prijateljici', 'Ich kaufe einer Freundin ein Geschenk.', ['prijateljicu', 'prijateljice', 'prijateljica']),
      c('Boli ___ glava. (ja)', 'me', 'Ich habe Kopfschmerzen.', ['mi', 'ja', 'mnom']),
      d('Žao mi je.', 'Es tut mir leid.'),
    ],
  },
  {
    id: 'g11', group: 'Die Fälle', title: 'Instrumental: mit wem? womit?', hr: 'Instrumental',
    summary: 's prijateljem, vlakom, kava s mlijekom.',
    html: `
<p>Der <b>Instrumental</b> drückt Begleitung und Mittel aus. Die Endung ist fast immer <b>-om</b>:</p>
${tbl(['', 'Nominativ', 'Instrumental', 'Regel'], [
  ['maskulin / neutrum', 'vlak, mlijeko', 'vlak<b>om</b>, mlijek<b>om</b>', '+ -om'],
  ['nach weichem Konsonant', 'prijatelj, muž', 'prijatelj<b>em</b>, muž<b>em</b>', '+ -em'],
  ['feminin', 'sestra', 'sestr<b>om</b>', '-a → -om'],
])}
<p><b>Mit „s“ – Begleitung:</b> „zusammen mit jemandem oder etwas“.</p>
${ex([
  ['Idem u kino s prijateljem.', 'Ich gehe mit einem Freund ins Kino.'],
  ['Kava s mlijekom, molim.', 'Kaffee mit Milch, bitte.'],
  ['Razgovaram sa sestrom.', 'Ich spreche mit der Schwester.'],
])}
<p>Vor s, š, z, ž und schwierigen Konsonantengruppen wird <b>s</b> zu <b>sa</b>: <span class="say">sa sestrom</span>, <span class="say">sa psom</span>, <span class="say">sa mnom</span>.</p>
<p><b>Ohne Präposition – Mittel und Werkzeug:</b></p>
${ex([
  ['Putujem vlakom.', 'Ich reise mit dem Zug.'],
  ['Pišem olovkom.', 'Ich schreibe mit dem Bleistift.'],
  ['Plaćam karticom.', 'Ich zahle mit Karte.'],
])}
${tip('<b>Pronomen:</b> sa mnom (mit mir), s tobom (mit dir), s njim (mit ihm), s njom (mit ihr), s nama, s vama, s njima. <b>Zeit:</b> <span class="say">vikendom</span> (am Wochenende), <span class="say">ponedjeljkom</span> (montags).')}
<p>Auch nach <b>pod</b> (unter), <b>nad</b> (über), <b>pred</b> (vor), <b>među</b> (zwischen) steht der Instrumental, wenn es um den Ort geht: <span class="say">Mačka je pod stolom.</span></p>`,
    ex: [
      c('Putujem ___. (vlak)', 'vlakom', 'Ich reise mit dem Zug.', ['vlak', 'vlaku', 'vlaka']),
      c('Idem u kino s ___. (prijatelj)', 'prijateljem', 'Ich gehe mit einem Freund ins Kino.', ['prijateljom', 'prijatelja', 'prijatelju']),
      c('Kava s ___. (mlijeko)', 'mlijekom', 'Kaffee mit Milch.', ['mlijeko', 'mlijeka', 'mlijeku']),
      c('Razgovaram sa ___. (sestra)', 'sestrom', 'Ich spreche mit der Schwester.', ['sestru', 'sestri', 'sestre']),
      c('Pišem ___. (olovka)', 'olovkom', 'Ich schreibe mit dem Bleistift.', ['olovku', 'olovki', 'olovka']),
      c('Idemo ___ na more. (auto)', 'autom', 'Wir fahren mit dem Auto ans Meer.', ['auto', 'autu', 'auta']),
      c('Bavim se ___. (sport)', 'sportom', 'Ich treibe Sport.', ['sport', 'sporta', 'sportu']),
      c('Dođi sa ___! (ja)', 'mnom', 'Komm mit mir!', ['mene', 'mi', 'me']),
      c('Idem s ___. (ti)', 'tobom', 'Ich gehe mit dir.', ['tebe', 'ti', 'te']),
      c('Šetam sa ___. (pas)', 'psom', 'Ich gehe mit dem Hund spazieren.', ['pasom', 'psa', 'psu']),
      c('Radim ___. (vikend – am Wochenende)', 'vikendom', 'Ich arbeite am Wochenende.', ['vikend', 'vikenda', 'vikendu']),
      c('Mačka je pod ___. (stol)', 'stolom', 'Die Katze ist unter dem Tisch.', ['stol', 'stola', 'stolu']),
      c('Živim s ___. (muž)', 'mužem', 'Ich lebe mit meinem Mann zusammen.', ['mužom', 'muža', 'mužu']),
      c('Plaćam ___. (kartica)', 'karticom', 'Ich zahle mit Karte.', ['karticu', 'kartici', 'kartice']),
    ],
  },
  {
    id: 'g18', group: 'Verben', title: 'Reflexive Verben & Wortstellung', hr: 'Povratni glagoli i enklitike',
    summary: 'Zovem se … – und warum „se“ immer an zweiter Stelle steht.',
    html: `
<p>Viele Verben haben ein <b>se</b> („sich“) bei sich. Anders als im Deutschen bleibt es für alle Personen gleich:</p>
${ex([
  ['Zovem se Ana.', 'Ich heiße Ana.'],
  ['Kako se zoveš?', 'Wie heißt du?'],
  ['Djeca se igraju.', 'Die Kinder spielen.'],
  ['Bojim se.', 'Ich habe Angst.'],
])}
<p><b>Häufige Verben mit se:</b> zvati se (heißen), osjećati se (sich fühlen), vratiti se (zurückkommen), nadati se (hoffen), sjećati se (sich erinnern), bojati se (sich fürchten), igrati se (spielen), smijati se (lachen), kupati se (baden), nalaziti se (sich befinden), baviti se (sich beschäftigen mit).</p>
<p><b>Die Zweitstellungs-Regel.</b> Kurze, unbetonte Wörtchen – <b>se</b>, <b>li</b>, <b>sam / si / je</b>, <b>ću / ćeš</b>, <b>mi / ti / mu</b>, <b>me / te / ga</b> – stehen immer gleich nach dem ersten Wort oder der ersten Wortgruppe des Satzes:</p>
${ex([
  ['Vratio sam se jučer.', 'Ich bin gestern zurückgekommen.'],
  ['Jučer sam se vratio.', 'Gestern bin ich zurückgekommen.'],
  ['Sviđa mi se.', 'Es gefällt mir.'],
  ['Dao sam mu ga.', 'Ich habe es ihm gegeben.'],
])}
${tip('<b>Reihenfolge, wenn mehrere zusammentreffen:</b> li → Hilfsverb (sam, si, ću …) → Dativ (mi, ti, mu) → Akkusativ (me, te, ga) → se → je. Beispiel: <span class="say">Sviđa li ti se?</span> – Gefällt es dir?')}
<p>Das musst du nicht auswendig lernen: Sprich die Beispielsätze laut nach, dann stellt sich das Gefühl dafür von selbst ein.</p>`,
    ex: [
      c('Kako ___ zoveš?', 'se', 'Wie heißt du?', ['si', 'te', 'ti']),
      c('Zovem ___ Ana.', 'se', 'Ich heiße Ana.', ['me', 'mi', 'sam']),
      m('Wie sagt man „Ich habe Angst“?', ['Bojim se.', 'Se bojim.', 'Bojim me.']),
      m('Wie sagt man „Ich habe es ihm gegeben“?', ['Dao sam mu ga.', 'Dao sam ga mu.', 'Dao mu ga sam.']),
      c('Jučer ___ vratio. (ich bin zurückgekommen)', 'sam se', 'Gestern bin ich zurückgekommen.', ['se sam', 'sam me', 'se je']),
      c('Radujem ___ odmoru.', 'se', 'Ich freue mich auf den Urlaub.', ['me', 'mi', 'si']),
      c('Djeca ___ igraju u parku.', 'se', 'Die Kinder spielen im Park.', ['su', 'si', 'ih']),
      c('Osjećam ___ dobro.', 'se', 'Ich fühle mich gut.', ['me', 'mi', 'sam']),
      m('Wie fragt man „Gefällt es dir?“', ['Sviđa li ti se?', 'Sviđa se li ti?', 'Li ti se sviđa?']),
      c('Hotel ___ nalazi u centru.', 'se', 'Das Hotel befindet sich im Zentrum.', ['je', 'ga', 'si']),
      c('Kada ___ budiš?', 'se', 'Wann wachst du auf?', ['te', 'ti', 'si']),
      m('Welcher Satz ist richtig?', ['Jučer sam se vratio.', 'Jučer vratio sam se.', 'Jučer se vratio sam.']),
      d('Kako se zoveš?', 'Wie heißt du?'),
    ],
  },
  {
    id: 'g13', group: 'Verben', title: 'Perfekt: die Vergangenheit', hr: 'Perfekt',
    summary: 'Radio sam. Bila je. Išli smo.',
    html: `
<p>Für die Vergangenheit brauchst du nur <b>eine</b> Zeitform. Sie besteht aus <b>biti</b> (sam, si, je, smo, ste, su) und dem <b>Partizip</b>, das sich nach Geschlecht und Zahl richtet:</p>
${tbl(['', 'maskulin', 'feminin', 'neutrum'], [
  ['Singular', 'radi<b>o</b>', 'radi<b>la</b>', 'radi<b>lo</b>'],
  ['Plural', 'radi<b>li</b>', 'radi<b>le</b>', 'radi<b>la</b>'],
])}
<p>Bildung: Infinitiv ohne <b>-ti</b> + Endung: <span class="say">gledati – gledao, gledala</span>, <span class="say">biti – bio, bila</span>, <span class="say">imati – imao, imala</span>.</p>
${ex([
  ['Jučer sam radio.', 'Gestern habe ich gearbeitet. (Mann)'],
  ['Jučer sam radila.', 'Gestern habe ich gearbeitet. (Frau)'],
  ['Bili smo na moru.', 'Wir waren am Meer.'],
  ['Jesi li vidio film?', 'Hast du den Film gesehen?'],
  ['Nisam imao vremena.', 'Ich hatte keine Zeit.'],
])}
${tbl(['Infinitiv', 'er', 'sie', 'sie (mehrere)'], [
  ['ići (gehen)', 'išao', 'išla', 'išli'],
  ['doći (kommen)', 'došao', 'došla', 'došli'],
  ['jesti (essen)', 'jeo', 'jela', 'jeli'],
  ['moći (können)', 'mogao', 'mogla', 'mogli'],
  ['reći (sagen)', 'rekao', 'rekla', 'rekli'],
  ['vidjeti (sehen)', 'vidio', 'vidjela', 'vidjeli'],
  ['htjeti (wollen)', 'htio', 'htjela', 'htjeli'],
])}
${tip('<b>Wortstellung:</b> sam, si, je … stehen an zweiter Stelle – <i>Ja sam radio</i> oder <i>Radio sam</i>. Verneint wird mit <b>nisam, nisi, nije …</b>, gefragt mit <b>Jesi li …?</b> In der 3. Person Singular fällt <i>je</i> nach <i>se</i> weg: <span class="say">Vratio se.</span>')}`,
    ex: [
      c('Jučer ___ radio. (ja)', 'sam', 'Gestern habe ich gearbeitet.', ['si', 'je', 'smo']),
      c('Ana je ___ u Splitu. (biti)', 'bila', 'Ana war in Split.', ['bio', 'bilo', 'bili']),
      c('Marko je ___ kavu. (piti)', 'pio', 'Marko hat Kaffee getrunken.', ['pila', 'pili', 'pije']),
      c('Mi smo ___ film. (gledati)', 'gledali', 'Wir haben einen Film geschaut.', ['gledao', 'gledala', 'gledamo']),
      c('Ona je ___ u grad. (ići)', 'išla', 'Sie ist in die Stadt gegangen.', ['išao', 'išli', 'ide']),
      c('On je ___ kasno. (doći)', 'došao', 'Er ist spät gekommen.', ['došla', 'došli', 'doći']),
      c('Što si ___? (reći – zu einem Mann)', 'rekao', 'Was hast du gesagt?', ['rekla', 'rekli', 'reći']),
      c('Prijatelji su ___ pizzu. (jesti)', 'jeli', 'Die Freunde haben Pizza gegessen.', ['jeo', 'jela', 'jedu']),
      c('Petra kaže: „Ja sam ___ knjigu.“ (čitati)', 'čitala', 'Petra sagt: „Ich habe ein Buch gelesen.“', ['čitao', 'čitali', 'čitam']),
      c('Jučer ___ imao vremena. (ja – verneint)', 'nisam', 'Gestern hatte ich keine Zeit.', ['nisi', 'nije', 'ne sam']),
      c('Jeste li ___ u Hrvatskoj? (biti)', 'bili', 'Wart ihr in Kroatien?', ['bio', 'bila', 'bilo']),
      c('Ona je ___ u Zagrebu. (živjeti)', 'živjela', 'Sie hat in Zagreb gelebt.', ['živio', 'živjeli', 'živi']),
      c('On je ___ more. (vidjeti)', 'vidio', 'Er hat das Meer gesehen.', ['vidjela', 'vidjeli', 'vidi']),
      c('Mi ___ kupili kruh.', 'smo', 'Wir haben Brot gekauft.', ['su', 'ste', 'sam']),
      d('Bili smo na moru.', 'Wir waren am Meer.'),
    ],
  },
  {
    id: 'g14', group: 'Verben', title: 'Futur: die Zukunft', hr: 'Futur prvi',
    summary: 'Sutra ću raditi. Neću doći.',
    html: `
<p>Die Zukunft bildest du mit den Kurzformen von <b>htjeti</b> (wollen) und dem <b>Infinitiv</b>:</p>
${tbl(['', 'werde', 'werde nicht', 'Frage'], [
  ['ja', 'ću', 'neću', 'hoću li'],
  ['ti', 'ćeš', 'nećeš', 'hoćeš li'],
  ['on / ona', 'će', 'neće', 'hoće li'],
  ['mi', 'ćemo', 'nećemo', 'hoćemo li'],
  ['vi', 'ćete', 'nećete', 'hoćete li'],
  ['oni', 'će', 'neće', 'hoće li'],
])}
${ex([
  ['Sutra ću raditi.', 'Morgen werde ich arbeiten.'],
  ['Ona će doći u pet.', 'Sie wird um fünf kommen.'],
  ['Neću zakasniti.', 'Ich werde mich nicht verspäten.'],
  ['Hoćeš li doći?', 'Wirst du kommen?'],
])}
<p><b>Wortstellung:</b> ću, ćeš, će … stehen an zweiter Stelle. Beginnt der Satz mit dem Verb, verliert der Infinitiv auf -ti sein <b>-i</b>:</p>
${ex([
  ['Radit ću sutra.', 'Ich werde morgen arbeiten.'],
  ['Vidjet ćemo.', 'Wir werden sehen.'],
  ['Doći ću.', 'Ich werde kommen. (Verben auf -ći bleiben unverändert)'],
])}
${tip('<b>Aussprache:</b> „Radit ću“ wird wie <i>radiću</i> gesprochen – und im Serbischen auch genau so geschrieben: <i>Radiću sutra.</i>')}
<p>Für feste Pläne reicht wie im Deutschen oft das Präsens: <span class="say">Sutra idem u Split.</span></p>`,
    ex: [
      c('Sutra ___ raditi. (ja)', 'ću', 'Morgen werde ich arbeiten.', ['ćeš', 'će', 'ćemo']),
      c('Kada ___ doći? (ti)', 'ćeš', 'Wann wirst du kommen?', ['ću', 'će', 'ćete']),
      c('Ona ___ putovati u Split.', 'će', 'Sie wird nach Split reisen.', ['ću', 'ćeš', 'ćemo']),
      c('Mi ___ učiti hrvatski.', 'ćemo', 'Wir werden Kroatisch lernen.', ['ćete', 'će', 'ću']),
      c('Vi ___ vidjeti more.', 'ćete', 'Ihr werdet das Meer sehen.', ['ćemo', 'će', 'ćeš']),
      c('Oni ___ kupiti kuću.', 'će', 'Sie werden ein Haus kaufen.', ['ćemo', 'ćete', 'ću']),
      c('Ja ___ doći. (verneint)', 'neću', 'Ich werde nicht kommen.', ['ne ću', 'nećeš', 'nisam']),
      c('___ li doći sutra? (ti)', 'Hoćeš', 'Wirst du morgen kommen?', ['Ćeš', 'Hoću', 'Hoće']),
      m('Wie schreibt man im Kroatischen „Ich werde morgen arbeiten“?', ['Radit ću sutra.', 'Raditi ću sutra.', 'Ću raditi sutra.']),
      c('Sutra ___ biti sunčano.', 'će', 'Morgen wird es sonnig.', ['ću', 'ćeš', 'ćemo']),
      c('Mi ___ ići na plažu. (verneint)', 'nećemo', 'Wir werden nicht an den Strand gehen.', ['neće', 'nećete', 'nismo']),
      c('Što ___ raditi sutra? (vi)', 'ćete', 'Was werdet ihr morgen machen?', ['ćemo', 'će', 'ćeš']),
      d('Vidjet ćemo.', 'Wir werden sehen.'),
    ],
  },
  {
    id: 'g15', group: 'Verben', title: 'Modalverben', hr: 'Modalni glagoli',
    summary: 'mogu, moram, želim, smijem + Infinitiv.',
    html: `
<p>Modalverben stehen wie im Deutschen mit dem <b>Infinitiv</b> – nur dass dieser direkt folgt und nicht am Satzende steht:</p>
${tbl(['', 'moći<br><small>können</small>', 'morati<br><small>müssen</small>', 'smjeti<br><small>dürfen</small>', 'željeti<br><small>möchten</small>'], [
  ['ja', 'mogu', 'moram', 'smijem', 'želim'],
  ['ti', 'možeš', 'moraš', 'smiješ', 'želiš'],
  ['on / ona', 'može', 'mora', 'smije', 'želi'],
  ['mi', 'možemo', 'moramo', 'smijemo', 'želimo'],
  ['vi', 'možete', 'morate', 'smijete', 'želite'],
  ['oni', 'mogu', 'moraju', 'smiju', 'žele'],
])}
${ex([
  ['Možete li mi pomoći?', 'Können Sie mir helfen?'],
  ['Moram ići.', 'Ich muss gehen.'],
  ['Ovdje se ne smije pušiti.', 'Hier darf man nicht rauchen.'],
  ['Što želite piti?', 'Was möchten Sie trinken?'],
])}
<p><b>htjeti</b> (wollen): hoću, hoćeš, hoće, hoćemo, hoćete, hoće – verneint <b>neću</b>. <b>znati</b> heißt „können“ im Sinne von „gelernt haben“: <span class="say">Znaš li plivati?</span></p>
${tip('<b>Höflich bestellen:</b> <span class="say">Htio bih kavu.</span> (Mann) / <span class="say">Htjela bih kavu.</span> (Frau) – „Ich hätte gern einen Kaffee.“ Oder: <span class="say">Mogu li dobiti račun?</span>')}
<p><b>Serbisch:</b> Dort steht statt des Infinitivs meist <b>da + Präsens</b>: <span class="say">Moram da radim.</span> statt <span class="say">Moram raditi.</span> Beides wird überall verstanden.</p>`,
    ex: [
      c('___ li mi pomoći? (moći, vi)', 'Možete', 'Können Sie mir helfen?', ['Mogu', 'Možeš', 'Može']),
      c('Ja ___ raditi sutra. (morati)', 'moram', 'Ich muss morgen arbeiten.', ['moraš', 'mora', 'mogu']),
      c('Ne ___ doći danas. (moći, ja)', 'mogu', 'Ich kann heute nicht kommen.', ['možem', 'može', 'moram']),
      c('Što ___ piti? (željeti, ti)', 'želiš', 'Was möchtest du trinken?', ['želim', 'želi', 'žele']),
      c('Ovdje se ne ___ pušiti. (smjeti)', 'smije', 'Hier darf man nicht rauchen.', ['smijem', 'smiju', 'smiješ']),
      c('Mi ___ ići kući. (morati)', 'moramo', 'Wir müssen nach Hause gehen.', ['morate', 'moraju', 'možemo']),
      c('Oni ___ govoriti hrvatski. (moći)', 'mogu', 'Sie können Kroatisch sprechen.', ['može', 'možu', 'možete']),
      c('___ li plivati? (znati, ti)', 'Znaš', 'Kannst du schwimmen?', ['Znam', 'Zna', 'Znate']),
      c('Htio ___ kavu, molim.', 'bih', 'Ich hätte gern einen Kaffee, bitte.', ['sam', 'ću', 'bi']),
      c('Ona ___ učiti. (morati)', 'mora', 'Sie muss lernen.', ['moram', 'moraju', 'može']),
      c('___ li dobiti račun? (moći, ja)', 'Mogu', 'Kann ich die Rechnung bekommen?', ['Možem', 'Može', 'Možeš']),
      c('Ti ne ___ voziti. (smjeti)', 'smiješ', 'Du darfst nicht fahren.', ['smijem', 'smije', 'smiju']),
      d('Možete li mi pomoći?', 'Können Sie mir helfen?'),
    ],
  },
  {
    id: 'g16', group: 'Verben', title: 'Verbaspekt: Verlauf oder Ergebnis?', hr: 'Glagolski vid',
    summary: 'pisati – napisati, kupovati – kupiti.',
    html: `
<p>Fast jedes Verb gibt es zweimal. Das klingt nach doppelter Arbeit, die Idee ist aber einfach:</p>
${tbl(['', 'unvollendet', 'vollendet'], [
  ['Blick auf …', 'Verlauf, Dauer, Wiederholung', 'einmaliges, abgeschlossenes Ergebnis'],
  ['Beispiel', 'Čitao sam knjigu.<br><small>Ich habe (in) einem Buch gelesen.</small>', 'Pročitao sam knjigu.<br><small>Ich habe das Buch durchgelesen.</small>'],
  ['Signalwörter', 'uvijek, često, svaki dan, dugo, dok', 'odjednom, napokon, već, jučer u pet'],
])}
<p><b>Wie entstehen die Paare?</b></p>
<ul>
<li>mit Vorsilbe: <span class="say">pisati – napisati</span>, <span class="say">čitati – pročitati</span>, <span class="say">učiti – naučiti</span>, <span class="say">jesti – pojesti</span>, <span class="say">piti – popiti</span>, <span class="say">gledati – pogledati</span></li>
<li>mit anderem Stamm: <span class="say">kupovati – kupiti</span>, <span class="say">davati – dati</span>, <span class="say">plaćati – platiti</span>, <span class="say">vraćati se – vratiti se</span></li>
<li>ganz verschieden: <span class="say">dolaziti – doći</span>, <span class="say">govoriti – reći</span>, <span class="say">uzimati – uzeti</span></li>
</ul>
${ex([
  ['Svaki dan učim hrvatski.', 'Ich lerne jeden Tag Kroatisch. (Gewohnheit)'],
  ['Naučio sam deset riječi.', 'Ich habe zehn Wörter gelernt. (Ergebnis)'],
  ['Moram kupiti kruh.', 'Ich muss Brot kaufen. (einmal, mit Ziel)'],
])}
${tip('<b>Faustregel:</b> Was <i>gerade jetzt</i> passiert, ist immer unvollendet: <span class="say">Sada pišem.</span> Vollendete Verben beschreiben im Präsens kein „Jetzt“ – sie stehen nach Modalverben, in der Vergangenheit und im Futur.')}
<p>Am Anfang genügt es, die Paare als Vokabeln zu lernen. Das Gefühl für die Wahl kommt mit dem Hören und Lesen.</p>`,
    ex: [
      c('Sada ___ kavu. (jetzt gerade)', 'pijem', 'Ich trinke gerade Kaffee.', ['popijem']),
      c('Jučer sam ___ cijelu knjigu.', 'pročitao', 'Gestern habe ich das ganze Buch durchgelesen.', ['čitao']),
      c('Moram ___ kruh.', 'kupiti', 'Ich muss Brot kaufen.', ['kupovati']),
      c('Dok sam ___ pismo, zazvonio je telefon.', 'pisao', 'Während ich den Brief schrieb, klingelte das Telefon.', ['napisao']),
      c('Napokon sam ___ zadaću.', 'napisao', 'Endlich habe ich die Hausaufgabe fertig geschrieben.', ['pisao']),
      c('Prije smo često ___ u Hrvatsku.', 'dolazili', 'Früher sind wir oft nach Kroatien gekommen.', ['došli']),
      c('Sutra ću ti ___ knjigu.', 'dati', 'Morgen gebe ich dir das Buch.', ['davati']),
      c('Sada ___ večeru. (jetzt gerade)', 'kuham', 'Ich koche gerade das Abendessen.', ['skuham']),
      c('Jesi li već ___ ručak?', 'pojeo', 'Hast du das Mittagessen schon aufgegessen?', ['jeo']),
      c('Cijeli dan sam ___.', 'učio', 'Ich habe den ganzen Tag gelernt.', ['naučio']),
      c('Jučer sam ___ deset novih riječi.', 'naučio', 'Gestern habe ich zehn neue Wörter gelernt.', ['učio']),
      c('Svake subote ___ na tržnici.', 'kupujem', 'Jeden Samstag kaufe ich auf dem Markt ein.', ['kupim']),
      m('Welches Verb ist der vollendete Partner von „pisati“?', ['napisati', 'pisavati', 'opisivati']),
      m('Welches Verb ist der unvollendete Partner von „doći“?', ['dolaziti', 'dođati', 'podoći']),
    ],
  },
  {
    id: 'g17', group: 'Verben', title: 'Imperativ: Aufforderungen', hr: 'Imperativ',
    summary: 'Dođi! Čekaj! Recite! Nemoj!',
    html: `
<p>Den Imperativ leitest du von der <b>oni-Form</b> des Präsens ab:</p>
${tbl(['oni-Form', 'du', 'ihr / Sie', 'Regel'], [
  ['gledaju', 'gledaj!', 'gledajte!', '-aju → -aj'],
  ['govore', 'govori!', 'govorite!', '-e → -i'],
  ['pišu', 'piši!', 'pišite!', '-u → -i'],
  ['piju', 'pij!', 'pijte!', '-ju → -j'],
])}
${ex([
  ['Dođi ovamo!', 'Komm her!'],
  ['Čekaj malo!', 'Warte kurz!'],
  ['Govorite polako, molim.', 'Sprechen Sie bitte langsam.'],
  ['Izvolite sjesti.', 'Nehmen Sie bitte Platz.'],
])}
<p><b>Unregelmäßig und häufig:</b> <span class="say">biti – budi!</span>, <span class="say">ići – idi!</span>, <span class="say">reći – reci!</span>, <span class="say">pomoći – pomozi!</span>, <span class="say">jesti – jedi!</span>, <span class="say">dati – daj!</span>, <span class="say">uzeti – uzmi!</span></p>
<p><b>Verbot:</b> <b>nemoj</b> (du) / <b>nemojte</b> (ihr, Sie) + Infinitiv – oder einfach <b>ne</b> + Imperativ:</p>
${ex([
  ['Nemoj brinuti!', 'Mach dir keine Sorgen!'],
  ['Nemojte pušiti ovdje.', 'Rauchen Sie hier bitte nicht.'],
  ['Ne čekaj me!', 'Warte nicht auf mich!'],
])}
${tip('<b>„Lass uns …“:</b> <span class="say">Idemo!</span> oder <span class="say">Hajdemo!</span> – Gehen wir! <span class="say">Hajde!</span> – Komm schon! / Los!')}`,
    ex: [
      c('___ ovamo! (doći, ti)', 'Dođi', 'Komm her!', ['Dođe', 'Doći', 'Dođite']),
      c('___ malo! (čekati, ti)', 'Čekaj', 'Warte kurz!', ['Čeka', 'Čekati', 'Čekaš']),
      c('___ mi, molim vas! (reći, vi)', 'Recite', 'Sagen Sie mir bitte!', ['Reci', 'Reći', 'Rekli']),
      c('___ polako, molim. (govoriti, vi)', 'Govorite', 'Sprechen Sie bitte langsam.', ['Govori', 'Govore', 'Govoriti']),
      c('___ me! (slušati, ti)', 'Slušaj', 'Hör mir zu!', ['Sluša', 'Slušaš', 'Slušati']),
      c('___ brinuti! (Verbot, ti)', 'Nemoj', 'Mach dir keine Sorgen!', ['Nemam', 'Neću', 'Nije']),
      c('___ dobar! (biti, ti)', 'Budi', 'Sei brav!', ['Biti', 'Jesi', 'Bio']),
      c('___ puno vode! (piti, ti)', 'Pij', 'Trink viel Wasser!', ['Pije', 'Piti', 'Piješ']),
      c('___ mi! (pomoći, ti)', 'Pomozi', 'Hilf mir!', ['Pomoći', 'Pomaže', 'Pomogao']),
      c('___ ravno! (ići, vi)', 'Idite', 'Gehen Sie geradeaus!', ['Idi', 'Idete', 'Ići']),
      c('___ mi! (pisati, ti)', 'Piši', 'Schreib mir!', ['Piše', 'Pisati', 'Pišeš']),
      c('___ mi račun, molim. (dati, vi)', 'Dajte', 'Geben Sie mir bitte die Rechnung.', ['Daj', 'Dati', 'Date']),
      d('Čekaj malo!', 'Warte kurz!'),
    ],
  },
  {
    id: 'g19', group: 'Mehr', title: 'Vergleichen: Komparativ & Superlativ', hr: 'Komparacija pridjeva',
    summary: 'star – stariji – najstariji; dobar – bolji.',
    html: `
<p>Der <b>Komparativ</b> entsteht auf drei Arten:</p>
${tbl(['Endung', 'Beispiele'], [
  ['-iji', '<span class="say">star – stariji</span>, <span class="say">nov – noviji</span>, <span class="say">hladan – hladniji</span>, <span class="say">topao – topliji</span>'],
  ['-ji (mit Lautwechsel)', '<span class="say">mlad – mlađi</span>, <span class="say">skup – skuplji</span>, <span class="say">brz – brži</span>, <span class="say">visok – viši</span>, <span class="say">težak – teži</span>'],
  ['-ši', '<span class="say">lijep – ljepši</span>, <span class="say">lak – lakši</span>, <span class="say">mek – mekši</span>'],
])}
${tbl(['unregelmäßig', 'Komparativ', 'Superlativ'], [
  ['dobar (gut)', 'bolji', 'najbolji'],
  ['loš (schlecht)', 'gori', 'najgori'],
  ['velik (groß)', 'veći', 'najveći'],
  ['mali (klein)', 'manji', 'najmanji'],
])}
<p>Der <b>Superlativ</b> ist einfach <b>naj-</b> + Komparativ: <span class="say">najljepši</span>, <span class="say">najstariji</span>.</p>
<p><b>„als“</b> heißt <b>od</b> + Genitiv oder <b>nego</b>:</p>
${ex([
  ['Zagreb je veći od Splita.', 'Zagreb ist größer als Split.'],
  ['Danas je toplije nego jučer.', 'Heute ist es wärmer als gestern.'],
  ['On je stariji od mene.', 'Er ist älter als ich.'],
  ['Ovo je najbolja kava u gradu.', 'Das ist der beste Kaffee der Stadt.'],
])}
${tip('<b>Nützliche Adverbien:</b> bolje (besser), više (mehr), manje (weniger), brže (schneller), sporije (langsamer) – <span class="say">Možete li govoriti sporije?</span>')}`,
    ex: [
      c('dobar → ___ (Komparativ)', 'bolji', 'gut → besser', ['dobriji', 'dobrije', 'najdobar']),
      c('velik → ___ (Komparativ)', 'veći', 'groß → größer', ['velikiji', 'veliki', 'velji']),
      c('mali → ___ (Komparativ)', 'manji', 'klein → kleiner', ['maliji', 'malji', 'mališi']),
      c('lijep → ___ (Komparativ)', 'ljepši', 'schön → schöner', ['lijepiji', 'lijepši', 'ljepiji']),
      c('star → ___ (Komparativ)', 'stariji', 'alt → älter', ['starši', 'starji', 'stari']),
      c('skup → ___ (Komparativ)', 'skuplji', 'teuer → teurer', ['skupiji', 'skupši', 'skupji']),
      c('loš → ___ (Komparativ)', 'gori', 'schlecht → schlechter', ['lošiji', 'lošji', 'lošši']),
      c('mlad → ___ (Komparativ)', 'mlađi', 'jung → jünger', ['mladiji', 'mladši', 'mlaji']),
      c('Zagreb je ___ od Splita. (velik)', 'veći', 'Zagreb ist größer als Split.', ['velik', 'najveći', 'velikiji']),
      c('Ovo je ___ plaža u Hrvatskoj. (lijep – Superlativ)', 'najljepša', 'Das ist der schönste Strand Kroatiens.', ['ljepša', 'najlijepa', 'lijepa']),
      c('Moj brat je stariji ___ mene.', 'od', 'Mein Bruder ist älter als ich.', ['iz', 'kao', 'za']),
      c('Danas je ___ nego jučer. (toplo)', 'toplije', 'Heute ist es wärmer als gestern.', ['toplo', 'topliji', 'najtoplije']),
      c('To je ___ restoran u gradu. (dobar – Superlativ)', 'najbolji', 'Das ist das beste Restaurant der Stadt.', ['bolji', 'najdobar', 'najdobriji']),
    ],
  },
  {
    id: 'g20', group: 'Die Fälle', title: 'Vokativ: jemanden ansprechen', hr: 'Vokativ',
    summary: 'Gospodine! Gospođo! Ivane! Prijatelju!',
    html: `
<p>Wenn du jemanden direkt ansprichst, bekommt die Anrede eine eigene Form – den <b>Vokativ</b>, den siebten Fall:</p>
${tbl(['', 'Nominativ', 'Vokativ', 'Regel'], [
  ['maskulin', 'gospodin, Ivan', 'gospodin<b>e</b>! Ivan<b>e</b>!', '+ -e'],
  ['nach weichem Konsonant', 'prijatelj', 'prijatelj<b>u</b>!', '+ -u'],
  ['feminin auf -a', 'gospođa, sestra', 'gospođ<b>o</b>! sestr<b>o</b>!', '-a → -o'],
  ['feminin auf -ica', 'gospođica', 'gospođic<b>e</b>!', '-ica → -ice'],
])}
${ex([
  ['Dobar dan, gospodine Horvat!', 'Guten Tag, Herr Horvat!'],
  ['Hvala, doktore!', 'Danke, Herr Doktor!'],
  ['Oprostite, gospođo!', 'Entschuldigen Sie, meine Dame!'],
  ['Dragi prijatelju!', 'Lieber Freund!'],
])}
<p><b>Lautwechsel</b> vor -e: k → č, g → ž, h → š: <span class="say">čovjek – čovječe!</span>, <span class="say">Bog – Bože!</span></p>
${tip('<b>Entspannt bleiben:</b> Bei Vornamen bleibt im Alltag oft einfach der Nominativ – <i>Ana!</i>, <i>Marko!</i> Wichtig sind vor allem <b>gospodine</b> und <b>gospođo</b> sowie Anreden in Briefen und Mails: <span class="say">Poštovani gospodine</span>, <span class="say">Poštovana gospođo</span>.')}`,
    ex: [
      c('Dobar dan, ___! (gospodin)', 'gospodine', 'Guten Tag, mein Herr!', ['gospodin', 'gospodina', 'gospodinu']),
      c('Dobro jutro, ___! (gospođa)', 'gospođo', 'Guten Morgen, meine Dame!', ['gospođa', 'gospođe', 'gospođu']),
      c('Hvala, ___! (doktor)', 'doktore', 'Danke, Herr Doktor!', ['doktor', 'doktora', 'doktoru']),
      c('Bok, ___! (prijatelj)', 'prijatelju', 'Hallo, mein Freund!', ['prijatelje', 'prijatelja', 'prijateljem']),
      c('Oprostite, ___! (profesor)', 'profesore', 'Entschuldigen Sie, Herr Professor!', ['profesor', 'profesora', 'profesoru']),
      c('___, dođi! (Ivan)', 'Ivane', 'Ivan, komm!', ['Ivana', 'Ivanu', 'Ivano']),
      c('Hvala ti, ___! (sestra)', 'sestro', 'Danke dir, Schwester!', ['sestra', 'sestre', 'sestru']),
      c('___, pomozi! (Bog)', 'Bože', 'Gott, hilf!', ['Boge', 'Boga', 'Bogu']),
    ],
  },
  {
    id: 'g22', group: 'Mehr', title: 'Kroatisch, Serbisch, Bosnisch & Kyrillisch', hr: 'Hrvatski, srpski, bosanski',
    summary: 'Eine Sprache, mehrere Standards, zwei Schriften.',
    html: `
<p>Kroatisch, Serbisch, Bosnisch und Montenegrinisch sind Standardvarianten <b>einer</b> gemeinsamen Sprache – früher „Serbokroatisch“ genannt. Die Unterschiede sind etwa so groß wie zwischen dem Deutsch in Deutschland, Österreich und der Schweiz: Wer eine Variante lernt, versteht alle. Diese App lehrt die <b>kroatische</b> Variante und zeigt dir bei Wörtern die serbische Form, wenn sie abweicht.</p>
<p><b>1. ije / je wird zu e</b> (in Kroatien, Bosnien und Montenegro „ijekavisch“, in Serbien meist „ekavisch“):</p>
${tbl(['Kroatisch', 'Serbisch', 'Deutsch'], [
  ['mlijeko', 'mleko', 'Milch'],
  ['lijep', 'lep', 'schön'],
  ['vrijeme', 'vreme', 'Zeit / Wetter'],
  ['gdje', 'gde', 'wo'],
  ['dijete', 'dete', 'Kind'],
])}
<p><b>2. Einige Wörter sind verschieden:</b></p>
${tbl(['Kroatisch', 'Serbisch', 'Deutsch'], [
  ['kruh', 'hleb', 'Brot'],
  ['vlak', 'voz', 'Zug'],
  ['tjedan', 'nedelja / sedmica', 'Woche'],
  ['kava', 'kafa', 'Kaffee'],
  ['juha', 'supa', 'Suppe'],
  ['tisuća', 'hiljada', 'tausend'],
  ['zračna luka', 'aerodrom', 'Flughafen'],
  ['tko / što', 'ko / šta', 'wer / was'],
  ['siječanj, veljača …', 'januar, februar …', 'Monatsnamen'],
])}
<p><b>3. Kleine Unterschiede im Satzbau:</b> Kroatisch <span class="say">Želim spavati.</span> – Serbisch <span class="say">Želim da spavam.</span> Fragen: <span class="say">Je li …?</span> – <span class="say">Da li …?</span></p>
<p><b>4. Die Schrift.</b> Kroatisch wird nur lateinisch geschrieben. In Serbien, Montenegro und Bosnien ist auch die <b>kyrillische Schrift</b> üblich. Jeder lateinische Buchstabe hat genau eine kyrillische Entsprechung – du kannst sie in ein paar Tagen lesen lernen:</p>
${tbl(['', '', '', '', '', ''], [
  ['А а = a', 'Б б = b', 'В в = v', 'Г г = g', 'Д д = d', 'Ђ ђ = đ'],
  ['Е е = e', 'Ж ж = ž', 'З з = z', 'И и = i', 'Ј ј = j', 'К к = k'],
  ['Л л = l', 'Љ љ = lj', 'М м = m', 'Н н = n', 'Њ њ = nj', 'О о = o'],
  ['П п = p', 'Р р = r', 'С с = s', 'Т т = t', 'Ћ ћ = ć', 'У у = u'],
  ['Ф ф = f', 'Х х = h', 'Ц ц = c', 'Ч ч = č', 'Џ џ = dž', 'Ш ш = š'],
])}
${tip('<b>Falsche Freunde für die Augen:</b> В = v, Н = n, Р = r, С = s, У = u, Х = h. In den Einstellungen kannst du die kyrillische Schreibweise bei jedem Wort einblenden.')}`,
    ex: [
      m('Was steht hier: хвала', ['hvala', 'xbana', 'hbala', 'kvala']),
      m('Was steht hier: добар дан', ['dobar dan', 'dobap dah', 'gobar gan', 'dovar dan']),
      m('Welche Stadt ist das: Београд', ['Beograd', 'Belgorod', 'Bjelovar', 'Betina']),
      m('Was steht hier: ресторан', ['restoran', 'pectopah', 'rektoran', 'restorah']),
      m('Was steht hier: пиво', ['pivo', 'nibo', 'pibo', 'nivo']),
      m('„hleb“ ist serbisch für …', ['kruh (Brot)', 'sir (Käse)', 'sol (Salz)', 'kolač (Kuchen)']),
      m('„voz“ ist serbisch für …', ['vlak (Zug)', 'auto (Auto)', 'brod (Schiff)', 'put (Weg)']),
      m('Welche Form ist ekavisch (serbisch)?', ['mleko', 'mlijeko', 'mljeko']),
      m('Wie lautet „Šta radiš?“ im kroatischen Standard?', ['Što radiš?', 'Ko radiš?', 'Čto radiš?']),
      m('Welcher kyrillische Buchstabe entspricht „š“?', ['ш', 'с', 'ж', 'ч']),
      m('Welcher kyrillische Buchstabe entspricht „n“?', ['н', 'п', 'и', 'њ']),
    ],
  },
];
