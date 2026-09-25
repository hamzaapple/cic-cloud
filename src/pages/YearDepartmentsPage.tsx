import { motion, type Variants } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { db } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Monitor, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

const DEPT_ICONS: Record<string, typeof Monitor> = {
  CS: Monitor,
  "AI, Cyber": Brain,
};

const DEPT_COLORS: Record<string, string> = {
  CS: "190 80% 45%",
  "AI, Cyber": "260 70% 55%",
};

const YearDepartmentsPage = () => {
  const { yearId } = useParams<{ yearId: string }>();
  const { t, lang } = useI18n();

  useEffect(() => {
    setPushAudience(yearId === "2b" ? "bachelor" : "all");
  }, [yearId]);
  const { data: allDepartments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: db.getDepartments
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: db.getCourses
  });

  // "Bachelor" is a hidden section (used outside the university) — listed only
  // inside the hidden "2b" year, never in the public departments grid.
  const departments = yearId === "2b"
    ? allDepartments.filter(d => d.name_en === "Bachelor")
    : allDepartments.filter(d => d.name_en !== "Bachelor");


  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const yearNamesAr: Record<string, string> = { "1": "الصف الأول", "2": "الصف الثاني", "3": "الصف الثالث", "4": "الصف الرابع", "2b": "الصف الدراسي الثاني - بكالوريا" };
  const yearNamesEn: Record<string, string> = { "1": "First Year", "2": "Second Year", "3": "Third Year", "4": "Fourth Year", "2b": "Second Year - Bachelor" };
  const yearName = lang === "ar" ? yearNamesAr[yearId || ""] : yearNamesEn[yearId || ""];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/" onClick={playBackSfx} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <BackArrow className="w-4 h-4" /> {lang === "ar" ? "الرجوع للرئيسية" : "Back to Home"}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            <span className="text-foreground">{yearName}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {t("dept.selectDepartment")}
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {departments.map((dept) => {
            const Icon = DEPT_ICONS[dept.name_en] || Monitor;
            const color = DEPT_COLORS[dept.name_en] || "190 80% 45%";
            return (
              <motion.div key={dept.id} variants={item}>
                <Link 
                  to={`/year/${yearId}/semesters?dept=${dept.id}`} 
                  onClick={() => {
                    playClickSfx();
                    // Set context for Schedules and Announcements
                    const deptContext = dept.name_en === "CS" ? "cs" : "ai_cyber";
                    localStorage.setItem("cic_dept_context", deptContext);
                  }}
                >
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
                      <Icon 
                        className="w-14 h-14 mb-4 transition-transform group-hover:scale-110 duration-300"
                        style={{ color: `hsl(${color})` }} 
                      />
                      <h3 
                        className="font-display font-bold text-xl text-foreground group-hover:text-[var(--hover-color)] transition-colors duration-300"
                        style={{ '--hover-color': `hsl(${color})` } as any}
                      >
                        {lang === "ar" ? dept.name_ar : dept.name_en}
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

export default YearDepartmentsPage;
