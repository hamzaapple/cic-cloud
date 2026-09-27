import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Service Worker: only /sw-push.js (handles push + PWA). Clean any legacy /sw.js.
if ("serviceWorker" in navigator) {
  (async () => {
    try {
      // 1) Unregister any legacy service workers that aren't our push SW
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        const url = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
        if (url && !url.endsWith("/sw-push.js")) {
          console.log("[SW] Unregistering legacy SW:", url);
          await reg.unregister().catch(() => undefined);
        }
      }

      // 2) Register our push-capable SW
      const reg = await navigator.serviceWorker.register("/sw-push.js", { scope: "/" });
      reg.update().catch(() => undefined);

      // 3) Ensure subscription is valid
      const { ensurePushSubscription } = await import("./lib/push-resubscribe");
      ensurePushSubscription({ silent: true });
    } catch (err) {
      console.warn("[SW] Setup failed:", err);
    }
  })();

  // Reload when a new Service Worker takes control
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  navigator.serviceWorker.addEventListener("message", async (event) => {
    if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGED") {
      const { ensurePushSubscription } = await import("./lib/push-resubscribe");
      ensurePushSubscription({ silent: true });
    }
  });
}
