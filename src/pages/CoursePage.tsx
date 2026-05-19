import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ArrowDownToLine } from "lucide-react"; // أيقونة للتنبيه
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { db, auth } from "@/lib/store";
import type { Material } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MaterialCard from "@/components/MaterialCard";
import { ArrowRight, ArrowLeft, FolderDown, Share2 } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Sortable Wrapper for MaterialCard ───
function SortableMaterialCard({ material, index, highlightedId }: { material: Material; index: number; highlightedId: string | null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: material.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
    position: "relative" as const,
  };
  return (
    <div ref={setNodeRef}>
      <MaterialCard
        material={material}
        index={index}
        highlightedId={highlightedId}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
        style={style}
      />
    </div>
  );
}

const CoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, tCourse, lang } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategoryId, setActiveCategoryIdRaw] = useState<string | null>(
    () => searchParams.get("category") || null
  );
  const [highlightedMaterialId, setHighlightedMaterialId] = useState<string | null>(null);

  // Wrapper that keeps the URL in sync with the active tab
  const setActiveCategoryId = (catId: string) => {
    setActiveCategoryIdRaw(catId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("category", catId);
      // remove material highlight param when just switching tabs
      next.delete("material");
      return next;
    }, { replace: true });
  };
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: db.getCourses });
  const { data: allMaterials = [] } = useQuery({ queryKey: ["materials", id], queryFn: () => db.getMaterials(id) });
  const { data: categories = [] } = useQuery({
    queryKey: ["material_categories"],
    queryFn: db.getCategories,
  });

  const course = courses.find(c => c.id === id);
  const isAdmin = auth.isLoggedIn();

  // Set default active category
  const activeCategory = activeCategoryId || categories[0]?.id || "";

  // Filter + sort materials (sort_order from DB is already applied by the query;
  // fallback to created_at DESC for materials without sort_order)
  const filteredMaterials = allMaterials
    .filter(m => !m.archived && m.category_id === activeCategory);

  // ─── Local ordered state for DnD (synced from query data) ───
  const [orderedMaterials, setOrderedMaterials] = useState<Material[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Sync orderedMaterials when query data or category changes
  useEffect(() => {
    setOrderedMaterials(filteredMaterials);
  }, [allMaterials, activeCategory]);

  // Use orderedMaterials for rendering (DnD-aware) instead of filteredMaterials
  const materials = orderedMaterials;

  // ─── DnD sensors & handler ───
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedMaterials.findIndex(m => m.id === active.id);
    const newIndex = orderedMaterials.findIndex(m => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedMaterials, oldIndex, newIndex);
    const previousOrder = [...orderedMaterials];

    // Optimistic update
    setOrderedMaterials(reordered);

    // Persist to DB
    setIsSavingOrder(true);
    const toastId = "reorder-save";
    toast.loading(lang === "ar" ? "جاري حفظ الترتيب..." : "Saving order...", { id: toastId });

    try {
      await db.reorderMaterials(reordered.map(m => m.id));
      toast.success(lang === "ar" ? "تم حفظ الترتيب ✅" : "Order saved ✅", { id: toastId });
      // Refresh query cache so other views stay in sync
      queryClient.invalidateQueries({ queryKey: ["materials", id] });
    } catch (err) {
      console.error("Reorder failed:", err);
      // Rollback to previous order
      setOrderedMaterials(previousOrder);
      toast.error(lang === "ar" ? "فشل حفظ الترتيب" : "Failed to save order", { id: toastId });
    } finally {
      setIsSavingOrder(false);
    }
  }, [orderedMaterials, lang, id, queryClient]);

  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Download all PDFs in current category as ZIP
  const handleDownloadAllZip = async () => {
    const pdfMaterials = materials.filter(m => m.pdf_url);
    if (pdfMaterials.length === 0) {
      toast.error(t("material.noFiles"));
      return;
    }
    setIsDownloadingAll(true);
    const toastId = "zip-download";
    toast.loading(t("material.downloading"), { id: toastId });
    try {
      const zip = new JSZip();
      let done = 0;
      const usedNames = new Set<string>();
      
      await Promise.all(
        pdfMaterials.map(async (m) => {
          try {
            const res = await fetch(m.pdf_url!);
            if (!res.ok) return;
            const blob = await res.blob();
            
            let baseName = m.title || m.pdf_display_name || "material";
            if (baseName.toLowerCase().endsWith(".pdf")) {
              baseName = baseName.slice(0, -4);
            }
            
            let fileName = `${baseName}.pdf`;
            let counter = 1;
            while (usedNames.has(fileName)) {
              fileName = `${baseName} (${counter}).pdf`;
              counter++;
            }
            usedNames.add(fileName);

            zip.file(fileName, blob);
            done++;
            toast.loading(`${t("material.downloading")} (${done}/${pdfMaterials.length})`, { id: toastId });
          } catch {
            // skip failed files
          }
        })
      );
      if (Object.keys(zip.files).length === 0) {
        toast.error(t("material.downloadFail"), { id: toastId });
        return;
      }
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      const categoryObj = categories.find(c => c.id === activeCategory);
      const catName = categoryObj ? (lang === "ar" ? categoryObj.name_ar : categoryObj.name_en) : "materials";
      const courseNameStr = course ? tCourse(course.name) : "course";
      a.download = `${catName} (${courseNameStr}).zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      toast.success(t("material.downloadSuccess"), { id: toastId });
    } catch {
      toast.error(t("material.downloadFail"), { id: toastId });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // Handle shared material link: auto-select category and highlight material
  useEffect(() => {
    const sharedMaterialId = searchParams.get("material");
    const sharedCategoryId = searchParams.get("category");

    if (sharedMaterialId && categories.length > 0) {
      // Auto-select the category tab if provided
      if (sharedCategoryId) {
        setActiveCategoryId(sharedCategoryId);
      }
      // Set highlight
      setHighlightedMaterialId(sharedMaterialId);

      // Clean the URL params so refreshing doesn't re-highlight
      const cleanUrlParams = () => {
        const newParams = new URLSearchParams(searchParams);
        if (newParams.has("material")) {
          newParams.delete("material");
          newParams.delete("category");
          setSearchParams(newParams, { replace: true });
        }
      };

      // Scroll to the material once it renders in the DOM
      let attempts = 0;
      const scrollInterval = setInterval(() => {
        const el = document.getElementById(`material-${sharedMaterialId}`);
        if (el) {
          clearInterval(scrollInterval);
          // Wait for framer-motion entrance animations to finish before scrolling
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 600);
          cleanUrlParams();
        } else if (attempts > 100) { // Try for 10 seconds (100 * 100ms)
          clearInterval(scrollInterval);
          cleanUrlParams();
        }
        attempts++;
      }, 100);

      // Clear highlight after 5 seconds
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedMaterialId(null);
      }, 5000);

      return () => {
        clearInterval(scrollInterval);
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      };
    }
  }, [categories, searchParams]);

  // ─── Share Category Link ───
  const handleShareCategory = async () => {
    const categoryObj = categories.find(c => c.id === activeCategory);
    const catName = categoryObj ? (lang === "ar" ? categoryObj.name_ar : categoryObj.name_en) : "";
    const courseName = course ? tCourse(course.name) : "";
    const shareTitle = lang === "ar"
      ? `${catName} — ${courseName}`
      : `Check out the ${catName} materials for ${courseName}`;

    // Build URL with the current category param
    const url = new URL(window.location.href);
    url.searchParams.set("category", activeCategory);
    url.searchParams.delete("material"); // clean up stale params
    const shareUrl = url.toString();

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(lang === "ar" ? "تم نسخ رابط القسم! 📋" : "Category link copied to clipboard! 📋");
      }
    } catch (err: any) {
      // User cancelled the native share dialog — not an error
      if (err?.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success(lang === "ar" ? "تم نسخ رابط القسم! 📋" : "Category link copied to clipboard! 📋");
        } catch {
          toast.error(lang === "ar" ? "فشل نسخ الرابط" : "Failed to copy link");
        }
      }
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">{t("course.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <BackArrow className="w-4 h-4" /> {t("course.back")}
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div
            className="inline-block px-3 py-1 rounded-lg text-xs font-semibold mb-2"
            style={{ background: `hsl(${course.color} / 0.15)`, color: `hsl(${course.color})` }}
          >
            {course.code}
          </div>
          <h1 className="text-3xl font-display font-bold">{tCourse(course.name)}</h1>
          <p className="text-muted-foreground mt-1">{course.description}</p>
        </motion.div>

        {/* Dynamic tabs from DB + Share button */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex gap-1 flex-1 bg-secondary/50 rounded-xl p-1 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "ar" ? cat.name_ar : cat.name_en}
              </button>
            ))}
          </div>
          <button
            onClick={handleShareCategory}
            title={lang === "ar" ? "مشاركة القسم" : "Share Category"}
            className="shrink-0 p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {/* Download All ZIP button */}
            {materials.some(m => m.pdf_url) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-2">
                <button
                  onClick={handleDownloadAllZip}
                  disabled={isDownloadingAll}
                  className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderDown className="w-4 h-4" />
                  {isDownloadingAll ? t("material.downloading") : t("material.downloadAll")}
                </button>
              </motion.div>
            )}
            {materials.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {t("course.noMaterials")}
              </div>
            ) : isAdmin ? (
              /* ── Admin: DnD-enabled sortable list ── */
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={materials.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {materials.map((m, i) => (
                      <SortableMaterialCard key={m.id} material={m} index={i} highlightedId={highlightedMaterialId} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              /* ── Regular user: static list ── */
              materials.map((m, i) => <MaterialCard key={m.id} material={m} index={i} highlightedId={highlightedMaterialId} />)
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoursePage;
