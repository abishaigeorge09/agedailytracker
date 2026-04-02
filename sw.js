const CACHE_NAME = 'ageg-hub-session';

// Install: activate immediately, no pre-caching
self.addEventListener('install', () => self.skipWaiting());

// Activate: claim clients, clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first, cache only as offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok && event.request.method === 'GET') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});

// Push notifications from server
self.addEventListener('push', (event) => {
  let data = { title: 'AGEG Hub', body: 'You have an upcoming event on your schedule' };
  if (event.data) {
    try { data = event.data.json(); } catch { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'AGEG Hub', {
      body: data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'ageg-push',
      data: data.url || '/'
    })
  );
});

// Notification click: open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(event.notification.data || '/');
    })
  );
});

// Messages from the page
self.addEventListener('message', (event) => {
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
  if (event.data === 'FORCE_UPDATE') {
    self.registration.update();
  }
});
