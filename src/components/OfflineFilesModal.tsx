import { useState, lazy, Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HardDrive,
  HardDriveDownload,
  Trash2,
  FileText,
  PlayCircle,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useOfflineStorage } from "@/hooks/use-offline-storage";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { db, type Material, type Course } from "@/lib/store";
import { playClickSfx } from "@/hooks/use-sfx";
import { toast } from "sonner";
import { yearLabel } from "@/lib/year-context";

const PdfViewerModal = lazy(() => import("@/components/PdfViewerModal"));
const VideoViewerModal = lazy(() => import("@/components/VideoViewerModal"));

interface OfflineFilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OfflineFilesModal = ({ open, onOpenChange }: OfflineFilesModalProps) => {
  const { lang } = useI18n();
  const {
    cachedItems,
    totalSize,
    formatSize,
    removeFromOffline,
    clearAllOffline,
  } = useOfflineStorage();

  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const [viewingVideo, setViewingVideo] = useState<{ url: string; title: string } | null>(null);

  // Fetch materials and courses to map URLs to real titles
  const { data: materials = [] } = useQuery<Material[]>({
    queryKey: ["all-materials-offline-list"],
    queryFn: () => db.getMaterials(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: () => db.getCourses(),
    staleTime: 5 * 60 * 1000,
  });

  const handleDeleteItem = async (e: React.MouseEvent, url: string, title: string) => {
    e.stopPropagation();
    playClickSfx();
    const success = await removeFromOffline(url);
    if (success) {
      toast.success(lang === "ar" ? `تم حذف "${title}" من الذاكرة` : `Removed "${title}" from offline storage`);
    } else {
      toast.error(lang === "ar" ? "فشل حذف الملف" : "Failed to remove file");
    }
  };

  const handleClearAll = async () => {
    playClickSfx();
    const success = await clearAllOffline();
    if (success) {
      setConfirmClearAll(false);
      toast.success(lang === "ar" ? "تم مسح جميع الملفات المحفوظة بنجاح" : "All offline files deleted");
    } else {
      toast.error(lang === "ar" ? "فشل مسح الملفات" : "Failed to clear files");
    }
  };

  const handleOpenFile = (url: string, title: string) => {
    playClickSfx();
    const isVideo = url.match(/\.(mp4|webm|ogg|mov|mkv|avi|mp3|wav|m4a|aac)$/i);
    if (isVideo) {
      setViewingVideo({ url, title });
    } else {
      setViewingPdf({ url, title });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-4 sm:p-6 overflow-hidden rounded-2xl">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">
                    {lang === "ar" ? "الملفات المحفوظة بدون إنترنت" : "Offline Downloaded Files"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {lang === "ar"
                      ? "المحاضرات والشيتات المحفوظة على جهازك وتعمل بدون اتصال بالإنترنت"
                      : "Materials cached on your device to view without internet"}
                  </DialogDescription>
                </div>
              </div>

              {cachedItems.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold shrink-0">
                  <HardDriveDownload className="w-3.5 h-3.5" />
                  <span>{formatSize(totalSize)}</span>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[160px]">
            {cachedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground/60">
                  <HardDrive className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm px-4">
                  <p className="font-semibold text-foreground text-sm">
                    {lang === "ar" ? "لا توجد ملفات محفوظة بعد" : "No offline files saved yet"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "ar"
                      ? "اضغط على أيقونة التنزيل (💾) بجانب أي محاضرة أو شيت لحفظه وتشغيله بدون إنترنت في أي وقت!"
                      : "Tap the download icon next to any lecture or sheet to save and open offline anytime!"}
                  </p>
                </div>
              </div>
            ) : (
              cachedItems.map((item, idx) => {
                // Find matching material
                const cleanItemUrl = item.url.split("?")[0];
                const material = materials.find(
                  (m) => m.pdf_url && m.pdf_url.split("?")[0] === cleanItemUrl
                );

                const course = material
                  ? courses.find((c) => c.id === material.course_id)
                  : null;

                const displayName =
                  material?.pdf_display_name ||
                  material?.title ||
                  decodeURIComponent(cleanItemUrl.split("/").pop() || "") ||
                  (lang === "ar" ? `ملف #${idx + 1}` : `File #${idx + 1}`);

                const isVideo = item.url.match(/\.(mp4|webm|ogg|mov|mkv|avi|mp3|wav|m4a|aac)$/i);

                return (
                  <div
                    key={item.url}
                    onClick={() => handleOpenFile(item.url, displayName)}
                    className="group relative flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-secondary/40 hover:border-primary/40 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        {isVideo ? (
                          <PlayCircle className="w-5 h-5 text-purple-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-primary" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-semibold truncate text-foreground">
                            {displayName}
                          </h4>
                          {course && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium shrink-0">
                              {course.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          {course?.academic_year && (
                            <span>{yearLabel(course.academic_year, lang)}</span>
                          )}
                          <span>•</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatSize(item.size)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenFile(item.url, displayName)}
                        className="h-8 px-2.5 text-xs gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{lang === "ar" ? "فتح" : "Open"}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteItem(e, item.url, displayName)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title={lang === "ar" ? "حذف من الذاكرة" : "Delete from storage"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {cachedItems.length > 0 && (
            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {lang === "ar"
                  ? `إجمالي ${cachedItems.length} ملف محفوظ (${formatSize(totalSize)})`
                  : `Total ${cachedItems.length} file(s) (${formatSize(totalSize)})`}
              </span>

              {confirmClearAll ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {lang === "ar" ? "متأكد من الحذف؟" : "Are you sure?"}
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleClearAll}
                    className="h-7 px-2.5 text-xs"
                  >
                    {lang === "ar" ? "نعم، احذف الكل" : "Yes, Clear All"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmClearAll(false)}
                    className="h-7 px-2 text-xs"
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    playClickSfx();
                    setConfirmClearAll(true);
                  }}
                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "مسح كل المحفوظات" : "Clear All"}</span>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Embedded Viewers for Offline viewing */}
      {viewingPdf && (
        <Suspense fallback={null}>
          <PdfViewerModal
            open={Boolean(viewingPdf)}
            onOpenChange={(v) => {
              if (!v) setViewingPdf(null);
            }}
            pdfUrl={viewingPdf.url}
            title={viewingPdf.title}
          />
        </Suspense>
      )}

      {viewingVideo && (
        <Suspense fallback={null}>
          <VideoViewerModal
            open={Boolean(viewingVideo)}
            onOpenChange={(v) => {
              if (!v) setViewingVideo(null);
            }}
            videoUrl={viewingVideo.url}
            title={viewingVideo.title}
          />
        </Suspense>
      )}
    </>
  );
};
