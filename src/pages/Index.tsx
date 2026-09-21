import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, BookOpen, Layers, Monitor, Cpu, GraduationCap, Network } from "lucide-react";
import { playClickSfx } from "@/hooks/use-sfx";
import { useEffect } from "react";
import { setPushAudience } from "@/lib/push-registration";

const YEARS = [
  { id: "1", name_ar: "الفرقة الأولى", name_en: "First Year", icon: GraduationCap, color: "190 80% 45%", route: "departments", desc_ar: "المواد العامة والأساسية", desc_en: "General & Basic Courses" },
  { id: "2", name_ar: "الفرقة الثانية", name_en: "Second Year", icon: Layers, color: "260 70% 55%", route: "departments", desc_ar: "التخصصات التقنية الأساسية", desc_en: "Core Technical Depts" },
  { id: "3", name_ar: "الفرقة الثالثة", name_en: "Third Year", icon: Monitor, color: "340 70% 55%", route: "semesters", desc_ar: "دراسات متقدمة في التخصص", desc_en: "Advanced Studies" },
  { id: "4", name_ar: "الفرقة الرابعة", name_en: "Fourth Year", icon: Cpu, color: "30 80% 50%", route: "semesters", desc_ar: "مشاريع التخرج والتطبيقات", desc_en: "Graduation Projects" },
];

const Index = () => {
  const { t, lang } = useI18n();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    setPushAudience("all");
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative z-10">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">
              <span className="text-gradient">CIC</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-medium">
              CA Interactive Cloud
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-8 flex items-center justify-between"
        >
          <h2 className="text-2xl font-display font-bold text-foreground">
            {lang === "ar" ? "اختر السنة الدراسية" : "Select Academic Year"}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6 rtl:mr-6 rtl:ml-0 hidden sm:block" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto"
        >
          {YEARS.map((year, idx) => {
            const targetRoute = `/year/${year.id}/${year.route}`;
            const Icon = year.icon;
            
            return (
              <motion.div 
                key={year.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1), duration: 0.4, ease: "easeOut" }}
              >
                <Link 
                  to={targetRoute} 
                  onClick={() => playClickSfx()} 
                  className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl group"
                  style={{ "--year-color": `hsl(${year.color})` } as React.CSSProperties}
                >
                  <div className="glass-card rounded-2xl py-8 px-6 h-full relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-white/20 flex flex-col items-center justify-center text-center group">
                    
                    {/* Centered Number Glow */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500"
                      style={{ background: `hsl(${year.color})` }}
                    />

                    <div className="relative z-10">
                      <h2 
                        className="text-6xl font-display font-black mb-2 transition-transform group-hover:scale-110 duration-300"
                        style={{ color: `hsl(${year.color})` }}
                      >
                        {year.id}
                      </h2>
                      <h3 className="font-display font-bold text-xl text-foreground group-hover:text-[var(--year-color)] transition-colors duration-300">
                        {lang === "ar" ? year.name_ar : year.name_en}
                      </h3>
                    </div>
                  </div>
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
