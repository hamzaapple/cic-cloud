import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

async function getVapidPublicKey() {
  const { data, error } = await supabase.functions.invoke("send-push", { method: "GET" } as any);
  if (error || !data?.publicKey) throw error || new Error("Missing VAPID public key");
  return data.publicKey as string;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) out[i] = rawData.charCodeAt(i);
  return out;
}

const DENIED_KEY = "cic_push_denied_at";
const ASKED_KEY = "cic_push_asked";

const NotificationPrompt = () => {
  const { lang } = useI18n();

  useEffect(() => {
    const run = async () => {
      try {
        if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

        // Already granted: just ensure subscription saved
        if (Notification.permission === "granted") {
          await ensureSubscribed();
          return;
        }
        if (Notification.permission === "denied") return;

        // Don't re-ask within 7 days if user previously denied/dismissed
        const askedAt = parseInt(localStorage.getItem(DENIED_KEY) || "0", 10);
        if (askedAt && Date.now() - askedAt < 7 * 24 * 60 * 60 * 1000) return;

        // Wait a bit so we don't startle on first paint
        await new Promise((r) => setTimeout(r, 2500));

        localStorage.setItem(ASKED_KEY, "1");
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          await ensureSubscribed();
          toast({
            title: lang === "ar" ? "تم تفعيل الإشعارات ✓" : "Notifications enabled ✓",
            description: lang === "ar" ? "هتوصلك التنبيهات الجديدة." : "You'll receive new alerts.",
          });
        } else {
          localStorage.setItem(DENIED_KEY, String(Date.now()));
        }
      } catch (err) {
        console.warn("[Push] auto-prompt failed:", err);
      }
    };

    const ensureSubscribed = async () => {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = await getVapidPublicKey();
      const expectedKey = urlBase64ToUint8Array(vapidPublicKey);
      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const current = new Uint8Array(subscription.options.applicationServerKey || new ArrayBuffer(0));
        const same = current.length === expectedKey.length && current.every((b, i) => b === expectedKey[i]);
        if (!same) {
          await subscription.unsubscribe().catch(() => undefined);
          subscription = null;
        }
      }

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: expectedKey.buffer.slice(0) as ArrayBuffer,
        });
      }

      const json = subscription.toJSON();
      await supabase.from("push_subscriptions" as any).upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: json.keys?.p256dh || null,
          auth: json.keys?.auth || null,
          user_agent: navigator.userAgent,
          department: localStorage.getItem("cic_push_dept") || "all",
        },
        { onConflict: "endpoint" } as any
      );
    };

    run();
  }, [lang]);

  return null;
};

export default NotificationPrompt;
