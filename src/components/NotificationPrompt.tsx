import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const VAPID_PUBLIC_KEY = "BKZRratAiVsA6zZo4zLJhuN8Q0EDuIPU9e2rpTkvQgUYs4NKB3CEra1BhQALPzzjovuh0fJxEwHBzuY2hd5NJhE";

const NotificationPrompt = () => {
  const { t } = useI18n();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [hasNotificationAPI, setHasNotificationAPI] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState("all");

  useEffect(() => {
    const isIos = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
    const isIosStandalone = (window.navigator as any).standalone === true;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || isIosStandalone;
    setIsPWA(isStandalone);

    const hasAPI = "Notification" in window && "serviceWorker" in navigator;
    setHasNotificationAPI(hasAPI);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Show every 10 visits
    const visitCount = parseInt(localStorage.getItem("cic_visit_count") || "0", 10) + 1;
    localStorage.setItem("cic_visit_count", visitCount.toString());
    const shouldShowByVisit = visitCount % 10 === 1; // Show on 1st, 11th, 21st...

    // Only show the notification prompt if the device actually supports Notifications (hasAPI).
    // If it doesn't support it, the InstallPrompt is already doing its job to tell them to install first.
    if (hasAPI && shouldShowByVisit) {
      const permission = Notification.permission;
      if (permission === "default") {
        const timer = setTimeout(() => setShowPrompt(true), 1500);
        return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", handleBeforeInstall); };
      }
    }

    return () => { window.removeEventListener("beforeinstallprompt", handleBeforeInstall); };
  }, []);

  const handleEnable = async () => {
    if (!hasNotificationAPI) { handleInstallPWA(); return; }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        if ("serviceWorker" in navigator && "PushManager" in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            const { error } = await supabase.from("push_subscriptions").insert({
              endpoint: subscription.endpoint,
              p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
              auth: arrayBufferToBase64(subscription.getKey("auth")),
              user_agent: navigator.userAgent,
              department: selectedDept,
            });

            if (error) console.error("Failed to save subscription:", error);
          } catch (pushError) {
            console.log("Push subscription not available:", pushError);
          }
        }
        toast({ title: t("push.granted"), description: "✓" });
      } else {
        toast({ title: t("push.denied"), variant: "destructive" });
      }
    } catch (error) {
      console.error("Notification permission error:", error);
    }
    setShowPrompt(false);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") toast({ title: t("push.granted"), description: "✓" });
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
    sessionStorage.setItem("notif_prompt_shown", "true");
  };

  const handleCancel = () => { sessionStorage.setItem("notif_prompt_shown", "true"); setShowPrompt(false); };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  function arrayBufferToBase64(buffer: ArrayBuffer | null) {
    if (!buffer) return null;
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
  }

  const showInstallMessage = !hasNotificationAPI && !isPWA;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50">
          <div className="glass-card rounded-2xl p-6 border border-primary/20 shadow-2xl">
            <button onClick={handleCancel} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                {showInstallMessage ? <Download className="w-6 h-6 text-primary" /> : <Bell className="w-6 h-6 text-primary" />}
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">{t("push.enableTitle")}</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              {t("push.enableMessage")}
            </p>
            
            <div className="mb-4">
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-full bg-secondary/50">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأقسام (CS & AI)</SelectItem>
                  <SelectItem value="cs">علوم الحاسب (CS)</SelectItem>
                  <SelectItem value="ai_cyber">الذكاء الاصطناعي والأمن السيبراني</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel} className="flex-1">{t("push.cancel")}</Button>
              <Button onClick={handleEnable} className="flex-1 bg-primary hover:bg-primary/90">
                {t("push.enable")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;
