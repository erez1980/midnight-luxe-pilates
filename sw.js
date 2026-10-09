// Retired: the app (and its service worker) moved to ./app/. This file stays
// at the old location only so browsers that registered the root worker pick
// up this version, drop the old caches, and unregister — otherwise the old
// worker would keep serving the app shell in place of the new marketing site.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
  );
});
