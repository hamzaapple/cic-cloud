// CIC Cloud Service Worker — Push Notifications + Offline PWA
// =============================================================
// Strategy:
//   • App Shell (HTML/CSS/JS/fonts/images): Cache-First with background update
//   • Supabase REST API: Network-First with cache fallback (stale data when offline)
//   • Supabase Storage (PDFs/videos): Cache-First (immutable files)
//   • Offline materials: Managed by cic-offline-materials-v1 cache (separate)
// =============================================================

const APP_SHELL_CACHE = "cic-app-shell-v2";
const API_CACHE = "cic-api-data-v1";
const FONT_CACHE = "cic-fonts-v1";
const IMAGE_CACHE = "cic-images-v1";
// Note: cic-offline-materials-v1 is managed by the app via Cache API directly

// ─── Install: Pre-cache critical app shell ──────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll([
        "/",
        "/logo.png",
        "/favicon.ico",
      ]).catch((err) => {
        console.warn("[SW] Pre-cache partial fail (non-critical):", err);
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate: Clean old caches, claim clients ─────────────────────────────
self.addEventListener("activate", (event) => {
  const KEEP = [APP_SHELL_CACHE, API_CACHE, FONT_CACHE, IMAGE_CACHE, "cic-offline-materials-v1"];
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => !KEEP.includes(name))
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: Offline-capable routing ─────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (POST, PATCH, DELETE, etc.)
  if (event.request.method !== "GET") return;

  // Skip chrome-extension, devtools, etc.
  if (!url.protocol.startsWith("http")) return;

  // ── 1) Supabase REST API calls → Network-First ──
  if (url.hostname.includes("supabase.co") && url.pathname.startsWith("/rest/")) {
    event.respondWith(networkFirstWithCache(event.request, API_CACHE, 5000));
    return;
  }

  // ── 2) Supabase Storage (already-cached materials) → Cache-First ──
  if (url.hostname.includes("supabase.co") && url.pathname.includes("/storage/")) {
    event.respondWith(cacheFirstWithNetwork(event.request, "cic-offline-materials-v1"));
    return;
  }

  // ── 3) Google Fonts CSS & font files → Cache-First (long-lived) ──
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirstWithNetwork(event.request, FONT_CACHE));
    return;
  }

  // ── 4) Same-origin navigation (HTML pages) → Network-First ──
  if (event.request.mode === "navigate") {
    event.respondWith(
      networkFirstWithCache(event.request, APP_SHELL_CACHE, 3000)
        .then((response) => response || caches.match("/") || new Response("Offline", { status: 503 }))
    );
    return;
  }

  // ── 5) Same-origin static assets (JS/CSS/images) → Stale-While-Revalidate ──
  if (url.origin === self.location.origin) {
    // Hashed assets (/assets/xxx.abc123.js) → Cache-First (immutable)
    if (url.pathname.startsWith("/assets/")) {
      event.respondWith(cacheFirstWithNetwork(event.request, APP_SHELL_CACHE));
      return;
    }
    // Images
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)) {
      event.respondWith(cacheFirstWithNetwork(event.request, IMAGE_CACHE));
      return;
    }
    // Everything else same-origin → Stale-While-Revalidate
    event.respondWith(staleWhileRevalidate(event.request, APP_SHELL_CACHE));
    return;
  }
});

// ─── Caching Strategies ─────────────────────────────────────────────────────

/**
 * Network-First with cache fallback.
 * Tries network with a timeout; falls back to cache if offline or slow.
 */
async function networkFirstWithCache(request, cacheName, timeoutMs = 4000) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // Network failed or timed out → try cache
    const cached = await cache.match(request);
    if (cached) {
      console.log("[SW] Serving from cache (offline):", request.url);
      return cached;
    }
    // Nothing in cache either
    return null;
  }
}

/**
 * Cache-First with network fallback.
 * Great for immutable assets (hashed JS/CSS, fonts, already-downloaded materials).
 */
async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const cache = await caches.open(cacheName);
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    return null;
  }
}

/**
 * Stale-While-Revalidate.
 * Returns cached version immediately, fetches update in background.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
}

// ═══════════════════════════════════════════════════════════════════════════
// Push Notification Handler
// ═══════════════════════════════════════════════════════════════════════════
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("[SW] Push received with no data");
    return;
  }

  let title = "CIC Cloud 🎓";
  let body = "";
  let icon = "/logo.png";
  let badge = "/logo.png";
  let url = "/";

  try {
    const data = event.data.json();
    title = data.title || title;
    body = data.message || data.body || "";
    if (data.icon) icon = data.icon;
    if (data.link) url = data.link;
    if (data.data && data.data.url) url = data.data.url;
  } catch {
    // Fallback: treat as plain text
    body = event.data.text();
  }

  const options = {
    body,
    icon,
    badge,
    tag: "cic-notification-" + Date.now(),
    renotify: true,
    data: { url },
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: false,
    actions: [
      { action: "open", title: "فتح الموقع 🌐" },
      { action: "dismiss", title: "إغلاق ✕" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── Notification Click Handler ────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          client.navigate && client.navigate(targetUrl);
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ─── Push Subscription Change (handles expiry/key rotation) ──────────────
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed — notifying clients to re-subscribe");
  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "PUSH_SUBSCRIPTION_CHANGED" });
      });
    })
  );
});
