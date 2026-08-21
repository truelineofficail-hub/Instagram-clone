// Service worker for Instagram Clone (GitHub Pages)
// Scope: /Instagram-clone/

const CACHE_NAME = "insta-clone-cache-v1";
const BASE = "/Instagram-clone/";

// Core files to pre-cache. Add/remove page paths as your site grows.
const PRECACHE_URLS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "pages/feed.html",
  BASE + "pages/chat.html",
  BASE + "pages/search.html",
  BASE + "pages/profile.html",
  BASE + "pages/pain.html",
  BASE + "pages/konan.html",
  BASE + "pages/obito.html",
  BASE + "pages/itachi.html",
  BASE + "pages/kisame.html",
  BASE + "pages/hidan.html",
  BASE + "pages/deidara.html",
  BASE + "pages/kakuzo.html",
  BASE + "pages/sasori.html",
  BASE + "pages/zetsu.html"
];

// Install: pre-cache core pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll fails entirely if one URL 404s, so add individually
      // and ignore failures for any missing/renamed pages.
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("Skipping precache for", url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
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

// Fetch: cache-first for images, network-first (with cache fallback) for pages
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests within this site's scope
  if (request.method !== "GET" || !request.url.includes(BASE)) {
    return;
  }

  const isImage = request.destination === "image";

  if (isImage) {
    // Cache-first for images (pfp/post images rarely change)
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
        );
      })
    );
  } else {
    // Network-first for HTML/CSS/JS so updates show up, fall back to cache offline
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(BASE + "index.html")))
    );
  }
});
