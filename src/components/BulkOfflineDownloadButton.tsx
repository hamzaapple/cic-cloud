import { useState } from "react";
import { HardDriveDownload, Loader2, CheckCircle2 } from "lucide-react";
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
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  if (!isSupported || urls.length === 0) return null;

  // Filter out URLs that are already cached
  const uncachedUrls = urls.filter(url => !isCached(url));
  const isAllCached = uncachedUrls.length === 0;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClickSfx();
    
    if (isAllCached) {
      toast.info(lang === "ar" ? "جميع الملفات متاحة أوفلاين بالفعل" : "All files are already available offline");
      return;
    }

    setIsDownloading(true);
    setProgress({ completed: 0, total: uncachedUrls.length });
    
    try {
      const success = await saveMultipleToOffline(uncachedUrls, (completed, total) => {
        setProgress({ completed, total });
      });
      
      if (success) {
        toast.success(lang === "ar" ? "تم تحميل الملفات للعمل بدون إنترنت!" : "Files downloaded for offline use!");
      } else {
        toast.error(lang === "ar" ? "حدث خطأ أثناء التحميل. يرجى التحقق من اتصالك." : "Error downloading. Please check your connection.");
      }
    } catch (err) {
      console.error("Bulk download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const defaultLabelAr = "تحميل الكل أوفلاين";
  const defaultLabelEn = "Download All Offline";

  if (isDownloading) {
    return (
      <Button variant={variant} size={size} disabled className={cn("gap-2 w-full sm:w-auto", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{lang === "ar" ? `جاري التحميل... ${progress.completed}/${progress.total}` : `Downloading... ${progress.completed}/${progress.total}`}</span>
      </Button>
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
