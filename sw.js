const CACHE_NAME = 'malomerdo-elszamolo-v3';
const SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Csak az app-héjat (html/manifest/ikon) kezeljük itt; a Supabase-hívások mindig a hálózatra mennek.
// Network-first: mindig próbál frisset hozni, csak hálózathiba esetén esik vissza a cache-re.
// Így egy GitHub-szerkesztés után nem szolgálunk ki elavult manifestet/HTML-t.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
