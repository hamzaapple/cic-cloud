import { supabase } from "@/integrations/supabase/client";

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
  await supabase.from("push_subscriptions" as any).insert({
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh || null,
    auth: json.keys?.auth || null,
    user_agent: navigator.userAgent,
    department: localStorage.getItem("cic_push_dept") || "all",
  });
}

/**
 * Ensures the user has a valid push subscription matching the current VAPID key.
 * Silently re-subscribes if expired, missing, or mismatched. Runs on every app load.
 */
export async function ensurePushSubscription() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) return;
    const expectedKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();

    // Check if existing subscription matches current VAPID key
    if (subscription) {
      const current = new Uint8Array(subscription.options.applicationServerKey || new ArrayBuffer(0));
      const same =
        current.length === expectedKey.length &&
        current.every((b, i) => b === expectedKey[i]);
      if (same) return; // already valid
      await subscription.unsubscribe().catch(() => undefined);
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: expectedKey,
    });
    await saveSubscription(subscription);
    console.log("[Push] Auto re-subscribed successfully");
  } catch (err) {
    console.warn("[Push] Auto re-subscribe failed:", err);
  }
}
