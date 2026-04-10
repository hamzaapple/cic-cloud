import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { db } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import MaterialCard from "@/components/MaterialCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, ArrowLeft, Info } from "lucide-react";

const CoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, tCourse, lang } = useI18n();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: db.getCourses });
  const { data: allMaterials = [] } = useQuery({ queryKey: ["materials", id], queryFn: () => db.getMaterials(id) });
  const { data: categories = [] } = useQuery({
    queryKey: ["material_categories"],
    queryFn: db.getCategories,
  });

  const course = courses.find(c => c.id === id);

  // Set default active category
  const activeCategory = activeCategoryId || categories[0]?.id || "";

  const activeCategoryObj = categories.find(c => c.id === activeCategory);
  const isAssignmentCategory = activeCategoryObj?.name_en.toLowerCase() === "assignments" || activeCategoryObj?.name_ar === "تكليفات" || activeCategoryObj?.name_ar === "التكليفات";

  const materials = allMaterials
    .filter(m => !m.archived && m.category_id === activeCategory)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

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
            {isAssignmentCategory && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400" variant="default" style={{ direction: "rtl", textAlign: "right" }}>
                  <Info className="h-4 w-4 ml-2 mt-0.5" />
                  <AlertDescription className="font-medium text-sm leading-relaxed">
                    تنويه : تسليم الأسايمنتات ليس هنا ولكن في موقع التعليم الإلكتروني ، رابط تسليم كل أسايمنت موجود تحت الأسايمنت
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {materials.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {t("course.noMaterials")}
              </div>
            ) : (
              materials.map((m, i) => <MaterialCard key={m.id} material={m} index={i} />)
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoursePage;
