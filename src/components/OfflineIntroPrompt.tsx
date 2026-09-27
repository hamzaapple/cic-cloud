import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HardDriveDownload, X, WifiOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useOfflineStorage } from "@/hooks/use-offline-storage";

const LS_KEY = "cic_offline_intro_seen";

const OfflineIntroPrompt = () => {
  const { lang } = useI18n();
  const { totalSize, formatSize, cachedItems, isSupported } = useOfflineStorage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    // Show only once — after the user has been on the site for 5 seconds
    const seen = localStorage.getItem(LS_KEY);
    if (seen) return;

    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [isSupported]);

  const dismiss = () => {
    localStorage.setItem(LS_KEY, Date.now().toString());
    setShow(false);
  };

  if (!isSupported) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-50"
        >
          <div className="glass-card rounded-2xl p-6 border border-primary/20 shadow-2xl relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-500 to-cyan-500" />

            <button
              onClick={dismiss}
              className="absolute top-3 end-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                <HardDriveDownload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-foreground">
                  {lang === "ar" ? "📲 جديد! شغّل بدون إنترنت" : "📲 New! Work Offline"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "ar" ? "حمّل المحاضرات وافتحها في أي وقت" : "Download lectures and open them anytime"}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{lang === "ar"
                  ? "دوس على زرار \"تنزيل\" جنب أي محاضرة أو فيديو عشان تحفظه على جهازك"
                  : "Tap the \"Save\" button next to any lecture or video to store it on your device"}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <WifiOff className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>{lang === "ar"
                  ? "حتى لو فصل النت — افتح الأبلكيشن وهتلاقي كل حاجة نزلتها شغالة عادي!"
                  : "Even without internet — open the app and everything you saved will work!"}</span>
              </div>
            </div>

            {/* Storage info if any */}
            {totalSize > 0 && (
              <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 rounded-lg px-3 py-2 mb-4">
                <HardDriveDownload className="w-3.5 h-3.5" />
                <span>{lang === "ar"
                  ? `عندك ${cachedItems.length} ملف محفوظ (${formatSize(totalSize)})`
                  : `You have ${cachedItems.length} file(s) saved (${formatSize(totalSize)})`}</span>
              </div>
            )}

            <Button onClick={dismiss} className="w-full bg-primary hover:bg-primary/90">
              {lang === "ar" ? "تمام، فهمت! 👍" : "Got it! 👍"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIntroPrompt;
