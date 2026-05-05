import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register custom push SW alongside vite-pwa service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw-push.js")
    .then(async () => {
      const { ensurePushSubscription } = await import("./lib/push-resubscribe");
      ensurePushSubscription();
    })
    .catch((err) => {
      console.log("Push SW registration failed:", err);
    });

  navigator.serviceWorker.addEventListener("message", async (event) => {
    if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGED") {
      const { ensurePushSubscription } = await import("./lib/push-resubscribe");
      ensurePushSubscription();
    }
  });
}

