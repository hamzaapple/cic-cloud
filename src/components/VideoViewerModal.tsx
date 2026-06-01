import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Maximize, Minimize } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { playClickSfx } from "@/hooks/use-sfx";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface VideoViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title: string;
  displayName?: string;
}

const VideoViewerModal = ({
  open,
  onOpenChange,
  videoUrl,
  title,
  displayName,
}: VideoViewerModalProps) => {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();

  const [isMaximized, setIsMaximized] = useState(false);

  const fileName = title ? `${title}.mp4` : (displayName ? `${displayName}.mp4` : `video.mp4`);

  const handleDownload = useCallback(async () => {
    playClickSfx();
    try {
      toast.loading(t("material.downloading"), { id: "dl-viewer" });
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      toast.success(t("material.downloadSuccess"), { id: "dl-viewer" });
    } catch {
      toast.error(t("material.downloadFail"), { id: "dl-viewer" });
    }
  }, [videoUrl, fileName, t]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      onOpenChange(value);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 p-0 overflow-hidden transition-all duration-300 ease-in-out bg-black border-border/50",
          isMaximized 
            ? "max-w-none w-[100vw] h-[100vh] sm:rounded-none border-0 m-0" 
            : "max-w-5xl w-[95vw] h-[90vh]"
        )}
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border/50 shrink-0 bg-background text-foreground">
          <div className="flex items-start justify-between gap-3 pe-8 mb-1">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-base font-display">
                {title}
              </DialogTitle>
              <DialogDescription className="truncate text-xs mt-0.5 text-left" dir="ltr">
                {fileName}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isMobile && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="gap-1.5 text-xs h-9"
                >
                  {isMaximized ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleDownload}
                className="gap-1.5 text-xs h-9"
                id="video-viewer-download"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {t("pdfViewer.download")}
                </span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 relative min-h-0 flex items-center justify-center bg-black">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
            controlsList="nodownload"
          >
            {lang === "ar" ? "متصفحك لا يدعم تشغيل الفيديو." : "Your browser does not support the video tag."}
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoViewerModal;
