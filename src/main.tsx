import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register custom push SW alongside vite-pwa service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw-push.js").catch((err) => {
    console.log("Push SW registration failed:", err);
  });
}

