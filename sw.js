const CACHE_NAME = "simple-ehr-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.webmanifest",
  "/register-sw.js",
  "/src/app.mjs",
  "/src/app-render.mjs",
  "/src/app-state.mjs",
  "/src/mock-data.mjs",
  "/icons/icon.svg",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cacheResults = await Promise.allSettled(APP_SHELL.map((asset) => cache.add(asset)));
      const failedAssets = cacheResults
        .map((result, index) => ({ result, asset: APP_SHELL[index] }))
        .filter(({ result }) => result.status === "rejected");

      if (failedAssets.length > 0) {
        console.warn("Some assets failed to precache", failedAssets.map(({ asset }) => asset));
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status >= 400) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
