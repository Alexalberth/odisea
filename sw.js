// Service worker de Odisea (generado por scripts/build-pages.mjs; no editar a mano).
const VERSION = "odisea-54df0d84f3b1";
const PRECACHE = ["./","./iconos/apple-touch-icon.png","./iconos/favicon-32.png","./iconos/icono-192.png","./iconos/icono-512.png","./iconos/icono-mascara-512.png","./index.html","./manifest.webmanifest"];
const FUENTES = 'odisea-fuentes';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION && k !== FUENTES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Las APIs de Google (Calendar, Drive) nunca pasan por la caché.
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    e.respondWith(
      caches.open(FUENTES).then(async (c) => {
        const hit = await c.match(req);
        const red = fetch(req).then((r) => (r.ok && c.put(req, r.clone()), r)).catch(() => hit);
        return hit || red;
      }),
    );
    return;
  }
  if (url.origin !== self.location.origin) return;
  // Páginas: primero la red (para recibir versiones nuevas); sin señal, la copia.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
    return;
  }
  // Archivos con hash en el nombre: la copia primero.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
