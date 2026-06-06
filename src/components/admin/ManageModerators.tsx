import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, type Moderator, type Permission, type Department, type Course, type ModeratorCourseAccess, PERMISSION_LABELS } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, UserPlus, Shield, ShieldCheck, Pencil, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

const ALL_PERMISSIONS: Permission[] = [
  "edit_content", "add_courses", "strict_add_only",
  "add_pdf_existing", "announcements", "add_external_resources", "manage_categories",
];

interface Props {
  departments: Department[];
}

// ─── Password Display Sub-Component ───
const PasswordDisplay = ({ mod, t, lang, onChangePassword }: {
  mod: Moderator;
  t: (key: string) => string;
  lang: string;
  onChangePassword: () => void;
}) => {
  const [visible, setVisible] = useState(false);
  const hasPlainPassword = !!mod.plain_password;

  return (
    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-secondary/40 border border-border/30">
      <KeyRound className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      {hasPlainPassword ? (
        <>
          <span className={`text-xs font-mono tracking-wider select-all ${visible ? "text-foreground" : "text-muted-foreground"}`}>
            {visible ? mod.plain_password : "••••••••"}
          </span>
          <button
            onClick={() => setVisible(!visible)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title={visible ? (lang === "ar" ? "إخفاء" : "Hide") : (lang === "ar" ? "إظهار" : "Show")}
          >
            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </>
      ) : (
        <span className="text-[10px] text-muted-foreground italic">
          {lang === "ar" ? "غير متوفرة — غيّر الباسورد لحفظها" : "Not available — change password to save it"}
        </span>
      )}
      <button
        onClick={onChangePassword}
        className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium ms-auto"
      >
        {t("mod.changePassword")}
      </button>
    </div>
  );
};

const ManageModerators = ({ departments }: Props) => {
  const { t, lang } = useI18n();
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allAccess, setAllAccess] = useState<ModeratorCourseAccess[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("1");
  const [filterYear, setFilterYear] = useState<string>("all");

  // Edit modal state
  const [editMod, setEditMod] = useState<Moderator | null>(null);
  const [editPerms, setEditPerms] = useState<Permission[]>([]);
  const [editDeptId, setEditDeptId] = useState<string>("");
  const [editYear, setEditYear] = useState<string>("1");
  const [editSharedCourses, setEditSharedCourses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Password change modal state
  const [passwordMod, setPasswordMod] = useState<Moderator | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadMods = async () => {
    const [mods, courses, access] = await Promise.all([
      db.getModerators(),
      db.getCourses(),
      db.getAllModeratorCourseAccess(),
    ]);
    setModerators(mods);
    setAllCourses(courses);
    setAllAccess(access);
  };
  useEffect(() => { loadMods(); }, []);

  const allSelected = ALL_PERMISSIONS.every(p => selectedPerms.includes(p));
  const toggleAll = () => setSelectedPerms(allSelected ? [] : [...ALL_PERMISSIONS]);
  const togglePerm = (perm: Permission) => {
    setSelectedPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !displayName) { toast.error(t("mod.allFieldsRequired")); return; }
    if (selectedPerms.length === 0) { toast.error(t("mod.selectOnePerm")); return; }
    if (!selectedDeptId) { toast.error(t("mod.selectDeptRequired")); return; }
    if (moderators.some(m => m.username === username)) { toast.error(t("mod.usernameExists")); return; }
    await db.addModerator({
      username, password, display_name: displayName,
      permissions: selectedPerms,
      department_id: selectedDeptId || null,
      academic_year: selectedYear,
    });
    await loadMods();
    setUsername(""); setPassword(""); setDisplayName(""); setSelectedPerms([]); setSelectedDeptId(""); setSelectedYear("1");
    toast.success(t("mod.addedSuccess"));
  };

  const handleDelete = async (id: string) => {
    await db.deleteModerator(id);
    await loadMods();
    toast.success(t("mod.deletedSuccess"));
  };

  const openEdit = (mod: Moderator) => {
    setEditMod(mod);
    setEditPerms([...mod.permissions]);
    setEditDeptId(mod.department_id || "");
    setEditYear(mod.academic_year || "1");
    const modAccess = allAccess.filter(a => a.moderator_id === mod.id).map(a => a.course_id);
    setEditSharedCourses(modAccess);
  };

  const handleSaveEdit = async () => {
    if (!editMod) return;
    setSaving(true);
    try {
      await db.updateModerator(editMod.id, {
        permissions: editPerms,
        department_id: editDeptId || null,
        academic_year: editYear,
      });
      await db.setModeratorCourseAccess(editMod.id, editSharedCourses);
      await loadMods();
      setEditMod(null);
      toast.success(t("mod.editedSuccess"));
    } catch {
      toast.error(t("mod.editFail"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordMod) return;
    if (newPassword.length < 4) {
      toast.error(t("mod.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("mod.passwordMismatch"));
      return;
    }
    setSavingPassword(true);
    try {
      await db.updateModeratorPassword(passwordMod.id, newPassword);
      toast.success(t("mod.passwordChanged"));
      setPasswordMod(null);
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      // Audit log
      db.addAuditLog(
        `تغيير كلمة مرور المشرف: ${passwordMod.display_name}`,
        `@${passwordMod.username}`,
        { action_type: "change_password" }
      ).catch(() => {});
    } catch {
      toast.error(t("mod.passwordChangeFail"));
    } finally {
      setSavingPassword(false);
    }
  };

  const getDeptName = (deptId?: string | null) => {
    if (!deptId) return "";
    const dept = departments.find(d => d.id === deptId);
    return dept ? (lang === "ar" ? dept.name_ar : dept.name_en) : "";
  };

  // Courses NOT in the moderator's department (for shared courses)
  const externalCourses = editDeptId ? allCourses.filter(c => c.department_id !== editDeptId) : allCourses;

  const editAllSelected = ALL_PERMISSIONS.every(p => editPerms.includes(p));

  const filteredModerators = filterYear === "all" ? moderators : moderators.filter(m => m.academic_year === filterYear);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
        <div className="glass-card rounded-2xl p-6 sticky top-24">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> {t("mod.addModerator")}
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <Input placeholder={t("mod.displayName")} value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-secondary/50" />
            <Input placeholder={t("mod.username")} value={username} onChange={e => setUsername(e.target.value)} className="bg-secondary/50" />
            <Input type="password" placeholder={t("mod.password")} value={password} onChange={e => setPassword(e.target.value)} className="bg-secondary/50" />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "الصف الدراسي" : "Academic Year"}</p>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={lang === "ar" ? "اختر الصف" : "Select Year"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{lang === "ar" ? "الصف الأول" : "First Year"}</SelectItem>
                  <SelectItem value="2">{lang === "ar" ? "الصف الثاني" : "Second Year"}</SelectItem>
                  <SelectItem value="3">{lang === "ar" ? "الصف الثالث" : "Third Year"}</SelectItem>
                  <SelectItem value="4">{lang === "ar" ? "الصف الرابع" : "Fourth Year"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("mod.department")}</p>
              <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={t("mod.selectDept")} /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> {t("mod.permissions")}</p>

              <label className="flex items-center gap-2 text-sm cursor-pointer font-semibold text-primary py-1 border-b border-border/50 mb-1">
                <button type="button" onClick={toggleAll} className="p-0.5">
                  {allSelected
                    ? <ShieldCheck className="w-5 h-5 text-primary" />
                    : <Shield className="w-5 h-5 text-muted-foreground" />
                  }
                </button>
                {t("mod.allPermissions")}
              </label>

              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedPerms.includes(perm)} onCheckedChange={() => togglePerm(perm)} />
                  {t(`perm.${perm}`)}
                </label>
              ))}
            </div>
            <Button type="submit" className="w-full">{t("mod.addBtn")}</Button>
          </form>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">{t("mod.moderators")}</h2>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[140px] bg-secondary/50 h-8 text-xs">
              <SelectValue placeholder={lang === "ar" ? "كل الصفوف" : "All Years"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === "ar" ? "كل الصفوف" : "All Years"}</SelectItem>
              <SelectItem value="1">{lang === "ar" ? "الصف الأول" : "First Year"}</SelectItem>
              <SelectItem value="2">{lang === "ar" ? "الصف الثاني" : "Second Year"}</SelectItem>
              <SelectItem value="3">{lang === "ar" ? "الصف الثالث" : "Third Year"}</SelectItem>
              <SelectItem value="4">{lang === "ar" ? "الصف الرابع" : "Fourth Year"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          {filteredModerators.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">{t("mod.noModerators")}</p>
          ) : (
            filteredModerators.map((mod, i) => (
              <motion.div key={mod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold">{mod.display_name}</h3>
                    <p className="text-xs text-muted-foreground">@{mod.username}</p>
                    {mod.department_id && (
                      <p className="text-xs text-primary mt-1">{getDeptName(mod.department_id)}</p>
                    )}
                    {/* Password info */}
                    <PasswordDisplay mod={mod} t={t} lang={lang} onChangePassword={() => { setPasswordMod(mod); setNewPassword(""); setConfirmPassword(""); setShowNewPassword(false); }} />
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {mod.permissions.map(perm => (
                        <span key={perm} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {t(`perm.${perm}`)}
                        </span>
                      ))}
                    </div>
                    {/* Show shared courses */}
                    {allAccess.filter(a => a.moderator_id === mod.id).length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] text-muted-foreground">{t("mod.sharedCourses")}:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {allAccess.filter(a => a.moderator_id === mod.id).map(a => {
                            const course = allCourses.find(c => c.id === a.course_id);
                            return course ? (
                              <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                                {course.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(mod)} className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary" title={t("mod.editModerator")}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("mod.deleteMod")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("mod.deleteConfirm")} "{mod.display_name}"?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("mod.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(mod.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("mod.delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Edit Moderator Modal */}
      <Dialog open={!!editMod} onOpenChange={(open) => !open && setEditMod(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("mod.editModerator")} — {editMod?.display_name}</DialogTitle>
            <DialogDescription>@{editMod?.username}</DialogDescription>
          </DialogHeader>

          {/* Year */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "الصف الدراسي" : "Academic Year"}</p>
            <Select value={editYear} onValueChange={setEditYear}>
              <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={lang === "ar" ? "اختر الصف" : "Select Year"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{lang === "ar" ? "الصف الأول" : "First Year"}</SelectItem>
                <SelectItem value="2">{lang === "ar" ? "الصف الثاني" : "Second Year"}</SelectItem>
                <SelectItem value="3">{lang === "ar" ? "الصف الثالث" : "Third Year"}</SelectItem>
                <SelectItem value="4">{lang === "ar" ? "الصف الرابع" : "Fourth Year"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t("mod.department")}</p>
            <Select value={editDeptId} onValueChange={setEditDeptId}>
              <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={t("mod.selectDept")} /></SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> {t("mod.permissions")}</p>
            <label className="flex items-center gap-2 text-sm cursor-pointer font-semibold text-primary py-1 border-b border-border/50 mb-1">
              <button type="button" onClick={() => setEditPerms(editAllSelected ? [] : [...ALL_PERMISSIONS])} className="p-0.5">
                {editAllSelected ? <ShieldCheck className="w-5 h-5 text-primary" /> : <Shield className="w-5 h-5 text-muted-foreground" />}
              </button>
              {t("mod.allPermissions")}
            </label>
            {ALL_PERMISSIONS.map(perm => (
              <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={editPerms.includes(perm)}
                  onCheckedChange={() => setEditPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm])}
                />
                {t(`perm.${perm}`)}
              </label>
            ))}
          </div>

          {/* Shared Courses (External Course Access) */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{t("mod.externalCourseAccess")}</p>
            {externalCourses.length === 0 ? (
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "لا توجد مقررات خارجية" : "No external courses"}</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-border/30 rounded-lg p-2">
                {externalCourses.map(c => (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={editSharedCourses.includes(c.id)}
                      onCheckedChange={() => setEditSharedCourses(prev =>
                        prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                      )}
                    />
                    <span>{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">({getDeptName(c.department_id)})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMod(null)}>{t("mod.cancel")}</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ التعديلات" : "Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={!!passwordMod} onOpenChange={(open) => { if (!open) { setPasswordMod(null); setNewPassword(""); setConfirmPassword(""); setShowNewPassword(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              {t("mod.changePassword")}
            </DialogTitle>
            <DialogDescription>
              {passwordMod?.display_name} — @{passwordMod?.username}
            </DialogDescription>
          </DialogHeader>

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Shield className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              {t("mod.passwordHidden")}
            </p>
          </div>

          <div className="space-y-3">
            {/* New password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">{t("mod.newPassword")}</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="bg-secondary/50 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">{t("mod.confirmPassword")}</label>
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            {/* Mismatch warning */}
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1">
                ⚠️ {t("mod.passwordMismatch")}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setPasswordMod(null); setNewPassword(""); setConfirmPassword(""); setShowNewPassword(false); }}>
              {t("mod.cancel")}
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={savingPassword || !newPassword || newPassword !== confirmPassword}
            >
              {savingPassword ? (t("mod.saving")) : (t("mod.save"))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageModerators;
