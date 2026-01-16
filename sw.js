// Change the v9 to v10 to force your phone to update!
const CACHE_NAME = "microlearn-bio-v31"; 

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./theme.css",
  "./base.css",
  "./modes.css",
  "./components.css",
  "./script.js",
  "./manifest.json"
];

// Install the Service Worker
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Force update immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Clean up old versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// Serve files
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});