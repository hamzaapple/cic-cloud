import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, auth, type Course, type Department } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { translateCourseName } from "@/lib/subject-translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookPlus, Pencil, Trash2, X, Check, Share2, CalendarDays, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  courses: Course[];
  departments: Department[];
  deptFilter: string;
  semesterFilter?: string;
  onSemesterFilterChange?: (sem: string) => void;
  onUpdate: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

const CourseManager = ({
  courses,
  departments,
  deptFilter,
  semesterFilter,
  onSemesterFilterChange,
  onUpdate,
  canEdit,
  canDelete,
  canCreate
}: Props) => {
  const { t, lang } = useI18n();
  const user = auth.getCurrentUser();
  const isOwner = user.role === "owner";
  const modYear = user.academicYear || "1";
  
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseNotes, setCourseNotes] = useState("");
  const [courseDeptId, setCourseDeptId] = useState(deptFilter !== "all" ? deptFilter : (departments[0]?.id || ""));
  const [courseYear, setCourseYear] = useState(isOwner ? "1" : modYear);
  const [courseSemester, setCourseSemester] = useState(
    semesterFilter && semesterFilter !== "all" ? semesterFilter : "1"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editYear, setEditYear] = useState("1");
  const [editSemester, setEditSemester] = useState("1");

  const [courseTargetDepts, setCourseTargetDepts] = useState<string[]>([]);
  const [editTargetDepts, setEditTargetDepts] = useState<string[]>([]);

  // Update default courseSemester when the active semester filter changes
  useEffect(() => {
    if (semesterFilter && semesterFilter !== "all") {
      setCourseSemester(semesterFilter);
    }
  }, [semesterFilter]);

  // Shared courses state
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareDeptId, setShareDeptId] = useState("");
  const [sharedCourseIds, setSharedCourseIds] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [savingShared, setSavingShared] = useState(false);

  useEffect(() => {
    if (showSharePanel && shareDeptId) {
      loadSharedCourses();
    }
  }, [showSharePanel, shareDeptId]);

  const loadSharedCourses = async () => {
    if (!shareDeptId) return;
    const [shared, all] = await Promise.all([
      db.getSharedCoursesForDept(shareDeptId),
      db.getCourses(),
    ]);
    setSharedCourseIds(shared);
    setAllCourses(all);
  };

  const handleSaveShared = async () => {
    if (!shareDeptId) return;
    setSavingShared(true);
    try {
      await db.setSharedCoursesForDept(shareDeptId, sharedCourseIds);
      toast.success(lang === "ar" ? "تم حفظ المقررات المشتركة" : "Shared courses saved");
    } catch {
      toast.error(lang === "ar" ? "فشل الحفظ" : "Save failed");
    } finally {
      setSavingShared(false);
    }
  };

  const toggleSharedCourse = (courseId: string) => {
    setSharedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Courses NOT in this department (available to share)
  const otherDeptCourses = allCourses.filter(c => c.department_id !== shareDeptId);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !courseCode) { toast.error(t("admin.titleAndCourseReq")); return; }
    try {
      const newCourse = await db.addCourse({
        name: courseName,
        code: courseCode,
        description: courseDesc,
        notes: courseNotes.trim() || null,
        department_id: courseDeptId === "none" ? null : (courseDeptId || null),
        academic_year: courseYear,
        semester: courseSemester
      });
      if (courseTargetDepts.length > 0) {
        await db.setTargetDepartmentsForCourse(newCourse.id, courseTargetDepts);
      }
      onUpdate();
      setCourseName("");
      setCourseCode("");
      setCourseDesc("");
      setCourseNotes("");
      setCourseYear(isOwner ? "1" : modYear);
      setCourseSemester(semesterFilter && semesterFilter !== "all" ? semesterFilter : "1");
      setCourseTargetDepts([]);
      toast.success(t("admin.uploadSuccess"));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add course");
    }
  };

  const startEdit = async (c: Course) => { 
    setEditingId(c.id); 
    setEditName(translateCourseName(c.name, lang)); 
    setEditCode(c.code); 
    setEditDesc(c.description || ""); 
    setEditNotes(c.notes || "");
    setEditYear(c.academic_year || "1"); 
    setEditSemester(c.semester || "2");
    
    try {
      const shared = await db.getTargetDepartmentsForCourse(c.id);
      setEditTargetDepts(shared);
    } catch (e) {
      setEditTargetDepts([]);
    }
  };

  const saveEdit = async (id: string) => {
    await db.updateCourse(id, { name: editName, code: editCode, description: editDesc, notes: editNotes.trim() || null, academic_year: editYear, semester: editSemester });
    await db.setTargetDepartmentsForCourse(id, editTargetDepts);
    onUpdate();
    setEditingId(null);
    toast.success(t("courseMgr.allCourses"));
  };

  const handleDeleteCourse = async (id: string) => {
    await db.deleteCourse(id);
    onUpdate();
    toast.success(t("admin.materialDeleted"));
  };

  // Split courses by semester
  const sem1Courses = courses.filter(c => (c.semester || "2") === "1");
  const sem2Courses = courses.filter(c => (c.semester || "2") === "2");

  const getYearLabel = (y?: string) => {
    switch (y) {
      case "1": return lang === "ar" ? "الصف الأول" : "1st Year";
      case "2": return lang === "ar" ? "الصف الثاني" : "2nd Year";
      case "3": return lang === "ar" ? "الصف الثالث" : "3rd Year";
      case "4": return lang === "ar" ? "الصف الرابع" : "4th Year";
      case "2b": return lang === "ar" ? "بكالوريا" : "Bachelor";
      default: return lang === "ar" ? "الصف الأول" : "1st Year";
    }
  };

  const renderCourseCard = (course: Course, i: number) => {
    const isSem1 = (course.semester || "2") === "1";
    const dept = departments.find(d => d.id === course.department_id);
    const deptName = dept ? (lang === "ar" ? dept.name_ar : dept.name_en) : null;

    return (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
        className="glass-card rounded-xl p-5 border border-border/40 hover:border-primary/30 transition-all flex flex-col justify-between"
      >
        {editingId === course.id ? (
          <div className="space-y-2">
            <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-secondary/50 text-sm" placeholder={t("courseMgr.courseName")} />
            <Input value={editCode} onChange={e => setEditCode(e.target.value)} className="bg-secondary/50 text-sm" placeholder={t("courseMgr.courseCode")} />
            <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="bg-secondary/50 text-sm min-h-[50px]" placeholder={t("courseMgr.courseDesc")} />
            <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="bg-secondary/50 text-sm min-h-[50px]" placeholder={lang === "ar" ? "ملحوظات المادة (تظهر للطلاب بخلفية هادئة)" : "Course Notes (displays with tinted background)"} />
            <div className="grid grid-cols-2 gap-2">
              <Select value={editYear} onValueChange={setEditYear} disabled={!isOwner}>
                <SelectTrigger className="bg-secondary/50 h-8 text-xs"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{lang === "ar" ? "الصف الأول" : "1st Year"}</SelectItem>
                  <SelectItem value="2">{lang === "ar" ? "الصف الثاني" : "2nd Year"}</SelectItem>
                  <SelectItem value="3">{lang === "ar" ? "الصف الثالث" : "3rd Year"}</SelectItem>
                  <SelectItem value="4">{lang === "ar" ? "الصف الرابع" : "4th Year"}</SelectItem>
                  {isOwner && <SelectItem value="2b">{lang === "ar" ? "2 - بكالوريا" : "2nd Year - Bachelor"}</SelectItem>}
                </SelectContent>
              </Select>
              <Select value={editSemester} onValueChange={setEditSemester}>
                <SelectTrigger className="bg-secondary/50 h-8 text-xs"><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{lang === "ar" ? "الفصل الأول (S1)" : "1st Sem (S1)"}</SelectItem>
                  <SelectItem value="2">{lang === "ar" ? "الفصل الثاني (S2)" : "2nd Sem (S2)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {departments.length > 1 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "مشاركة مع أقسام أخرى:" : "Share with other departments:"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {departments.filter(d => d.id !== course.department_id).map(d => (
                    <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={editTargetDepts.includes(d.id)}
                        onCheckedChange={() => setEditTargetDepts(prev => prev.includes(d.id) ? prev.filter(id => id !== d.id) : [...prev, d.id])}
                      />
                      {lang === "ar" ? d.name_ar : d.name_en}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => saveEdit(course.id)}><Check className="w-3 h-3 ml-1" /> {t("schedule.saveEdit")}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-3 h-3 ml-1" /> {t("mod.cancel")}</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm" style={{ background: `hsl(${course.color} / 0.15)`, color: `hsl(${course.color})` }}>
                {course.code.slice(0, 2)}
              </div>
              <div className="flex items-center gap-1">
                {canEdit && (
                  <button
                    onClick={() => startEdit(course)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title={lang === "ar" ? "تعديل المقرر" : "Edit course"}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title={lang === "ar" ? "حذف المقرر" : "Delete course"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("courseMgr.deleteCourse")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("courseMgr.deleteConfirm")} "{translateCourseName(course.name, lang)}"?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("mod.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCourse(course.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("mod.delete")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Visual badges for Semester, Year, and Department */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {isSem1 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                  {lang === "ar" ? "الفصل الأول" : "Semester 1"}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-500 border border-purple-500/30">
                  {lang === "ar" ? "الفصل الثاني" : "Semester 2"}
                </span>
              )}
              {course.academic_year && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/50">
                  {getYearLabel(course.academic_year)}
                </span>
              )}
              {deptName && (
                <span className="px-2 py-0.5 rounded-full text-[10px] text-muted-foreground bg-secondary/80">
                  {deptName}
                </span>
              )}
            </div>

            <h3 className="font-display font-semibold text-sm text-foreground">{translateCourseName(course.name, lang)}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{course.code}</p>
            {course.description && <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{course.description}</p>}
            {course.notes && (
              <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-foreground/90">
                <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-0.5">📌 {lang === "ar" ? "ملحوظات المادة:" : "Course Notes:"}</span>
                <p className="line-clamp-2">{course.notes}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Share courses panel - Owner only */}
      {isOwner && departments.length > 1 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              {lang === "ar" ? "مشاركة مقررات بين الأقسام" : "Share Courses Across Departments"}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowSharePanel(!showSharePanel)}>
              {showSharePanel ? (lang === "ar" ? "إغلاق" : "Close") : (lang === "ar" ? "إدارة" : "Manage")}
            </Button>
          </div>
          {showSharePanel && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {lang === "ar" ? "القسم المستهدف (الذي ستظهر فيه المقررات)" : "Target Department (where courses will appear)"}
                </label>
                <Select value={shareDeptId} onValueChange={setShareDeptId}>
                  <SelectTrigger className="w-64 bg-secondary/50">
                    <SelectValue placeholder={lang === "ar" ? "اختر القسم" : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {shareDeptId && otherDeptCourses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "اختر المقررات من الأقسام الأخرى لمشاركتها:" : "Select courses from other departments to share:"}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {otherDeptCourses.map(c => {
                      const dept = departments.find(d => d.id === c.department_id);
                      const semLabel = (c.semester || "2") === "1"
                        ? (lang === "ar" ? "[فصل 1]" : "[S1]")
                        : (lang === "ar" ? "[فصل 2]" : "[S2]");
                      return (
                        <label key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <Checkbox
                            checked={sharedCourseIds.includes(c.id)}
                            onCheckedChange={() => toggleSharedCourse(c.id)}
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {translateCourseName(c.name, lang)} <span className="text-xs text-primary font-normal">{semLabel}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dept ? (lang === "ar" ? dept.name_ar : dept.name_en) : ""} — {c.code}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <Button onClick={handleSaveShared} disabled={savingShared} size="sm">
                    {savingShared ? "..." : (lang === "ar" ? "حفظ" : "Save")}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {canCreate && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <BookPlus className="w-5 h-5 text-primary" /> {t("courseMgr.addCourse")}
              </h2>
              <form onSubmit={handleAddCourse} className="space-y-3">
                <Input placeholder={t("courseMgr.courseName")} value={courseName} onChange={e => setCourseName(e.target.value)} className="bg-secondary/50" />
                <Input placeholder={t("courseMgr.courseCode")} value={courseCode} onChange={e => setCourseCode(e.target.value)} className="bg-secondary/50" />
                <Textarea placeholder={t("courseMgr.courseDesc")} value={courseDesc} onChange={e => setCourseDesc(e.target.value)} className="bg-secondary/50 min-h-[70px]" />
                <Textarea placeholder={lang === "ar" ? "ملحوظات المادة (اختياري - تظهر للطلاب في صفحة المقرر بخلفية ملونة هادئة)" : "Course Notes (optional - displays at top of course page with tinted background)"} value={courseNotes} onChange={e => setCourseNotes(e.target.value)} className="bg-secondary/50 min-h-[60px] text-xs" />
                <Select value={courseDeptId} onValueChange={setCourseDeptId}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={t("admin.selectDept")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{lang === "ar" ? "بدون قسم" : "No Department"}</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {departments.length > 1 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "مشاركة مع أقسام أخرى:" : "Share with other departments:"}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {departments.filter(d => d.id !== courseDeptId).map(d => (
                        <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer">
                          <Checkbox
                            checked={courseTargetDepts.includes(d.id)}
                            onCheckedChange={() => setCourseTargetDepts(prev => prev.includes(d.id) ? prev.filter(id => id !== d.id) : [...prev, d.id])}
                          />
                          {lang === "ar" ? d.name_ar : d.name_en}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                      {lang === "ar" ? "الصف الدراسي" : "Academic Year"}
                    </label>
                    <Select value={courseYear} onValueChange={setCourseYear} disabled={!isOwner}>
                      <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{lang === "ar" ? "الصف الأول" : "1st Year"}</SelectItem>
                        <SelectItem value="2">{lang === "ar" ? "الصف الثاني" : "2nd Year"}</SelectItem>
                        <SelectItem value="3">{lang === "ar" ? "الصف الثالث" : "3rd Year"}</SelectItem>
                        <SelectItem value="4">{lang === "ar" ? "الصف الرابع" : "4th Year"}</SelectItem>
                        {isOwner && <SelectItem value="2b">{lang === "ar" ? "الصف الثاني - بكالوريا" : "2nd Year - Bachelor"}</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                      {lang === "ar" ? "الفصل الدراسي" : "Semester"}
                    </label>
                    <Select value={courseSemester} onValueChange={setCourseSemester}>
                      <SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Semester" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{lang === "ar" ? "الفصل الأول" : "1st Semester"}</SelectItem>
                        <SelectItem value="2">{lang === "ar" ? "الفصل الثاني" : "2nd Semester"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">{t("courseMgr.add")}</Button>
              </form>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={canCreate ? "lg:col-span-2" : "lg:col-span-3"}>
          {/* Header with Quick Semester Tabs */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display font-semibold text-lg">{t("courseMgr.allCourses")}</h2>
              <p className="text-xs text-muted-foreground">
                {lang === "ar" 
                  ? `إجمالي المقررات: ${courses.length} (الفصل الأول: ${sem1Courses.length} | الفصل الثاني: ${sem2Courses.length})` 
                  : `Total courses: ${courses.length} (Sem 1: ${sem1Courses.length} | Sem 2: ${sem2Courses.length})`}
              </p>
            </div>
            {onSemesterFilterChange && (
              <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-border/40">
                {[
                  { id: "all", label: lang === "ar" ? `كل الفصول (${courses.length})` : `All (${courses.length})` },
                  { id: "1", label: lang === "ar" ? `الفصل الأول (${sem1Courses.length})` : `Sem 1 (${sem1Courses.length})` },
                  { id: "2", label: lang === "ar" ? `الفصل الثاني (${sem2Courses.length})` : `Sem 2 (${sem2Courses.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSemesterFilterChange(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      (semesterFilter || "all") === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">
              {lang === "ar" ? "لا توجد مقررات مضافة تطابق التصفية الحالية" : "No courses found matching current filters"}
            </div>
          ) : (semesterFilter === "all" ? (
            <div className="space-y-8">
              {/* Semester 1 Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                    <h3 className="font-display font-bold text-sm md:text-base text-foreground">
                      {lang === "ar" ? "مقررات الفصل الدراسي الأول" : "First Semester Courses"}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {sem1Courses.length} {lang === "ar" ? "مقرر" : "courses"}
                  </span>
                </div>
                {sem1Courses.length === 0 ? (
                  <div className="glass-card rounded-xl p-6 text-center text-muted-foreground text-xs">
                    {lang === "ar" ? "لا توجد مقررات مسجلة في الفصل الأول" : "No courses registered for the first semester"}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {sem1Courses.map((c, i) => renderCourseCard(c, i))}
                  </div>
                )}
              </div>

              {/* Semester 2 Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
                    <h3 className="font-display font-bold text-sm md:text-base text-foreground">
                      {lang === "ar" ? "مقررات الفصل الدراسي الثاني" : "Second Semester Courses"}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    {sem2Courses.length} {lang === "ar" ? "مقرر" : "courses"}
                  </span>
                </div>
                {sem2Courses.length === 0 ? (
                  <div className="glass-card rounded-xl p-6 text-center text-muted-foreground text-xs">
                    {lang === "ar" ? "لا توجد مقررات مسجلة في الفصل الثاني" : "No courses registered for the second semester"}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {sem2Courses.map((c, i) => renderCourseCard(c, i))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${semesterFilter === "1" ? "bg-blue-500" : "bg-purple-500"}`} />
                  <h3 className="font-display font-bold text-sm md:text-base text-foreground">
                    {semesterFilter === "1"
                      ? (lang === "ar" ? "مقررات الفصل الدراسي الأول" : "First Semester Courses")
                      : (lang === "ar" ? "مقررات الفصل الدراسي الثاني" : "Second Semester Courses")}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  semesterFilter === "1" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                }`}>
                  {courses.length} {lang === "ar" ? "مقرر" : "courses"}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {courses.map((c, i) => renderCourseCard(c, i))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CourseManager;
