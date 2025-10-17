const CACHE_NAME = 'bodzin-generator-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app-modular.js',
  '/modules/audio-engine.js',
  '/modules/automation-manager.js',
  '/modules/midi-handler.js',
  '/modules/status-manager.js',
  '/modules/storage-manager.js',
  '/modules/timeline-renderer.js',
  '/modules/ui-controls.js',
  '/modules/mobile-gestures.js',
  '/utils/constants.js',
  '/utils/helpers.js',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.39/Tone.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync any offline changes when connection is restored
  console.log('Background sync triggered');
}
