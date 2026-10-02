import { useState, useRef } from "react";
import { HardDriveDownload, Loader2, CheckCircle2, X } from "lucide-react";
import { useOfflineStorage } from "@/hooks/use-offline-storage";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { playClickSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface BulkOfflineDownloadButtonProps {
  urls: string[];
  className?: string;
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  label?: { ar: string; en: string };
}

export const BulkOfflineDownloadButton = ({ 
  urls, 
  className, 
  variant = "outline",
  size = "sm",
  label
}: BulkOfflineDownloadButtonProps) => {
  const { isSupported, saveMultipleToOffline, isCached } = useOfflineStorage();
  const { lang } = useI18n();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, pct: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isSupported) return null;

  // Filter out URLs that are already cached
  const uncachedUrls = urls.filter(url => !isCached(url));
  const isAllCached = urls.length > 0 && uncachedUrls.length === 0;
  const isEmpty = urls.length === 0;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClickSfx();
    
    if (isAllCached) {
      toast.info(lang === "ar" ? "جميع الملفات متاحة أوفلاين بالفعل" : "All files are already available offline");
      return;
    }

    setIsDownloading(true);
    setProgress({ completed: 0, total: uncachedUrls.length, pct: 0 });
    
    abortControllerRef.current = new AbortController();
    
    try {
      const success = await saveMultipleToOffline(
        uncachedUrls, 
        (completed, total, pct) => setProgress({ completed, total, pct }),
        abortControllerRef.current.signal
      );
      
      if (success) {
        toast.success(lang === "ar" ? "تم تحميل الملفات للعمل بدون إنترنت!" : "Files downloaded for offline use!");
      } else if (!abortControllerRef.current.signal.aborted) {
        toast.error(lang === "ar" ? "حدث خطأ أثناء التحميل. يرجى التحقق من اتصالك." : "Error downloading. Please check your connection.");
      }
    } catch (err) {
      console.error("Bulk download failed:", err);
    } finally {
      setIsDownloading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClickSfx();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info(lang === "ar" ? "تم إلغاء التحميل" : "Download cancelled");
    }
  };

  const defaultLabelAr = "تحميل الكل أوفلاين";
  const defaultLabelEn = "Download All Offline";

  if (isDownloading) {
    return (
      <div className={cn("flex items-center gap-1 w-full sm:w-auto", className)}>
        <Button variant={variant} size={size} disabled className="gap-2 flex-1 relative overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 bg-primary/20 transition-all duration-300"
            style={{ width: `${progress.pct}%` }}
          />
          <Loader2 className="w-4 h-4 animate-spin relative z-10 shrink-0" />
          <span className="relative z-10 font-bold truncate">
            {lang === "ar" 
              ? `جاري التحميل... ${progress.completed}/${progress.total} (${progress.pct}%)` 
              : `Downloading... ${progress.completed}/${progress.total} (${progress.pct}%)`}
          </span>
        </Button>
        <Button 
          variant="destructive" 
          size="icon" 
          onClick={handleCancel}
          className="shrink-0 rounded-md"
          title={lang === "ar" ? "إلغاء التحميل" : "Cancel download"}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (isAllCached) {
    return (
      <Button 
        variant="secondary" 
        size={size}
        className={cn("gap-2 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 w-full sm:w-auto", className)}
        title={lang === "ar" ? "جميع الملفات متاحة للمشاهدة بدون إنترنت" : "All files available offline"}
        disabled
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>{lang === "ar" ? "متاح أوفلاين" : "Offline Ready"}</span>
      </Button>
    );
  }

  if (isEmpty) {
    return (
      <Button 
        variant={variant} 
        size={size}
        disabled
        className={cn("gap-2 w-full sm:w-auto opacity-50 cursor-not-allowed", className)}
        title={lang === "ar" ? "لا توجد ملفات متاحة للتحميل" : "No files available to download"}
      >
        <HardDriveDownload className="w-4 h-4" />
        <span>{label ? label[lang as "ar" | "en"] : (lang === "ar" ? defaultLabelAr : defaultLabelEn)}</span>
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleDownload}
      className={cn("gap-2 w-full sm:w-auto", className)}
    >
      <HardDriveDownload className="w-4 h-4" />
      <span>{label ? label[lang as "ar" | "en"] : (lang === "ar" ? defaultLabelAr : defaultLabelEn)}</span>
    </Button>
  );
};
