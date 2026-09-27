import { useState } from "react";
import { CloudDownload, CheckCircle2, Trash2, Loader2, HardDriveDownload } from "lucide-react";
import { useOfflineStorage } from "@/hooks/use-offline-storage";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { playClickSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export const OfflineMaterialButton = ({ url, className }: { url: string; className?: string }) => {
  const { isCached, saveToOffline, removeFromOffline, isSupported } = useOfflineStorage();
  const { lang } = useI18n();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isSupported) return null;

  const cached = isCached(url);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSfx();
    
    if (cached) {
      const removed = await removeFromOffline(url);
      if (removed) {
        toast.success(lang === "ar" ? "تم الحذف من الذاكرة المحلية" : "Removed from offline storage");
      }
    } else {
      setIsDownloading(true);
      setProgress(0);
      try {
        const success = await saveToOffline(url, (pct) => setProgress(pct));
        if (success) {
          toast.success(lang === "ar" ? "تم الحفظ للمشاهدة بدون إنترنت بنجاح!" : "Saved for offline viewing successfully!");
        } else {
          toast.error(lang === "ar" ? "فشل الحفظ. تأكد من اتصالك بالإنترنت." : "Failed to save. Check your connection.");
        }
      } finally {
        setIsDownloading(false);
      }
    }
  };

  if (isDownloading) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs text-primary px-2 py-1 bg-primary/10 rounded-full", className)}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="font-mono">{progress}%</span>
      </div>
    );
  }

  if (cached) {
    return (
      <div className={cn("flex items-center gap-[1px]", className)}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            playClickSfx();
            window.open(url, "_blank");
          }}
          className="flex items-center gap-1.5 text-xs text-emerald-500 hover:bg-emerald-500/20 px-2 py-1 bg-emerald-500/10 rounded-s-full transition-all cursor-pointer"
          title={lang === "ar" ? "تصفح الملف أوفلاين" : "View Offline"}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{lang === "ar" ? "تصفح" : "View"}</span>
        </button>
        <button
          onClick={handleToggle}
          className="flex items-center text-xs text-emerald-500 hover:text-destructive hover:bg-destructive/10 px-2 py-1 bg-emerald-500/10 rounded-e-full transition-all cursor-pointer"
          title={lang === "ar" ? "حذف من الذاكرة المحلية" : "Remove from offline storage"}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={cn("flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 px-2 py-1 bg-secondary/50 rounded-full transition-all cursor-pointer", className)}
      title={lang === "ar" ? "حفظ للمشاهدة بدون إنترنت" : "Save for offline viewing"}
    >
      <HardDriveDownload className="w-3.5 h-3.5" />
      <span>{lang === "ar" ? "تنزيل" : "Save"}</span>
    </button>
  );
};
