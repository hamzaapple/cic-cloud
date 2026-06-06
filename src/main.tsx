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
      await navigator.serviceWorker.register("/sw-push.js", { scope: "/" });

      // 3) Ensure subscription is valid
      const { ensurePushSubscription } = await import("./lib/push-resubscribe");
      ensurePushSubscription();
    } catch (err) {
      console.warn("[SW] Setup failed:", err);
    }
  })();

  navigator.serviceWorker.addEventListener("message", async (event) => {
    if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGED") {
      const { ensurePushSubscription } = await import("./lib/push-resubscribe");
      ensurePushSubscription();
    }
  });
}
