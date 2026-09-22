// sw.js - Service Worker para Guerrero Ninja 3D (Soporte Offline e Instalación PWA)
const CACHE_NAME = 'guerrero-ninja-v5.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css?v=5.0',
  './lib/three.module.js',
  './lib/peerjs.min.js',
  './js/main.js?v=5.0',
  './js/player.js',
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
  // Red primero, con respaldo de caché
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
