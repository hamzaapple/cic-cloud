import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, BellRing } from "lucide-react";
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
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

const NotificationBell = () => {
  const { lang } = useI18n();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const handleClick = async () => {
    if (permission === "unsupported") {
      toast({
        title: lang === "ar" ? "غير مدعوم" : "Unsupported",
        description: lang === "ar"
          ? "متصفحك لا يدعم الإشعارات. ثبّت التطبيق كـ PWA أولاً."
          : "Your browser doesn't support notifications. Install the PWA first.",
        variant: "destructive",
      });
      return;
    }

    if (permission === "denied") {
      toast({
        title: lang === "ar" ? "الإشعارات مرفوضة" : "Notifications blocked",
        description: lang === "ar"
          ? "افتح إعدادات المتصفح وفعّل الإشعارات لهذا الموقع."
          : "Open your browser settings and allow notifications for this site.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setBusy(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe().catch(() => undefined);
      }
      const vapidPublicKey = await getVapidPublicKey();
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const sub = subscription.toJSON();
      const { error } = await supabase.from("push_subscriptions" as any).upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: sub.keys?.p256dh || null,
          auth: sub.keys?.auth || null,
          user_agent: navigator.userAgent,
          department: "all",
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        console.error("Subscription save failed:", error);
      }

      toast({
        title: lang === "ar" ? "تم تفعيل الإشعارات ✓" : "Notifications enabled ✓",
        description: lang === "ar" ? "هتوصلك التنبيهات الجديدة." : "You'll receive new alerts.",
      });
    } catch (err) {
      console.error("Notification subscribe error:", err);
      toast({
        title: lang === "ar" ? "فشل التفعيل" : "Failed",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const Icon = permission === "granted" ? BellRing : permission === "denied" ? BellOff : Bell;
  const tooltip = lang === "ar"
    ? permission === "granted" ? "الإشعارات مفعّلة" : "تفعيل الإشعارات"
    : permission === "granted" ? "Notifications on" : "Enable notifications";

  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={busy}
        className={`p-2 rounded-lg bg-secondary text-secondary-foreground ${
          permission === "granted" ? "text-primary" : ""
        }`}
        aria-label={tooltip}
      >
        <Icon className="w-4 h-4" />
      </motion.button>
      <span className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-2 py-1 rounded-md bg-popover text-popover-foreground border border-border shadow opacity-0 group-hover:opacity-100 transition-opacity">
        {tooltip}
      </span>
    </div>
  );
};

export default NotificationBell;
