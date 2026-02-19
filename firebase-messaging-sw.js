// Firebase Messaging Service Worker — handles background push notifications
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Force immediate activation — no waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

firebase.initializeApp({
  apiKey: "AIzaSyDEgka4rqL6_HNMWERzzggcmv0YlVVoUT8",
  authDomain: "bhaktisakhaapp1.firebaseapp.com",
  projectId: "bhaktisakhaapp1",
  storageBucket: "bhaktisakhaapp1.firebasestorage.app",
  messagingSenderId: "246206438622",
  appId: "1:246206438622:web:cbf20d06941eb82b87364f"
});
const messaging = firebase.messaging();

// Handle background messages (when app is not in foreground)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Background message:', payload);
  const title = payload.notification?.title || payload.data?.title || '🙏 Bhakti Sakha';
  const body = payload.notification?.body || payload.data?.body || 'You have a reminder';
  const icon = payload.data?.icon || './icon-192x192.png';
  const options = {
    body: body,
    icon: icon,
    badge: './icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'bhakti-sakha-reminder',
    data: {
      url: payload.data?.url || './Bhakti_Sakha.html'
    },
    actions: [
      { action: 'dismiss', title: 'Dismiss' },
      { action: 'open', title: 'Open App' }
    ]
  };
  return self.registration.showNotification(title, options);
});

// Handle notification click — Dismiss or Open App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || './Bhakti_Sakha.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('Bhakti_Sakha') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});