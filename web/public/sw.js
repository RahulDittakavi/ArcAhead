/* ArcAhead service worker — offline support, no dependencies.

   Strategy:
   - SPA navigations  → network-first, fall back to the cached app shell ("/"),
     so launching offline still renders the app.
   - /api/* GETs      → network-first, fall back to the last cached response, so
     previously-viewed arcs/episodes/crew work offline (the data is the user's
     own progress + static KB).
   - static assets    → stale-while-revalidate (instant from cache, refreshed in
     the background).
   Bump CACHE to invalidate everything on the next deploy. */
const CACHE = "arcahead-v3";
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cachePut(request, response) {
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((c) => c.put(request, copy));
  }
  return response;
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/uploads/") ||
    /\.(?:js|css|png|jpe?g|webp|svg|woff2?|ico|webmanifest)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (fonts) go to network

  // SPA shell
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          cachePut("/", res); // keep the shell fresh
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || caches.match(req)))
    );
    return;
  }

  // API: network-first, cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req)
        .then((res) => cachePut(req, res))
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static assets: stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => cachePut(req, res))
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
