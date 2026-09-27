import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const { lang } = useI18n();

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/90 text-amber-950 text-sm font-medium backdrop-blur-md shadow-lg"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>{lang === "ar" ? "أنت غير متصل بالإنترنت — الموقع يعمل من الذاكرة المحلية" : "You're offline — browsing from local cache"}</span>
        </motion.div>
      )}
      {showReconnected && !isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500/90 text-emerald-950 text-sm font-medium backdrop-blur-md shadow-lg"
        >
          <Wifi className="w-4 h-4 shrink-0" />
          <span>{lang === "ar" ? "تم الاتصال بالإنترنت مجدداً ✓" : "Back online ✓"}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
