import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ArrowDownToLine } from "lucide-react"; // أيقونة للتنبيه
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import MaterialCard from "@/components/MaterialCard";
import { ArrowRight, ArrowLeft, FolderDown } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

const CoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, tCourse, lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [highlightedMaterialId, setHighlightedMaterialId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: db.getCourses });
  const { data: allMaterials = [] } = useQuery({ queryKey: ["materials", id], queryFn: () => db.getMaterials(id) });
  const { data: categories = [] } = useQuery({
    queryKey: ["material_categories"],
    queryFn: db.getCategories,
  });

  const course = courses.find(c => c.id === id);

  // Set default active category
  const activeCategory = activeCategoryId || categories[0]?.id || "";

  const materials = allMaterials
    .filter(m => !m.archived && m.category_id === activeCategory)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
            
            let baseName = m.pdf_display_name || m.title || "material";
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
      const courseName = course ? course.code : "course";
      a.download = `${courseName}_${catName}.zip`;
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

        {/* Dynamic tabs from DB */}
        <div className="flex gap-1 mb-8 bg-secondary/50 rounded-xl p-1 overflow-x-auto">
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
            ) : (
              materials.map((m, i) => <MaterialCard key={m.id} material={m} index={i} highlightedId={highlightedMaterialId} />)
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoursePage;
