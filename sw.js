// Bump the version to force PWAs to update on phones.
const CACHE_NAME = "microlearn-bio-v47";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./theme.css",
  "./base.css",
  "./modes.css",
  "./components.css",
  "./script.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : undefined)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
