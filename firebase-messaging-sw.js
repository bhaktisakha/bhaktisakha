// Firebase Messaging Service Worker — handles background push notifications
// This file MUST be at the root of your site (same level as Bhakti_Sakha.html)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
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

  // If Dismiss was tapped, just close and do nothing
  if (event.action === 'dismiss') {
    return;
  }

  // "Open App" button or tapping the notification body itself
  const urlToOpen = event.notification.data?.url || './Bhakti_Sakha.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes('Bhakti_Sakha') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(urlToOpen);
    })
  );
});