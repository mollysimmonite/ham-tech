// Offline support: keeps a copy of the site so it opens with no signal.
// Serves the saved copy straight away and refreshes it in the background, so a new deploy shows up on the next visit.
// If you add a file the page loads, add it to FILES too.
const CACHE = "ham-tech-v1";
const FILES = [
  "./", "index.html", "css/style.css", "js/app.js", "manifest.webmanifest",
  "data/t1.js", "data/t2.js", "data/t3.js", "data/t4.js", "data/t5.js",
  "data/t6.js", "data/t7.js", "data/t8.js", "data/t9.js", "data/t0.js",
  "img/figure-t1.png", "img/figure-t2.png", "img/figure-t3.png",
  "img/icon-192.png", "img/icon-512.png", "img/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !fonts) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === "navigate" && await c.match("./"));
    const fresh = fetch(req).then(res => {
      if (res.ok || res.type === "opaque") c.put(req, res.clone());
      return res;
    }).catch(() => hit);
    if (hit) { e.waitUntil(fresh); return hit; }
    return fresh;
  }));
});
