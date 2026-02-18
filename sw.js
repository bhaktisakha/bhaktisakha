// Bhakti Sakha - Service Worker for PWA
const CACHE_NAME = 'bhakti-sakha-v2';
const STATIC_ASSETS = [
  './',
  './Bhakti_Sakha.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

const FONT_CACHE = 'bhakti-sakha-fonts-v1';
const DYNAMIC_CACHE = 'bhakti-sakha-dynamic-v1';

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== FONT_CACHE && key !== DYNAMIC_CACHE)
            .map(key => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: Network-first for API calls, Cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and Google API calls (Drive sync needs fresh tokens)
  if (event.request.method !== 'GET') return;
  if (url.hostname.includes('googleapis.com') && url.pathname.includes('/drive/')) return;
  if (url.hostname.includes('accounts.google.com')) return;
  if (url.hostname.includes('script.google.com') || url.hostname.includes('script.googleusercontent.com')) return;

  // Google Fonts: Cache-first (fonts rarely change)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache => {
        return cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Static assets: Cache-first, fallback to network
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        // Return cached version, but also update cache in background
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        }).catch(() => cached); // If network fails, rely on cache

        return cached || fetchPromise;
      })
    );
    return;
  }
});

// Listen for messages from the app
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
