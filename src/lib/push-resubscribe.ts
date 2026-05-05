import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

async function getVapidPublicKey(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("send-push", { method: "GET" } as any);
    if (error || !data?.publicKey) return null;
    return data.publicKey as string;
  } catch {
    return null;
  }
}

async function saveSubscription(sub: PushSubscription) {
  const json = sub.toJSON();
  // upsert on endpoint to avoid duplicate rows for the same device
  await supabase
    .from("push_subscriptions" as any)
    .upsert(
      {
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh || null,
        auth: json.keys?.auth || null,
        user_agent: navigator.userAgent,
        department: localStorage.getItem("cic_push_dept") || "all",
      },
      { onConflict: "endpoint" }
    );
}

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
        applicationServerKey: expectedKey,
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
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) return;
    const expectedKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();
    let renewed = false;

    if (subscription) {
      const current = new Uint8Array(subscription.options.applicationServerKey || new ArrayBuffer(0));
      const same =
        current.length === expectedKey.length &&
        current.every((b, i) => b === expectedKey[i]);
      if (same) return; // already valid, do nothing
      await subscription.unsubscribe().catch(() => undefined);
      renewed = true;
    } else {
      renewed = true;
    }

    subscription = await subscribeWithRetry(registration, expectedKey);
    await saveSubscription(subscription);
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
