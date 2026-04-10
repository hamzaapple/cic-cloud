// CIC Cloud Service Worker — Push Notifications + Background Sync

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Push Notification Handler ─────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("[SW] Push received with no data");
    return;
  }

  let title = "CIC Cloud 🎓";
  let body = "";
  let icon = "/icons/icon-192x192.png";
  let badge = "/icons/icon-72x72.png";
  let url = "/";

  try {
    const data = event.data.json();
    title = data.title || title;
    body = data.message || data.body || "";
    if (data.icon) icon = data.icon;
    if (data.link) url = data.link;
  } catch {
    // Fallback: treat as plain text
    body = event.data.text();
  }

  const options = {
    body,
    icon,
    badge,
    tag: "cic-notification",       // Replace previous notification instead of stacking
    renotify: true,                  // Still vibrate/ring even if tag matches
    data: { url },
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: false,       // Auto-dismiss after a while (better UX)
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
      // If the app is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          client.navigate && client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ─── Push Subscription Change (handles key rotation) ──────────────────────
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed — re-subscribing...");
  // The app will handle re-subscription on next load
});
