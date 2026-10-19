import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, type MaterialCategory, type Department } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { yearLabel } from "@/lib/year-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Plus, Pencil, Trash2, X, Check, Globe, GraduationCap, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const GLOBAL = "__global__";

const ACADEMIC_YEARS = [
  { id: "1", ar: "الفرقة الأولى", en: "1st Year" },
  { id: "2", ar: "الفرقة الثانية", en: "2nd Year" },
  { id: "3", ar: "الفرقة الثالثة", en: "3rd Year" },
  { id: "4", ar: "الفرقة الرابعة", en: "4th Year" },
  { id: "2b", ar: "الصف الثاني - بكالوريا", en: "2nd Year - Bachelor" },
];

const CategoryManager = () => {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [deptId, setDeptId] = useState<string>(GLOBAL);
  const [academicYear, setAcademicYear] = useState<string>(GLOBAL);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editDeptId, setEditDeptId] = useState<string>(GLOBAL);
  const [editAcademicYear, setEditAcademicYear] = useState<string>(GLOBAL);

  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");

  const load = async () => {
    const [data, depts] = await Promise.all([db.getCategories(), db.getDepartments()]);
    setCategories(data);
    setDepartments(depts);
  };
  useEffect(() => { load(); }, []);

  const deptLabel = (id?: string | null) => {
    if (!id) return lang === "ar" ? "موحد (كل الأقسام)" : "Unified (all departments)";
    const d = departments.find(x => x.id === id);
    return d ? (lang === "ar" ? d.name_ar : d.name_en) : "—";
  };

  const yearLabelText = (y?: string | null) => {
    if (!y) return lang === "ar" ? "موحد (كل الفرق)" : "Unified (all years)";
    return yearLabel(y, lang);
  };

  const visibleCategories = categories.filter(c => {
    const matchesDept = filterDept === "all" ? true : filterDept === GLOBAL ? !c.department_id : c.department_id === filterDept;
    const matchesYear = filterYear === "all" ? true : filterYear === GLOBAL ? !c.academic_year : c.academic_year === filterYear;
    return matchesDept && matchesYear;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameEn) { toast.error(t("cat.fieldsRequired")); return; }
    await db.addCategory({
      name_ar: nameAr,
      name_en: nameEn,
      department_id: deptId === GLOBAL ? null : deptId,
      academic_year: academicYear === GLOBAL ? null : academicYear,
    });
    await load();
    setNameAr("");
    setNameEn("");
    setDeptId(GLOBAL);
    setAcademicYear(GLOBAL);
    toast.success(t("cat.added"));
  };

  const startEdit = (cat: MaterialCategory) => {
    setEditingId(cat.id);
    setEditNameAr(cat.name_ar);
    setEditNameEn(cat.name_en);
    setEditDeptId(cat.department_id || GLOBAL);
    setEditAcademicYear(cat.academic_year || GLOBAL);
  };

  const saveEdit = async (id: string) => {
    await db.updateCategory(id, {
      name_ar: editNameAr,
      name_en: editNameEn,
      department_id: editDeptId === GLOBAL ? null : editDeptId,
      academic_year: editAcademicYear === GLOBAL ? null : editAcademicYear,
    });
    await load();
    setEditingId(null);
    toast.success(t("cat.updated"));
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newCats = [...visibleCategories];
    const temp = newCats[index - 1];
    newCats[index - 1] = newCats[index];
    newCats[index] = temp;
    try {
      await db.reorderCategories(newCats.map(c => c.id));
      await load();
    } catch {
      toast.error(lang === "ar" ? "فشل تغيير الترتيب" : "Failed to reorder");
    }
  };

  const moveDown = async (index: number) => {
    if (index === visibleCategories.length - 1) return;
    const newCats = [...visibleCategories];
    const temp = newCats[index + 1];
    newCats[index + 1] = newCats[index];
    newCats[index] = temp;
    try {
      await db.reorderCategories(newCats.map(c => c.id));
      await load();
    } catch {
      toast.error(lang === "ar" ? "فشل تغيير الترتيب" : "Failed to reorder");
    }
  };

  const handleDelete = async (id: string) => {
    await db.deleteCategory(id);
    await load();
    toast.success(t("cat.deleted"));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
        <div className="glass-card rounded-2xl p-5 sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> {t("cat.addCategory")}
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <Input placeholder={t("cat.nameAr")} value={nameAr} onChange={e => setNameAr(e.target.value)} className="bg-secondary/50" />
            <Input placeholder={t("cat.nameEn")} value={nameEn} onChange={e => setNameEn(e.target.value)} className="bg-secondary/50" />

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {lang === "ar" ? "نطاق القسم (التخصص)" : "Department scope"}
              </label>
              <Select value={deptId} onValueChange={setDeptId}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={GLOBAL}>{lang === "ar" ? "🌐 موحد (كل الأقسام)" : "🌐 Unified (all departments)"}</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {lang === "ar" ? "نطاق الفرقة الدراسية" : "Academic year scope"}
              </label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={GLOBAL}>{lang === "ar" ? "🎓 موحد (كل الفرق)" : "🎓 Unified (all years)"}</SelectItem>
                  {ACADEMIC_YEARS.map(y => (
                    <SelectItem key={y.id} value={y.id}>{lang === "ar" ? y.ar : y.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">{t("cat.add")}</Button>
          </form>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> {t("cat.allCategories")}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="bg-secondary/50 w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "ar" ? "كل الأقسام" : "All departments"}</SelectItem>
                <SelectItem value={GLOBAL}>{lang === "ar" ? "موحد الأقسام فقط" : "Unified depts only"}</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="bg-secondary/50 w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "ar" ? "كل الفرق" : "All years"}</SelectItem>
                <SelectItem value={GLOBAL}>{lang === "ar" ? "موحد الفرق فقط" : "Unified years only"}</SelectItem>
                {ACADEMIC_YEARS.map(y => (
                  <SelectItem key={y.id} value={y.id}>{lang === "ar" ? y.ar : y.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {visibleCategories.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">{t("cat.noCategories")}</p>
          ) : (
            visibleCategories.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5">
                {editingId === cat.id ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Input value={editNameAr} onChange={e => setEditNameAr(e.target.value)} className="bg-secondary/50 text-sm" placeholder={t("cat.nameAr")} />
                      <Input value={editNameEn} onChange={e => setEditNameEn(e.target.value)} className="bg-secondary/50 text-sm" placeholder={t("cat.nameEn")} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1 block">
                          {lang === "ar" ? "نطاق القسم" : "Department"}
                        </label>
                        <Select value={editDeptId} onValueChange={setEditDeptId}>
                          <SelectTrigger className="bg-secondary/50 h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={GLOBAL}>{lang === "ar" ? "🌐 موحد (كل الأقسام)" : "🌐 Unified (all depts)"}</SelectItem>
                            {departments.map(d => (
                              <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1 block">
                          {lang === "ar" ? "نطاق الفرقة" : "Academic Year"}
                        </label>
                        <Select value={editAcademicYear} onValueChange={setEditAcademicYear}>
                          <SelectTrigger className="bg-secondary/50 h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={GLOBAL}>{lang === "ar" ? "🎓 موحد (كل الفرق)" : "🎓 Unified (all years)"}</SelectItem>
                            {ACADEMIC_YEARS.map(y => (
                              <SelectItem key={y.id} value={y.id}>{lang === "ar" ? y.ar : y.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => saveEdit(cat.id)}><Check className="w-3 h-3 me-1" /> {t("schedule.saveEdit")}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-3 h-3 me-1" /> {t("mod.cancel")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{lang === "ar" ? cat.name_ar : cat.name_en}</p>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? cat.name_en : cat.name_ar}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/40 font-medium">
                          <Globe className="w-2.5 h-2.5 text-primary" />
                          {deptLabel(cat.department_id)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/40 font-medium">
                          <GraduationCap className="w-2.5 h-2.5 text-primary" />
                          {yearLabelText(cat.academic_year)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 items-center">
                      <div className="flex flex-col me-2 gap-1 border-e pe-2 border-border/50">
                        <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moveDown(i)} disabled={i === visibleCategories.length - 1} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("cat.deleteCategory")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("cat.deleteConfirm")} "{lang === "ar" ? cat.name_ar : cat.name_en}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("mod.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("mod.delete")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryManager;
