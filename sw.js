const CACHE_NAME = 'nong-jaidee-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'ChatGPT Image 24 เม.ย. 2569 21_18_08.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});