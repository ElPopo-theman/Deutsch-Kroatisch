// Service Worker: macht die App offline nutzbar.
// Alle Dateien werden beim ersten Besuch gespeichert und danach sofort aus dem Speicher geliefert;
// im Hintergrund wird nach neuen Fassungen gesucht, die beim nächsten Start aktiv sind.
// Bei jeder Veröffentlichung die Versionsnummer erhöhen (gleicher Wert wie in js/version.js).

const VERSION = 'bok-1.1.0';

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/app.js',
  'js/content.js',
  'js/learning.js',
  'js/session.js',
  'js/speech.js',
  'js/srs.js',
  'js/store.js',
  'js/ui.js',
  'js/util.js',
  'js/version.js',
  'js/data/vocab.js',
  'js/data/grammar.js',
  'js/data/dialogues.js',
  'js/views/home.js',
  'js/views/course.js',
  'js/views/practice.js',
  'js/views/audio.js',
  'js/views/grammar.js',
  'js/views/more.js',
  'icons/favicon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  // cache: 'reload' holt jede Datei frisch vom Server statt aus dem Zwischenspeicher des Browsers.
  const fresh = FILES.map((file) => new Request(file, { cache: 'reload' }));
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(fresh)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || fresh;
    }),
  );
});
