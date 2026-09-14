const CACHE_NAME = 'malomerdo-elszamolo-v1';
const SHELL = ["start_url":"./index.html", './manifest.json', './icon-192.png', './icon-512.png'];

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

// Csak az app-héjat gyorsítótárazzuk; a Supabase-hívások mindig a hálózatra mennek
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // Supabase kérések: nincs cache
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
