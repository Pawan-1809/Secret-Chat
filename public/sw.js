// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push message received:', event);
  
  let notificationData = {
    title: 'Secret Chat',
    body: 'You have a new message',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'secret-chat-message',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open Chat',
        icon: '/icon-32x32.png'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationData
  );

  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const promiseChain = clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    });

    event.waitUntil(promiseChain);
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
