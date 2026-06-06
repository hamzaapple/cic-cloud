import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  title: string;
  displayName?: string;
}

const PdfViewerModal = ({
  open,
  onOpenChange,
  pdfUrl,
  title,
  displayName,
}: PdfViewerModalProps) => {
  const isMobile = useIsMobile();
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-maximize on mobile
  useEffect(() => {
    if (isMobile && open) {
      setIsMaximized(true);
    }
  }, [isMobile, open]);

  // Fetch the PDF as a Blob to bypass pdf.js cross-origin restrictions
  useEffect(() => {
    if (!open || !pdfUrl) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    const loadPdfBlob = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(pdfUrl, { mode: "cors" });
        if (!response.ok) throw new Error("Failed to fetch PDF");
        const blob = await response.blob();
        if (cancelled) return;
        
        objectUrl = URL.createObjectURL(blob);
        setViewerUrl(`/pdfjs-viewer/web/viewer.html?file=${encodeURIComponent(objectUrl)}`);
      } catch (err) {
        console.error("PDF load error:", err);
        // Fallback to direct URL if fetch fails
        if (!cancelled) {
          setViewerUrl(`/pdfjs-viewer/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPdfBlob();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [open, pdfUrl]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        setViewerUrl(null);
        if (!isMobile) setIsMaximized(false);
      }
      onOpenChange(value);
    },
    [onOpenChange, isMobile]
  );

  const fileName = title
    ? `${title}.pdf`
    : displayName
      ? `${displayName}.pdf`
      : `document.pdf`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 p-0 overflow-hidden transition-all duration-300 ease-in-out bg-background",
          isMaximized
            ? "max-w-none w-[100vw] h-[100vh] sm:rounded-none border-0 m-0"
            : "max-w-5xl w-[95vw] h-[90vh]"
        )}
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-start justify-between gap-3 pe-8 mb-1">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-base font-display">
                {title}
              </DialogTitle>
              <DialogDescription
                className="truncate text-xs mt-0.5 text-left"
                dir="ltr"
              >
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
                  {isMaximized ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative min-h-0 bg-muted/30">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {open && viewerUrl && (
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title="PDF Viewer"
              allow="fullscreen"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerModal;
