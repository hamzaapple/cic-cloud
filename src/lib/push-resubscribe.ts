import { toast } from "@/hooks/use-toast";
import { getVapidPublicKey, registerPushSubscription, urlBase64ToUint8Array } from "@/lib/push-registration";

const lang = () => (typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "ar");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function subscribeWithRetry(
  registration: ServiceWorkerRegistration,
  expectedKey: Uint8Array,
  attempts = 4
): Promise<PushSubscription> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      if (!navigator.onLine && i === 0) {
        await new Promise<void>((res) => {
          const handler = () => { window.removeEventListener("online", handler); res(); };
          window.addEventListener("online", handler);
          setTimeout(res, 5000);
        });
      }
      return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: expectedKey.buffer.slice(0) as ArrayBuffer,
      });
    } catch (err) {
      lastErr = err;
      const delay = Math.min(1000 * 2 ** i, 8000); // 1s, 2s, 4s, 8s
      console.warn(`[Push] subscribe failed (attempt ${i + 1}/${attempts}), retrying in ${delay}ms`, err);
      await sleep(delay);
    }
  }
  throw lastErr;
}

/**
 * Ensures a valid push subscription exists, matching the current VAPID key.
 * Auto re-subscribes silently if expired/missing/mismatched, with retry + toast feedback.
 */
export async function ensurePushSubscription(opts: { silent?: boolean } = {}) {
  const isAr = lang() === "ar";
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = await getVapidPublicKey().catch(() => null);
    if (!vapidPublicKey) return;
    const expectedKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();
    let renewed = false;

    if (subscription) {
      const current = new Uint8Array(subscription.options.applicationServerKey || new ArrayBuffer(0));
      const same =
        current.length === expectedKey.length &&
        current.every((b, i) => b === expectedKey[i]);
      if (same) {
        await registerPushSubscription(subscription);
        return;
      }
      await subscription.unsubscribe().catch(() => undefined);
      renewed = true;
    } else {
      renewed = true;
    }

    subscription = await subscribeWithRetry(registration, expectedKey);
    await registerPushSubscription(subscription);
    console.log("[Push] Auto re-subscribed successfully");

    if (renewed && !opts.silent) {
      toast({
        title: isAr ? "تم تجديد الإشعارات ✓" : "Notifications renewed ✓",
        description: isAr ? "اشتراكك تحدّث تلقائيًا." : "Your subscription was refreshed automatically.",
      });
    }
  } catch (err) {
    console.warn("[Push] Auto re-subscribe failed:", err);
    if (!opts.silent) {
      toast({
        title: isAr ? "فشل تجديد الإشعارات" : "Failed to renew notifications",
        description: isAr ? "اضغط الجرس 🔔 لإعادة المحاولة." : "Tap the bell 🔔 to retry.",
        variant: "destructive",
      });
    }
  }
}
