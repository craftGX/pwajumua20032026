const CACHE_NAME = "salawat-pwa-v1";
const OFFLINE_URLS = ["/", "/stats", "/manifest.json", "/icon-192.png", "/icon-512.png"];

// Installation : on essaie de pré-cacher, mais on ignore les erreurs individuelles
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const url of OFFLINE_URLS) {
        try {
          const response = await fetch(url, { cache: "no-cache" });
          if (response.ok) {
            await cache.put(url, response.clone());
          } else {
            console.warn("[SW] Échec cache pour", url, "status", response.status);
          }
        } catch (err) {
          console.warn("[SW] Erreur lors du fetch pour", url, err);
        }
      }

      // forcer l'activation immédiate de ce SW
      self.skipWaiting();
    })(),
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      self.clients.claim();
    })(),
  );
});

// Fetch : cache-first simple
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => caches.match("/"));
    }),
  );
});
