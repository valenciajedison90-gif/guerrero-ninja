// sw.js - Service Worker para Ninja Colombia Arena (Soporte Offline e Instalación PWA)
const CACHE_NAME = 'ninja-colombia-v20.1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css?v=20.1',
  './lib/three.module.js',
  './lib/peerjs.min.js',
  './js/core/textureGenerator.js?v=20.1',
  './js/main.js?v=20.1',
  './js/core/levelManager.js',
  './js/core/resourceManager.js',
  './js/core/gameLoop.js',
  './js/core/objectPool.js',
  './js/systems/performanceMonitor.js',
  './js/config/bossConfig.js',
  './js/systems/bossAI.js',
  './js/campaign.js?v=20.1',
  './js/player.js?v=20.1',
  './js/characters.js?v=20.1',
  './js/enemies.js?v=20.1',
  './js/world.js?v=20.1',
  './js/touch.js?v=20.1',
  './js/weapons.js?v=20.1',
  './js/particles.js?v=20.1',
  './js/sound.js?v=20.1',
  './js/storage.js?v=20.1',
  './js/multiplayer.js?v=20.1',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Algunos recursos no se pudieron precachear:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones WebRTC / PeerJS de señalización
  if (event.request.url.includes('peerjs') && event.request.url.includes('http')) {
    return;
  }

  // Para peticiones de navegación (HTML principal), consultar red primero siempre para no quedar atrapado en caché obsoleta
  if (event.request.mode === 'navigate' || event.request.url.endsWith('index.html') || event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
