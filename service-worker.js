/* Anwar Lebanon — network-first service worker
   Versioned so GitHub Pages picks up UI/JS updates immediately. */
const CACHE_NAME = 'anwar-lebanon-2026-09-07-51';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: 'no-store' });
      if (fresh && fresh.ok) {
        const copy = fresh.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
      }
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
