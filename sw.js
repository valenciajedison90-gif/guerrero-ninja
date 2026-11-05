// sw.js - Service Worker para Ninja Colombia Arena (Soporte Offline e Instalación PWA)
const CACHE_NAME = 'ninja-colombia-v20.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css?v=20.0',
  './lib/three.module.js',
  './lib/peerjs.min.js',
  './js/main.js?v=20.0',
  './js/core/levelManager.js',
  './js/core/resourceManager.js',
  './js/core/gameLoop.js',
  './js/campaign.js?v=20.0',
  './js/player.js?v=20.0',
  './js/characters.js?v=20.0',
  './js/enemies.js?v=20.0',
  './js/world.js?v=20.0',
  './js/touch.js?v=20.0',
  './js/weapons.js?v=20.0',
  './js/particles.js?v=20.0',
  './js/sound.js?v=20.0',
  './js/storage.js?v=20.0',
  './js/multiplayer.js?v=20.0',
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

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});
