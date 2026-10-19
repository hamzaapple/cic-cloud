import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ArrowDownToLine } from "lucide-react"; // أيقونة للتنبيه
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { db, categoriesForDepartment } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import MaterialCard from "@/components/MaterialCard";
import { BulkOfflineDownloadButton } from "@/components/BulkOfflineDownloadButton";
import { ArrowRight, ArrowLeft, FolderDown, Share2 } from "lucide-react";
import { toast } from "sonner";
import { playBackSfx, playClickSfx } from "@/hooks/use-sfx";
import { slugify, findCourseBySlug } from "@/lib/utils";


const CoursePage = () => {
  const { id, yearId, semesterId, courseSlug, categorySlug } = useParams<{ id?: string, yearId?: string, semesterId?: string, courseSlug?: string, categorySlug?: string }>();
  const { t, tCourse, lang } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: db.getCourses });
  
  const course = id
    ? courses.find(c => c.id === id)
    : (yearId && semesterId && courseSlug ? findCourseBySlug(courses, yearId, semesterId, courseSlug) : undefined);

  const { data: allMaterials = [] } = useQuery({ 
    queryKey: ["materials", course?.id], 
    queryFn: () => db.getMaterials(course?.id),
    enabled: !!course?.id
  });
  
  const { data: allCategories = [] } = useQuery({
    queryKey: ["material_categories"],
    queryFn: db.getCategories,
  });

  // Categories scoped to this course's department and academic year (unified + specific)
  const categories = categoriesForDepartment(allCategories, course?.department_id ?? null, course?.academic_year ?? null);

  const activeCategoryBySlug = categories.find(c => slugify(c.name_en) === categorySlug || slugify(c.name_ar) === categorySlug);
  const activeCategoryIdRaw = activeCategoryBySlug?.id || searchParams.get("category") || null;
  const activeCategory = activeCategoryIdRaw || categories[0]?.id || "";

  // Wrapper that keeps the URL in sync with the active tab
  const setActiveCategoryId = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (yearId && semesterId && courseSlug && cat) {
      // Use the new route structure
      const nextSlug = slugify(cat.name_en) || slugify(cat.name_ar) || cat.id;
      navigate(`/${yearId}/${semesterId}/${courseSlug}/${nextSlug}`, { replace: true });
    } else {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set("category", catId);
        // remove material highlight param when just switching tabs
        next.delete("material");
        return next;
      }, { replace: true });
    }
  };
  
  const [highlightedMaterialId, setHighlightedMaterialId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [groupBySection, setGroupBySection] = useState<boolean>(false);

  useEffect(() => {
    setSectionFilter("all");
  }, [activeCategory]);

  const materials = allMaterials
    .filter(m => !m.archived && m.category_id === activeCategory)
    .sort((a, b) => {
      if (a.is_reference && !b.is_reference) return -1;
      if (!a.is_reference && b.is_reference) return 1;
      return 0;
    });

  const activeCategoryObj = categories.find(c => c.id === activeCategory);
  const isAssignmentsCategory = Boolean(
    activeCategoryObj && (
      activeCategoryObj.name_en.toLowerCase().includes("assignment") ||
      activeCategoryObj.name_ar.includes("تكليف") ||
      activeCategoryObj.name_ar.includes("سكشن") ||
      activeCategoryObj.name_ar.includes("سكاشن")
    )
  );

  const sectionsInMaterials = useMemo(() => {
    const set = new Set<string>();
    materials.forEach(m => {
      if (m.section_number && m.section_number !== "all") {
        set.add(m.section_number);
      }
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [materials]);

  const displayedMaterials = useMemo(() => {
    if (sectionFilter === "all") return materials;
    if (sectionFilter === "common") {
      return materials.filter(m => !m.section_number || m.section_number === "all");
    }
    return materials.filter(m => m.section_number === sectionFilter || !m.section_number || m.section_number === "all");
  }, [materials, sectionFilter]);

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
      const JSZip = (await import("jszip")).default;
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

    // Build URL with the current category param or slug
    let shareUrl = window.location.href;
    const cat = categories.find(c => c.id === activeCategory);
    
    if (yearId && semesterId && courseSlug && cat) {
      const catSlug = slugify(cat.name_en) || slugify(cat.name_ar) || cat.id;
      const url = new URL(window.location.origin + `/${yearId}/${semesterId}/${courseSlug}/${catSlug}`);
      // Keep any other search params except material/category
      searchParams.forEach((value, key) => {
        if (key !== "material" && key !== "category") url.searchParams.set(key, value);
      });
      shareUrl = url.toString();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set("category", activeCategory);
      url.searchParams.delete("material"); // clean up stale params
      shareUrl = url.toString();
    }

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
          <button onClick={() => { playBackSfx(); navigate(-1); }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <BackArrow className="w-4 h-4" /> {t("course.back")}
          </button>
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
          
          <div className="mt-4 flex flex-wrap gap-2">
            <BulkOfflineDownloadButton 
              urls={allMaterials.flatMap(m => [m.pdf_url, m.video_url].filter(Boolean) as string[])}
              label={{ ar: "حفظ المقرر أوفلاين", en: "Save Course Offline" }}
              variant="secondary"
            />
          </div>
        </motion.div>

        {/* Course Notes banner with subtle light background */}
        {course.notes && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-foreground shadow-sm backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <span>📌</span>
                  <span>{lang === "ar" ? "ملحوظات وتنبيهات المقرر:" : "Course Notes & Notices:"}</span>
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-foreground/85 font-normal">
                  {course.notes}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic tabs from DB + Share button */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex gap-1 flex-1 bg-secondary/50 rounded-xl p-1 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { playClickSfx(); setActiveCategoryId(cat.id); }}
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

        {/* Section branches for assignments / sections */}
        {(isAssignmentsCategory || sectionsInMaterials.length > 0) && materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 rounded-2xl bg-secondary/40 border border-border/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-2 px-1 flex-wrap gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <span>📂</span>
                <span>{lang === "ar" ? "فروع وتكليفات السكاشن:" : "Assignments by Section:"}</span>
              </span>
              {sectionsInMaterials.length > 1 && (
                <button
                  onClick={() => setGroupBySection(!groupBySection)}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {groupBySection
                    ? (lang === "ar" ? "عرض كقائمة واحدة" : "List view")
                    : (lang === "ar" ? "عرض مقسم لكل سكشن" : "Group by section")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => { playClickSfx(); setSectionFilter("all"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  sectionFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {lang === "ar" ? "جميع السكاشن" : "All Sections"} ({materials.length})
              </button>

              {sectionsInMaterials.map(sec => {
                const count = materials.filter(m => m.section_number === sec).length;
                const secLabel = sec.startsWith("سكشن") ? sec : (lang === "ar" ? `سكشن ${sec}` : `Section ${sec}`);
                return (
                  <button
                    key={sec}
                    onClick={() => { playClickSfx(); setSectionFilter(sec); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      sectionFilter === sec
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {secLabel} ({count})
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={activeCategory + sectionFilter + String(groupBySection)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {/* Download All ZIP button */}
            {displayedMaterials.some(m => m.pdf_url) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-2">
                <button
                  onClick={handleDownloadAllZip}
                  disabled={isDownloadingAll}
                  className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FolderDown className="w-4 h-4" />
                  {isDownloadingAll ? t("material.downloading") : t("material.downloadAll")}
                </button>
              </motion.div>
            )}
            {displayedMaterials.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {t("course.noMaterials")}
              </div>
            ) : groupBySection && sectionFilter === "all" && sectionsInMaterials.length > 0 ? (
              <div className="space-y-6">
                {sectionsInMaterials.map(sec => {
                  const secMats = materials.filter(m => m.section_number === sec);
                  if (secMats.length === 0) return null;
                  const secTitle = sec.startsWith("سكشن") ? sec : (lang === "ar" ? `سكشن ${sec}` : `Section ${sec}`);
                  return (
                    <div key={sec} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <span>📂</span>
                          <span>{secTitle}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                          {secMats.length}
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>
                      <div className="space-y-3">
                        {secMats.map((m, i) => (
                          <MaterialCard key={m.id} material={m} index={i} highlightedId={highlightedMaterialId} />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Common/Unassigned materials */}
                {(() => {
                  const commonMats = materials.filter(m => !m.section_number || m.section_number === "all");
                  if (commonMats.length === 0) return null;
                  return (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <span>🌐</span>
                          <span>{lang === "ar" ? "تكليفات عامة (لكل السكاشن)" : "General (All Sections)"}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
                          {commonMats.length}
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>
                      <div className="space-y-3">
                        {commonMats.map((m, i) => (
                          <MaterialCard key={m.id} material={m} index={i} highlightedId={highlightedMaterialId} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              displayedMaterials.map((m, i) => <MaterialCard key={m.id} material={m} index={i} highlightedId={highlightedMaterialId} />)
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoursePage;
