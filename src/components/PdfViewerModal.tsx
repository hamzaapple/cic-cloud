import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Loader2, WifiOff, FileText, RotateCw, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useOfflineStorage } from "@/hooks/use-offline-storage";

interface PdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string;
  title: string;
  displayName?: string;
}

// How long we wait for pdf.js to report progress before treating the load as stalled.
const VIEWER_STALL_TIMEOUT_MS = 25000;

type SourceKind = "cache" | "network";

const PdfViewerModal = ({
  open,
  onOpenChange,
  pdfUrl,
  title,
  displayName,
}: PdfViewerModalProps) => {
  const isMobile = useIsMobile();
  const [isMaximized, setIsMaximized] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cacheChecked, setCacheChecked] = useState(false);
  const [useNativeViewer, setUseNativeViewer] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-maximize on mobile
  useEffect(() => {
    if (isMobile && open) {
      setIsMaximized(true);
    }
  }, [isMobile, open]);

  const { getCachedUrl, removeFromOffline } = useOfflineStorage();

  const isImg = !!(
    pdfUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i) ||
    displayName?.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)
  );

  // Resolve the source: prefer a valid offline copy, otherwise the network URL.
  useEffect(() => {
    if (!open || !pdfUrl) return;

    let cancelled = false;
    let currentObjectUrl: string | null = null;
    setIsLoading(true);
    setCacheChecked(false);
    setLoadError(null);

    const resolveSource = async () => {
      try {
        const cachedUrl = await getCachedUrl(pdfUrl);
        if (cancelled) {
          if (cachedUrl) URL.revokeObjectURL(cachedUrl);
          return;
        }

        if (cachedUrl && !isImg) {
          // Make sure the cached copy is really a PDF (a corrupted/HTML entry renders as "0 of 0").
          const head = await fetch(cachedUrl)
            .then((r) => r.blob())
            .then((b) => b.slice(0, 5).text())
            .catch(() => "");
          if (cancelled) {
            URL.revokeObjectURL(cachedUrl);
            return;
          }
          if (!head.startsWith("%PDF")) {
            console.warn("[PdfViewer] Cached copy is not a valid PDF, discarding:", pdfUrl);
            URL.revokeObjectURL(cachedUrl);
            await removeFromOffline(pdfUrl).catch(() => undefined);
            if (cancelled) return;
            setObjectUrl(null);
            return;
          }
        }

        currentObjectUrl = cachedUrl;
        setObjectUrl(cachedUrl);
      } catch (err) {
        console.error("PDF cache check error:", err);
        if (!cancelled) setObjectUrl(null);
      } finally {
        if (!cancelled) setCacheChecked(true);
      }
    };

    resolveSource();

    return () => {
      cancelled = true;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
      setObjectUrl(null);
      setCacheChecked(false);
    };
  }, [open, pdfUrl, getCachedUrl, removeFromOffline, isImg]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        if (!isMobile) setIsMaximized(false);
        setUseNativeViewer(false);
        setLoadError(null);
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

  const sourceKind: SourceKind = objectUrl ? "cache" : "network";
  const finalPdfUrl = objectUrl || pdfUrl;
  const usesPdfJs = !isImg && !useNativeViewer;
  const viewerUrl = usesPdfJs
    ? `/pdfjs-viewer/web/viewer.html?file=${encodeURIComponent(finalPdfUrl)}`
    : finalPdfUrl;

  /**
   * pdf.js fails silently (blank "0 of 0") when a document can't be loaded.
   * Hook into the same-origin viewer to detect that and recover automatically:
   *  - broken offline copy  -> drop it and load from the network
   *  - network load failure -> fall back to the browser's native viewer
   */
  const handlePdfJsFailure = useCallback(
    async (reason: string) => {
      console.warn(`[PdfViewer] pdf.js failed to load (${sourceKind}):`, reason);
      if (sourceKind === "cache") {
        await removeFromOffline(pdfUrl).catch(() => undefined);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
        setIsLoading(true);
        return;
      }
      if (navigator.onLine) {
        setUseNativeViewer(true);
        setIsLoading(false);
      } else {
        setLoadError(reason);
        setIsLoading(false);
      }
    },
    [sourceKind, removeFromOffline, pdfUrl, objectUrl]
  );

  const handleIframeLoad = useCallback(() => {
    if (!usesPdfJs) {
      setIsLoading(false);
      return;
    }
    const win = iframeRef.current?.contentWindow as
      | (Window & { PDFViewerApplication?: any })
      | null
      | undefined;
    const app = win?.PDFViewerApplication;
    if (!app) {
      // Viewer script didn't boot (e.g. stale cached viewer files) — use native viewer.
      handlePdfJsFailure("pdf.js viewer did not initialize");
      return;
    }

    let settled = false;
    let hookedTask: any = null;
    let lastActivity = Date.now();

    const finish = (error?: string) => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      if (error) {
        handlePdfJsFailure(error);
      } else {
        setIsLoading(false);
      }
    };

    // Poll the viewer: pdf.js creates its loading task asynchronously, and a failure
    // may happen before we get here — the task's promise still reports it either way.
    const poll = setInterval(() => {
      if (!iframeRef.current || iframeRef.current.contentWindow !== win) {
        clearInterval(poll); // iframe was replaced/closed
        return;
      }
      if (app.pdfDocument) {
        finish();
        return;
      }
      const task = app.pdfLoadingTask;
      if (task && task !== hookedTask) {
        hookedTask = task;
        lastActivity = Date.now();
        const prev = task.onProgress;
        task.onProgress = (data: { loaded: number; total: number }) => {
          lastActivity = Date.now(); // still downloading — keep waiting
          prev?.(data);
        };
        task.promise.then(
          () => finish(),
          (reason: { message?: string } | undefined) => {
            // Ignore if a newer task replaced this one (e.g. viewer reopened a file).
            if (app.pdfLoadingTask === task) finish(reason?.message || "failed to load PDF");
          }
        );
      }
      if (Date.now() - lastActivity > VIEWER_STALL_TIMEOUT_MS) {
        finish("timed out while loading the document");
      }
    }, 500);
  }, [usesPdfJs, handlePdfJsFailure]);

  const handleRetry = () => {
    setLoadError(null);
    setUseNativeViewer(false);
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  };

  const isOfflineButNotCached = !navigator.onLine && cacheChecked && !objectUrl;
  const showSpinner = (isLoading || !cacheChecked) && !loadError && !isOfflineButNotCached;

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
              <Button
                size="sm"
                variant={useNativeViewer ? "default" : "outline"}
                onClick={() => {
                  setLoadError(null);
                  setIsLoading(true);
                  setUseNativeViewer(!useNativeViewer);
                }}
                className="gap-1.5 text-xs h-9"
                title={useNativeViewer ? "العودة للعارض الأساسي" : "تبديل العارض (إذا كانت الشاشة سوداء)"}
              >
                <FileText className="w-4 h-4" />
                {!isMobile && (useNativeViewer ? "العارض الأساسي" : "تبديل العارض")}
              </Button>
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
          {showSpinner && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 pointer-events-none">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {isOfflineButNotCached && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background/95 z-10">
                <WifiOff className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">غير متصل بالإنترنت</h3>
                <p className="text-sm text-muted-foreground max-w-md">هذا الملف غير متوفر في الذاكرة المحلية (Offline Cache). يرجى الاتصال بالإنترنت لتحميله، ثم يمكنك مشاهدته لاحقاً بدون إنترنت.</p>
             </div>
          )}
          {loadError && !isOfflineButNotCached && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background/95 z-10">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4 opacity-60" />
              <h3 className="text-lg font-semibold mb-2">تعذّر فتح الملف</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                حدث خطأ أثناء تحميل الملف. تأكد من اتصالك بالإنترنت ثم أعد المحاولة.
              </p>
              <Button size="sm" onClick={handleRetry} className="gap-1.5">
                <RotateCw className="w-4 h-4" />
                إعادة المحاولة
              </Button>
            </div>
          )}
          {open && cacheChecked && !isOfflineButNotCached && !loadError && (
            isImg ? (
              <div className="w-full h-full flex items-center justify-center overflow-auto bg-[#323639]">
                <img
                  src={viewerUrl}
                  alt={displayName || title}
                  className="max-w-full max-h-full object-contain"
                  onLoad={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                />
              </div>
            ) : (
              <iframe
                key={`${viewerUrl}-${reloadKey}`}
                ref={iframeRef}
                src={viewerUrl}
                className="w-full h-full border-0"
                title={usesPdfJs ? "PDF Viewer" : "PDF Viewer (Native)"}
                allow="fullscreen"
                onLoad={handleIframeLoad}
              />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerModal;
