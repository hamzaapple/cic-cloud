self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || "New Notification",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: {
        url: data.link || "/",
      },
      vibrate: [200, 100, 200],
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "CIC Cloud", options)
    );
  } catch (error) {
    console.error("Error processing push event:", error);
    
    // Fallback for plain text parsing
    const plainText = event.data.text();
    event.waitUntil(
      self.registration.showNotification("CIC Cloud Notification", {
        body: plainText,
        icon: "/icons/icon-192x192.png"
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(event.notification.data.url) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});
