// Firebase Messaging Service Worker — handles background push notifications

// Force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle push directly for full control
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json().data || event.data.json();
  } catch(e) {
    try { data = event.data.json(); } catch(e2) {}
  }

  const title = data.title || '🙏 Bhakti Sakha';
  const body = data.body || 'You have a reminder';

  const options = {
    body: body,
    icon: './icon-192x192.png',
    badge: './icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'bhakti-sakha-reminder',
    actions: [
      { action: 'open', title: 'Open App' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    // Must call waitUntil to prevent Chrome's default open behavior
    event.waitUntil(Promise.resolve());
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('Bhakti_Sakha') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('https://bhaktisakha.github.io/bhaktisakha/Bhakti_Sakha.html');
    })
  );
});