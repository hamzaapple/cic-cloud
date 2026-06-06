import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, BookOpen, Layers, Monitor, Cpu } from "lucide-react";
import { playClickSfx } from "@/hooks/use-sfx";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

const YEARS = [
  { id: "1", name_ar: "الصف الدراسي الأول", name_en: "First Academic Year", iconSymbol: "1", color: "190 80% 45%", route: "departments" },
  { id: "2", name_ar: "الصف الدراسي الثاني", name_en: "Second Academic Year", iconSymbol: "2", color: "260 70% 55%", route: "departments" },
  { id: "3", name_ar: "الصف الدراسي الثالث", name_en: "Third Academic Year", iconSymbol: "3", color: "340 70% 55%", route: "semesters" },
  { id: "4", name_ar: "الصف الدراسي الرابع", name_en: "Fourth Academic Year", iconSymbol: "4", color: "30 80% 50%", route: "semesters" },
];

const Index = () => {
  const { t, lang } = useI18n();
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
            {lang === "ar" ? "اختر السنة الدراسية" : "Select Academic Year"}
          </h2>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {YEARS.map((year) => {
            // Determine target route
            // Years 1 & 2 -> /year/:yearId/departments
            // Years 3, 4 -> /year/:yearId/semesters
            const targetRoute = `/year/${year.id}/${year.route}`;

            return (
              <motion.div key={year.id} variants={item}>
                <Link to={targetRoute} onClick={() => playClickSfx()}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="glass-card rounded-2xl p-8 h-full group relative overflow-hidden shadow-sm"
                  >
                    {/* Glow background */}
                    <div
                      className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-all duration-500"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, hsl(${year.color} / 0.5), transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className="mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                      >
                        <span 
                          className="text-7xl font-black"
                          style={{ 
                            color: `hsl(${year.color})`,
                            textShadow: `0 0 40px hsl(${year.color} / 0.6), 0 0 80px hsl(${year.color} / 0.4)`
                          }}
                        >
                          {year.iconSymbol}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-2xl mb-2 text-foreground">
                        {lang === "ar" ? year.name_ar : year.name_en}
                      </h3>
                      <div className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-4" style={{ color: `hsl(${year.color})` }}>
                        {lang === "ar" ? "المتابعة" : "Continue"} <Arrow className="w-4 h-4" />
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
