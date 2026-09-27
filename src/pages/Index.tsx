import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, BookOpen, Layers, Monitor, Cpu, GraduationCap, Network } from "lucide-react";
import { useEffect } from "react";
import { setPushAudience } from "@/lib/push-registration";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/store";
import { BulkOfflineDownloadButton } from "@/components/BulkOfflineDownloadButton";
import { playClickSfx } from "@/hooks/use-sfx";

const YEARS = [
  { id: "1", name_ar: "الفرقة الأولى", name_en: "First Year", icon: GraduationCap, color: "190 80% 45%", route: "departments", desc_ar: "المواد العامة والأساسية", desc_en: "General & Basic Courses" },
  { id: "2", name_ar: "الفرقة الثانية", name_en: "Second Year", icon: Layers, color: "260 70% 55%", route: "departments", desc_ar: "التخصصات التقنية الأساسية", desc_en: "Core Technical Depts" },
  { id: "3", name_ar: "الفرقة الثالثة", name_en: "Third Year", icon: Monitor, color: "340 70% 55%", route: "departments", desc_ar: "دراسات متقدمة في التخصص", desc_en: "Advanced Studies" },
  { id: "4", name_ar: "الفرقة الرابعة", name_en: "Fourth Year", icon: Cpu, color: "30 80% 50%", route: "departments", desc_ar: "مشاريع التخرج والتطبيقات", desc_en: "Graduation Projects" },
];

const YearCard = ({ year, idx }: { year: typeof YEARS[0], idx: number }) => {
  const { lang } = useI18n();
  const targetRoute = `/year/${year.id}/${year.route}`;
  
  // Fetch courses for this year to get their IDs
  const { data: allCourses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: db.getCourses
  });
  
  const yearCourses = allCourses.filter(c => (c.academic_year || "1") === year.id);
  
  // Fetch material URLs for this year's courses
  const { data: yearUrls = [] } = useQuery({
    queryKey: ["year-urls", yearCourses.map(c => c.id)],
    queryFn: () => db.getMaterialUrlsForCourses(yearCourses.map(c => c.id)),
    enabled: yearCourses.length > 0
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + (idx * 0.05), duration: 0.3, ease: "easeOut" }}
      className="relative group h-full"
      style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
    >
      <Link 
        to={targetRoute} 
        onClick={() => playClickSfx()} 
        className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
        style={{ "--year-color": `hsl(${year.color})` } as React.CSSProperties}
      >
        <div className="glass-card rounded-2xl pt-8 pb-16 px-6 h-full relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-white/20 flex flex-col items-center justify-center text-center min-h-[200px]">
          
          {/* Smooth GPU radial gradient — Never clips into a rectangle/square on mobile iOS/Android */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-25 group-hover:opacity-50"
            style={{
              background: `radial-gradient(circle at 50% 38%, hsl(${year.color} / 0.35) 0%, transparent 65%)`,
            }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center">
            <h2 
              className="text-6xl md:text-7xl font-display font-black mb-1 transition-transform group-hover:scale-105 duration-300 select-none"
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
      
      {/* Quick Download Button layered on top to not trigger the Link */}
      <div className="absolute bottom-3.5 left-0 w-full flex justify-center z-20 pointer-events-none px-4">
        <div 
          className="pointer-events-auto"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <BulkOfflineDownloadButton 
            urls={yearUrls} 
            label={{ ar: "حفظ الصف أوفلاين", en: "Save Year Offline" }} 
            className="rounded-full shadow-md border-border/50 bg-background/90 hover:bg-background text-xs font-semibold px-4 py-1.5"
          />
        </div>
      </div>
    </motion.div>
  );
};

const Index = () => {
  const { t, lang } = useI18n();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    setPushAudience("all");
  }, []);

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-32 px-4 relative z-10">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-10 md:mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-3 tracking-tight">
            <span className="text-gradient">CIC</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto font-medium">
            CA Interactive Cloud
          </p>
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
          {YEARS.map((year, idx) => (
            <YearCard key={year.id} year={year} idx={idx} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
