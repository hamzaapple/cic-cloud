import { motion, type Variants } from "framer-motion";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { db } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { playClickSfx } from "@/hooks/use-sfx";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } }
};

const YearCoursesPage = () => {
  const { yearId } = useParams<{ yearId: string }>();
  const [searchParams] = useSearchParams();
  const deptId = searchParams.get("dept");
  const semesterId = searchParams.get("semester") || "2"; // Default to 2 for backward compatibility
  const { t, tCourse, lang } = useI18n();

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: db.getDepartments
  });

  const { data: deptCourses = [] } = useQuery({
    queryKey: ["courses", "department", deptId],
    queryFn: () => db.getCoursesByDepartment(deptId!),
    enabled: !!deptId,
  });

  // Get shared course IDs for this department
  const { data: sharedCourseIds = [] } = useQuery({
    queryKey: ["shared-dept-courses", deptId],
    queryFn: () => db.getSharedCoursesForDept(deptId!),
    enabled: !!deptId,
  });

  // Get the actual shared courses (or all courses if no deptId)
  const { data: allCourses = [] } = useQuery({
    queryKey: ["courses", "all"],
    queryFn: db.getCourses,
    enabled: sharedCourseIds.length > 0 || !deptId,
  });

  const sharedCourses = allCourses.filter(c => sharedCourseIds.includes(c.id));
  
  // If we have a deptId, show deptCourses + sharedCourses.
  // Otherwise (Year 2, 3 & 4 direct), show all courses.
  const rawCourses = deptId ? [...deptCourses, ...sharedCourses] : allCourses;
  
  // Filter by year and semester (with fallbacks for older data)
  const courses = rawCourses.filter(c => (c.academic_year || "1") === yearId && (c.semester || "2") === semesterId);

  const department = departments.find(d => d.id === deptId);

  // Save department context for schedule page
  useQuery({
    queryKey: ["dept-context", department?.name_en],
    queryFn: () => {
      if (department) {
        const ctx = department.name_en === "CS" ? "cs" : "ai_cyber";
        localStorage.setItem("cic_dept_context", ctx);
      }
      return null;
    },
    enabled: !!department,
  });

  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {deptId ? (
            <Link to={`/year/${yearId}/semesters?dept=${deptId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <BackArrow className="w-4 h-4" /> {lang === "ar" ? "العودة للفصول" : "Back to Semesters"}
            </Link>
          ) : (
            <Link to={`/year/${yearId}/semesters`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <BackArrow className="w-4 h-4" /> {lang === "ar" ? "العودة للفصول" : "Back to Semesters"}
            </Link>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            {department ? (lang === "ar" ? department.name_ar : department.name_en) : (lang === "ar" ? "المواد الدراسية" : "Courses")}
          </h1>
          <p className="text-muted-foreground">{t("dept.coursesIn")}</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              {t("index.noCourses")}
            </div>
          ) : (
            courses.map((course) =>
              <motion.div key={course.id} variants={item}>
                <Link to={`/course/${course.id}`} onClick={() => playClickSfx()}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card rounded-2xl p-6 h-full group relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, hsl(${course.color} / 0.4), transparent 70%)`,
                      }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ background: `hsl(${course.color} / 0.15)`, color: `hsl(${course.color})` }}>
                          {course.code.slice(0, 2)}
                        </div>
                        {deptId && course.department_id !== deptId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {lang === "ar" ? "مشترك" : "Shared"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-1">{tCourse(course.name)}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {lang === "ar" ? (course as any).description_ar || course.description : course.description}
                      </p>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {t("index.openCourse")} <Arrow className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default YearCoursesPage;
