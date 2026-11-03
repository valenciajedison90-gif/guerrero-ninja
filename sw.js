// sw.js - Service Worker para Ninja Colombia Arena (Soporte Offline e Instalación PWA)
const CACHE_NAME = 'ninja-colombia-arena-v10.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css?v=10.0',
  './lib/three.module.js',
  './lib/peerjs.min.js',
  './js/main.js?v=10.0',
  './js/campaign.js',
  './js/player.js',
  './js/characters.js',
  './js/enemies.js',
  './js/world.js',
  './js/touch.js',
  './js/weapons.js',
  './js/particles.js',
  './js/sound.js',
  './js/storage.js',
  './js/multiplayer.js',
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
        return caches.match(event.request);
      })
  );
});
