import { motion, type Variants } from "framer-motion";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { playBackSfx, playClickSfx } from "@/hooks/use-sfx";
import { useEffect } from "react";
import { setPushAudience } from "@/lib/push-registration";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" as const } }
};

const SEMESTERS = [
  { id: "1", name_ar: "الفصل الدراسي الأول", name_en: "First Semester", color: "210 70% 50%" },
  { id: "2", name_ar: "الفصل الدراسي الثاني", name_en: "Second Semester", color: "340 70% 55%" },
];

const YearSemestersPage = () => {
  const { yearId } = useParams<{ yearId: string }>();
  const [searchParams] = useSearchParams();
  const deptId = searchParams.get("dept");
  const { lang } = useI18n();

  useEffect(() => {
    setPushAudience(yearId === "2b" ? "bachelor" : "all");
  }, [yearId]);

  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const yearNamesAr: Record<string, string> = { "1": "الصف الأول", "2": "الصف الثاني", "3": "الصف الثالث", "4": "الصف الرابع", "2b": "الصف الدراسي الثاني - بكالوريا" };
  const yearNamesEn: Record<string, string> = { "1": "First Year", "2": "Second Year", "3": "Third Year", "4": "Fourth Year", "2b": "Second Year - Bachelor" };
  const yearName = lang === "ar" ? yearNamesAr[yearId || ""] : yearNamesEn[yearId || ""];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {deptId ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to={`/year/${yearId}/departments`} onClick={playBackSfx} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <BackArrow className="w-4 h-4" /> {lang === "ar" ? "العودة للأقسام" : "Back to Departments"}
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/" onClick={playBackSfx} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <BackArrow className="w-4 h-4" /> {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            <span className="text-foreground">{yearName}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {lang === "ar" ? "اختر الفصل الدراسي" : "Select Semester"}
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {SEMESTERS.map((semester) => {
            const color = semester.color;
            const targetUrl = deptId 
              ? `/year/${yearId}/courses?dept=${deptId}&semester=${semester.id}`
              : `/year/${yearId}/courses?semester=${semester.id}`;

            return (
              <motion.div key={semester.id} variants={item}>
                <Link to={targetUrl} onClick={() => playClickSfx()}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-card rounded-2xl py-8 px-6 h-full relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-white/20 flex flex-col items-center justify-center text-center group"
                  >
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500"
                      style={{ background: `hsl(${color})` }}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                      <CalendarDays 
                        className="w-14 h-14 mb-4 transition-transform group-hover:scale-110 duration-300"
                        style={{ color: `hsl(${color})` }} 
                      />
                      <h3 
                        className="font-display font-bold text-xl text-foreground group-hover:text-[var(--hover-color)] transition-colors duration-300"
                        style={{ '--hover-color': `hsl(${color})` } as any}
                      >
                        {lang === "ar" ? semester.name_ar : semester.name_en}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default YearSemestersPage;
