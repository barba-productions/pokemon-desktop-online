const CACHE_NAME = "pokemon-desktop-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/play.html",
  "/leaderboard.html",
  "/account.html",
  "/css/style.css",
  "/js/i18n.js",
  "/js/firebase-config.js",
  "/js/firebase.js",
  "/js/footer.js",
  "/js/index.js",
  "/js/game.js",
  "/js/leaderboard.js",
  "/js/account.js",
  "/js/pokemon-names.js",
  "/assets/logo-240.png",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});