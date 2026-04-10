import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";

const InstallPrompt = () => {
  const { t } = useI18n();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Show if not dismissed recently (in the last 24 hours)
    const dismissedAt = localStorage.getItem("install_prompt_dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after delay
      setTimeout(() => setShowPrompt(true), 2500);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show manual instructions after delay
    if (isIOSDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast({ title: t("install.success"), description: "✓" });
      }
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("install_prompt_dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-6 right-6 md:bottom-6 md:right-auto md:left-6 md:w-96 z-50"
        >
          <div className="glass-card rounded-2xl p-6 border border-primary/20 shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">
                {t("install.title")}
              </h3>
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {isIOS ? t("install.iosMessage") : t("install.message")}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDismiss} className="flex-1">
                {t("install.later")}
              </Button>
              {isIOS ? (
                <Button onClick={handleDismiss} className="flex-1 bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  {t("install.gotIt")}
                </Button>
              ) : (
                <Button onClick={handleInstall} className="flex-1 bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  {t("install.btn")}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
