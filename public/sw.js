/// <reference lib="webworker" />

const CACHE_NAME = "vqm-v1";
const QUESTION_CACHE = "vqm-questions-v1";

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  "/dashboard",
  "/quiz",
  "/profil",
  "/reviser",
  "/leaderboard",
  "/premium",
  "/manifest.json",
];

// API routes that hold question data — cache aggressively
const QUESTION_API_PATTERNS = [
  "/api/questions/random",
  "/api/questions/daily",
  "/api/categories",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== QUESTION_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Question API: network-first, cache fallback for offline
  if (QUESTION_API_PATTERNS.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(networkFirstThenCache(event.request, QUESTION_CACHE));
    return;
  }

  // Navigation & static: stale-while-revalidate
  if (event.request.mode === "navigate" || event.request.destination === "script" || event.request.destination === "style") {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME));
    return;
  }
});

// Network first: try network, cache result, fall back to cache if offline
async function networkFirstThenCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "Offline", questions: [] }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Stale-while-revalidate: serve from cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}
