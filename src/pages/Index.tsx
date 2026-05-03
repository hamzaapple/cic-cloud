import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { db, type Department } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Monitor, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { playClickSfx } from "@/hooks/use-sfx";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } }
};

const DEPT_ICONS: Record<string, typeof Monitor> = {
  CS: Monitor,
  "AI, Cyber": Brain,
};

const DEPT_COLORS: Record<string, string> = {
  CS: "190 80% 45%",
  "AI, Cyber": "260 70% 55%",
};

const Index = () => {
  const { t, lang } = useI18n();
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: db.getDepartments
  });

  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="text-gradient">CIC</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            CA Interactive Cloud
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl font-display font-semibold text-foreground">
            {t("dept.selectDepartment")}
          </h2>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {departments.map((dept) => {
            const Icon = DEPT_ICONS[dept.name_en] || Monitor;
            const color = DEPT_COLORS[dept.name_en] || "190 80% 45%";
            return (
              <motion.div key={dept.id} variants={item}>
                <Link to={`/department/${dept.id}`} onClick={() => playClickSfx()}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-card rounded-2xl p-8 h-full group relative overflow-hidden"
                  >
                    {/* Glow background */}
                    <div
                      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, hsl(${color} / 0.4), transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10">
                      <div
                        className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center"
                        style={{ background: `hsl(${color} / 0.15)`, color: `hsl(${color})` }}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="font-display font-bold text-xl mb-2">
                        {lang === "ar" ? dept.name_ar : dept.name_en}
                      </h3>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                        {t("dept.viewCourses")} <Arrow className="w-4 h-4" />
                      </div>
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

export default Index;
