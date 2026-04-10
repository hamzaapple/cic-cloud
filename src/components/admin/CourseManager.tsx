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
import { BookPlus, Pencil, Trash2, X, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  courses: Course[];
  departments: Department[];
  deptFilter: string;
  onUpdate: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

const CourseManager = ({ courses, departments, deptFilter, onUpdate, canEdit, canDelete, canCreate }: Props) => {
  const { t, lang } = useI18n();
  const isOwner = auth.isOwner();
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseDeptId, setCourseDeptId] = useState(deptFilter !== "all" ? deptFilter : (departments[0]?.id || ""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDesc, setEditDesc] = useState("");

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
    await db.addCourse({ name: courseName, code: courseCode, description: courseDesc, department_id: courseDeptId || undefined });
    onUpdate();
    setCourseName(""); setCourseCode(""); setCourseDesc("");
    toast.success(t("admin.uploadSuccess"));
  };

  const startEdit = (c: Course) => { setEditingId(c.id); setEditName(translateCourseName(c.name, lang)); setEditCode(c.code); setEditDesc(c.description); };

  const saveEdit = async (id: string) => {
    await db.updateCourse(id, { name: editName, code: editCode, description: editDesc });
    onUpdate();
    setEditingId(null);
    toast.success(t("courseMgr.allCourses"));
  };

  const handleDeleteCourse = async (id: string) => {
    await db.deleteCourse(id);
    onUpdate();
    toast.success(t("admin.materialDeleted"));
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
                      return (
                        <label key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <Checkbox
                            checked={sharedCourseIds.includes(c.id)}
                            onCheckedChange={() => toggleSharedCourse(c.id)}
                          />
                          <div>
                            <p className="text-sm font-medium">{translateCourseName(c.name, lang)}</p>
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
                <Textarea placeholder={t("courseMgr.courseDesc")} value={courseDesc} onChange={e => setCourseDesc(e.target.value)} className="bg-secondary/50 min-h-[80px]" />
                <Select value={courseDeptId} onValueChange={setCourseDeptId}>
                  <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={t("admin.selectDept")} /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full">{t("courseMgr.add")}</Button>
              </form>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={canCreate ? "lg:col-span-2" : "lg:col-span-3"}>
          <h2 className="font-display font-semibold text-lg mb-4">{t("courseMgr.allCourses")}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5">
                {editingId === course.id ? (
                  <div className="space-y-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-secondary/50 text-sm" />
                    <Input value={editCode} onChange={e => setEditCode(e.target.value)} className="bg-secondary/50 text-sm" />
                    <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="bg-secondary/50 text-sm min-h-[60px]" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(course.id)}><Check className="w-3 h-3 ml-1" /> {t("schedule.saveEdit")}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-3 h-3 ml-1" /> {t("mod.cancel")}</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-sm font-bold" style={{ background: `hsl(${course.color} / 0.15)`, color: `hsl(${course.color})` }}>
                        {course.code.slice(0, 2)}
                      </div>
                      <div className="flex gap-1">
                        {canEdit && <button onClick={() => startEdit(course)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>}
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild><button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button></AlertDialogTrigger>
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
                    <h3 className="font-display font-semibold text-sm">{translateCourseName(course.name, lang)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{course.code}</p>
                    {course.description && <p className="text-xs text-muted-foreground mt-1">{course.description}</p>}
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseManager;
