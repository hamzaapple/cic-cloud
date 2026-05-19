import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, type Course, type Material, type ImportantLink, type Department, type MaterialCategory } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { translateCourseName } from "@/lib/subject-translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MaterialCard from "@/components/MaterialCard";
import { LogOut, Plus, Bell, Link2, Upload, Trash2, BookPlus, Users, Layers, FolderUp } from "lucide-react";
import { toast } from "sonner";
import ManageModerators from "@/components/admin/ManageModerators";
import CourseManager from "@/components/admin/CourseManager";
import NotificationManager from "@/components/admin/NotificationManager";
import CategoryManager from "@/components/admin/CategoryManager";
import AnnouncementManager from "@/components/admin/AnnouncementManager";
import AuditLog from "./AuditLog";
import { ShieldAlert, Megaphone } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const user = auth.getCurrentUser();
  const isOwner = user.role === "owner";

  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const loadData = useCallback(async () => {
    const deptId = user.role === "moderator" ? user.departmentId : undefined;
    
    // Owner sees everything; moderator sees their dept + shared courses
    let coursesResult: Course[];
    let materialsResult: Material[];
    
    if (isOwner || !deptId) {
      // Owner: get all
      const [c, m] = await Promise.all([db.getCourses(), db.getMaterials()]);
      coursesResult = c;
      materialsResult = m;
    } else {
      // Moderator: get dept courses + shared courses
      const [deptCourses, deptMats, sharedAccess, allCourses] = await Promise.all([
        db.getCoursesByDepartment(deptId),
        db.getMaterialsByDepartment(deptId),
        user.moderatorId ? db.getModeratorCourseAccess(user.moderatorId) : Promise.resolve([]),
        db.getCourses(),
      ]);
      const sharedCourseIds = sharedAccess.map(a => a.course_id);
      const sharedCourses = allCourses.filter(c => sharedCourseIds.includes(c.id));
      coursesResult = [...deptCourses, ...sharedCourses];
      
      // Get materials for shared courses too
      if (sharedCourseIds.length > 0) {
        const allMats = await db.getMaterials();
        const sharedMats = allMats.filter(m => sharedCourseIds.includes(m.course_id));
        materialsResult = [...deptMats, ...sharedMats];
      } else {
        materialsResult = deptMats;
      }
    }
    
    const [l, d, cats] = await Promise.all([
      db.getLinks(deptId || null),
      db.getDepartments(),
      db.getCategories()
    ]);
    setCourses(coursesResult); setMaterials(materialsResult); setLinks(l); setDepartments(d); setCategories(cats);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // If moderator has department_id, lock filter
  useEffect(() => {
    if (user.role === "moderator" && user.departmentId) {
      setDeptFilter(user.departmentId);
    }
  }, [user.role, user.departmentId]);

  const sections: { key: string; label: string; icon: any }[] = [];
  if (isOwner || auth.hasPermission("add_courses") || auth.hasPermission("add_pdf_existing") || auth.hasPermission("strict_add_only")) {
    sections.push({ key: "materials", label: t("admin.materials"), icon: Upload });
  }
  if (isOwner || auth.hasPermission("add_courses") || auth.hasPermission("edit_content")) {
    sections.push({ key: "courses", label: t("admin.courses"), icon: BookPlus });
  }
  if (isOwner || auth.hasPermission("add_external_resources")) {
    sections.push({ key: "links", label: t("admin.links"), icon: Link2 });
  }
  if (isOwner || auth.hasPermission("announcements")) {
    sections.push({ key: "notifications", label: t("admin.notifications"), icon: Bell });
  }
  if (isOwner || auth.hasPermission("manage_categories")) {
    sections.push({ key: "categories", label: t("admin.categories"), icon: Layers });
  }
  if (isOwner || auth.hasPermission("announcements")) {
    sections.push({ key: "announcements", label: lang === "ar" ? "الإعلانات العامة" : "Announcements", icon: Megaphone });
  }
  if (isOwner) {
    sections.push({ key: "moderators", label: t("admin.moderators"), icon: Users });
    sections.push({ key: "audit_logs", label: lang === "ar" ? "سجل الإدارة" : "Audit Logs", icon: ShieldAlert });
  }

  const [activeSection, setActiveSection] = useState(sections[0]?.key || "materials");

  // Upload form state
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isAssignmentOpenEnded, setIsAssignmentOpenEnded] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfExternalUrl, setPdfExternalUrl] = useState("");
  const [pdfDisplayName, setPdfDisplayName] = useState("");
  const [pdfMode, setPdfMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);

  // Bulk folder upload state
  const [isFolderMode, setIsFolderMode] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkTotal, setBulkTotal] = useState(0);

  // Find assignment category
  const assignmentCategory = categories.find(c => c.name_en === "Assignments");
  const isAssignment = categoryId === assignmentCategory?.id;

  // Link form state
  const [linkTitle, setLinkTitle] = useState("");
  const [linkTitleAr, setLinkTitleAr] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [showArchived, setShowArchived] = useState(false);
  const [materialCourseFilter, setMaterialCourseFilter] = useState<string>("all");
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState<string>("all");

  if (!auth.isLoggedIn()) { navigate("/login"); return null; }

  const canAddMaterials = isOwner || auth.hasPermission("add_courses") || auth.hasPermission("add_pdf_existing") || auth.hasPermission("strict_add_only");
  const canDelete = isOwner || (auth.hasPermission("edit_content") && !auth.hasPermission("strict_add_only"));
  const canEdit = isOwner || auth.hasPermission("edit_content");
  const isStrictAddOnly = !isOwner && auth.hasPermission("strict_add_only");
  const isPdfOnly = !isOwner && auth.hasPermission("add_pdf_existing") && !auth.hasPermission("add_courses");
  const canAddExtLinks = isOwner || auth.hasPermission("add_external_resources");

  // Filter courses by department
  const filteredCourses = deptFilter === "all" ? courses : courses.filter(c => c.department_id === deptFilter);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseId) { toast.error(t("admin.titleAndCourseReq")); return; }

    if (isAssignment && !isAssignmentOpenEnded && !deadline) { toast.error(t("admin.deadlineRequired")); return; }

    setUploading(true);
    try {
      let pdfUrl: string | null = null;
      if (pdfMode === "upload" && pdfFile) {
        pdfUrl = await db.uploadPdf(pdfFile);
      } else if (pdfMode === "url" && pdfExternalUrl) {
        pdfUrl = pdfExternalUrl;
      }

      await db.addMaterial({
        title,
        course_id: courseId,
        type: "lecture",
        category_id: categoryId || null,
        pdf_url: pdfUrl,
        pdf_display_name: pdfDisplayName || null,
        external_link: isPdfOnly ? null : (externalLink || null),
        submission_link: isAssignment ? (submissionLink || null) : null,
        deadline: isAssignmentOpenEnded ? null : (deadline || null),
        is_assignment: isAssignment,
      });

      await loadData();
      setTitle(""); setExternalLink(""); setSubmissionLink(""); setDeadline(""); setIsAssignmentOpenEnded(false);
      setPdfFile(null); setPdfExternalUrl(""); setPdfDisplayName("");
      const fileInput = document.getElementById("pdf-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      toast.success(t("admin.uploadSuccess"));

      // Auto notification (fire-and-forget — failure doesn't affect material upload)
      const course = courses.find(c => c.id === courseId);
      const courseName = course?.name || "";
      const catName = categories.find(c => c.id === categoryId);
      const typeLabel = catName ? (lang === "ar" ? catName.name_ar : catName.name_en) : "";

      db.addNotification({
        title: `تم رفع ${typeLabel}: ${pdfDisplayName || title}`,
        message: isAssignment ? (isAssignmentOpenEnded ? `بدون موعد نهائي` : `موعد التسليم: ${deadline}`) : `في مقرر ${courseName}`,
        target_audience: "all",
        sent_by: "system",
      }).catch(err => console.warn("Auto-notification failed (material was uploaded):", err));

    } catch {
      toast.error(t("admin.uploadFail"));
    } finally {
      setUploading(false);
    }
  };

  // ─── Bulk Folder Upload Handler ───
  const handleBulkFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    if (!courseId) {
      toast.error(t("admin.bulkSelectCourseCategory"));
      e.target.value = "";
      return;
    }

    // Filter to PDF files only
    const pdfFiles = Array.from(fileList).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length === 0) {
      toast.warning(t("admin.bulkNoPdfs"));
      e.target.value = "";
      return;
    }

    setUploading(true);
    setBulkTotal(pdfFiles.length);
    setBulkProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      setBulkProgress(i + 1);

      // Derive a user-friendly title from the original file name (without extension)
      const originalName = file.name;
      const friendlyTitle = originalName.replace(/\.pdf$/i, "");

      try {
        // Upload with sanitized storage path
        const pdfUrl = await db.uploadPdfSanitized(file);

        // Insert into materials table
        await db.addMaterial({
          title: friendlyTitle,
          course_id: courseId,
          type: "lecture",
          category_id: categoryId || null,
          pdf_url: pdfUrl,
          pdf_display_name: friendlyTitle,
          external_link: null,
          submission_link: null,
          deadline: null,
          is_assignment: false,
        });

        successCount++;
      } catch (err) {
        console.error(`Bulk upload failed for "${originalName}":`, err);
        errorCount++;
      }
    }

    // Refresh data once after all uploads
    await loadData();

    if (errorCount === 0) {
      toast.success(`${t("admin.bulkUploadDone")} (${successCount})`);
    } else {
      toast.warning(`${t("admin.bulkUploadPartial")} — ✅ ${successCount} / ❌ ${errorCount}`);
    }

    // Fire a single summary notification (fire-and-forget)
    const course = courses.find(c => c.id === courseId);
    const courseName = course?.name || "";
    const catName = categories.find(c => c.id === categoryId);
    const typeLabel = catName ? (lang === "ar" ? catName.name_ar : catName.name_en) : "";
    db.addNotification({
      title: `تم رفع ${successCount} ${typeLabel} جديدة`,
      message: `في مقرر ${courseName}`,
      target_audience: "all",
      sent_by: "system",
    }).catch(err => console.warn("Auto-notification failed (bulk upload):", err));

    // Reset state
    setUploading(false);
    setBulkProgress(0);
    setBulkTotal(0);
    e.target.value = "";
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle || !linkUrl) { toast.error(t("admin.linkTitleUrlReq")); return; }
    const linkDeptId = isOwner ? null : (user.departmentId || null);
    await db.addLink({ title: linkTitle, title_ar: linkTitleAr || null, url: linkUrl, department_id: linkDeptId });
    await loadData();
    setLinkTitle(""); setLinkTitleAr(""); setLinkUrl("");
    toast.success(t("admin.linkAdded"));
  };

  const handleArchive = async (id: string) => {
    await db.archiveMaterial(id);
    await loadData();
    toast.success(t("admin.materialArchived"));
  };

  const handleDelete = async (id: string) => {
    await db.deleteMaterial(id);
    await loadData();
    toast.success(t("admin.materialDeleted"));
  };

  const handleRemoveLink = async (id: string) => {
    await db.removeLink(id);
    await loadData();
    toast.success(t("admin.linkDeleted"));
  };

  const handleLogout = () => { auth.logout(); navigate("/"); toast.success(t("admin.loggedOut")); };

  const filtered = materials
    .filter(m => showArchived ? m.archived : !m.archived)
    .filter(m => materialCourseFilter === "all" ? true : m.course_id === materialCourseFilter)
    .filter(m => materialCategoryFilter === "all" ? true : m.category_id === materialCategoryFilter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">{t("admin.dashboard")}</h1>
            <p className="text-muted-foreground">
              {isOwner ? t("admin.owner") : `${t("admin.moderator")} — ${user.permissions?.length || 0} ${t("admin.permissions")}`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 me-1" /> {t("admin.logout")}</Button>
        </motion.div>

        {/* Department filter */}
        {isOwner && departments.length > 0 && (
          <div className="mb-6">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-64 bg-secondary/50">
                <SelectValue placeholder={t("admin.filterDept")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.allDepts")}</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.name_ar : d.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-1 mb-8 bg-secondary/50 rounded-xl p-1 max-w-3xl overflow-x-auto">
          {sections.map(tab => (
            <button key={tab.key} onClick={() => setActiveSection(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                activeSection === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {activeSection === "materials" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {canAddMaterials && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
                <div className="glass-card rounded-2xl p-6 sticky top-24">
                  <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> {t("admin.uploadMaterial")}
                  </h2>
                  <form onSubmit={handleUpload} className="space-y-3">
                    <Input placeholder={t("admin.title")} value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50" />
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={t("admin.selectCourse")} /></SelectTrigger>
                      <SelectContent>
                        {filteredCourses.map(c => <SelectItem key={c.id} value={c.id}>{translateCourseName(c.name, lang)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {!isPdfOnly && (
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={t("admin.selectCategory")} /></SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{lang === "ar" ? cat.name_ar : cat.name_en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{t("admin.pdfFile")}</p>
                      <div className="flex gap-1 bg-secondary/30 rounded-lg p-0.5">
                        <button type="button" onClick={() => { setPdfMode("upload"); setIsFolderMode(false); }}
                          className={`flex-1 text-xs py-1.5 rounded-md transition-all ${pdfMode === "upload" && !isFolderMode ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                          {t("admin.uploadFile")}
                        </button>
                        <button type="button" onClick={() => { setPdfMode("upload"); setIsFolderMode(true); }}
                          className={`flex-1 text-xs py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${isFolderMode ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                          <FolderUp className="w-3 h-3" />
                          {t("admin.bulkFolderUpload")}
                        </button>
                        <button type="button" onClick={() => { setPdfMode("url"); setIsFolderMode(false); }}
                          className={`flex-1 text-xs py-1.5 rounded-md transition-all ${pdfMode === "url" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                          {t("admin.directLink")}
                        </button>
                      </div>

                      {isFolderMode ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              id="folder-upload"
                              type="file"
                              // @ts-ignore — webkitdirectory is non-standard but widely supported
                              webkitdirectory=""
                              directory=""
                              multiple
                              onChange={handleBulkFolderUpload}
                              disabled={uploading}
                              className="block w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-secondary/50 rounded-lg py-2 px-3 border border-input"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {lang === "ar"
                              ? "سيتم رفع ملفات PDF فقط من المجلد. الملفات الأخرى سيتم تجاهلها."
                              : "Only PDF files from the folder will be uploaded. Other files will be ignored."}
                          </p>
                          {uploading && bulkTotal > 0 && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-primary font-medium">
                                  {t("admin.bulkUploadProgress")} {bulkProgress} {t("admin.bulkUploadOf")} {bulkTotal} {t("admin.bulkUploadFiles")}...
                                </span>
                                <span className="text-muted-foreground">{Math.round((bulkProgress / bulkTotal) * 100)}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${(bulkProgress / bulkTotal) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : pdfMode === "upload" ? (
                        <div className="space-y-1">
                          <Input id="pdf-upload" type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="bg-secondary/50" />
                          {pdfFile && <p className="text-xs text-primary">{pdfFile.name}</p>}
                        </div>
                      ) : (
                        <Input placeholder={t("admin.pdfDirectLink")} value={pdfExternalUrl} onChange={e => setPdfExternalUrl(e.target.value)} className="bg-secondary/50" />
                      )}
                      {!isFolderMode && (
                        <Input placeholder={t("admin.pdfDisplayName")} value={pdfDisplayName} onChange={e => setPdfDisplayName(e.target.value)} className="bg-secondary/50" />
                      )}
                    </div>

                    {!isPdfOnly && categoryId !== assignmentCategory?.id && (
                      <Input placeholder={t("admin.externalLinkOpt")} value={externalLink} onChange={e => setExternalLink(e.target.value)} className="bg-secondary/50" />
                    )}
                    {isAssignment && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                          {t("admin.deadline")}
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="openEnded"
                              checked={isAssignmentOpenEnded}
                              onChange={(e) => setIsAssignmentOpenEnded(e.target.checked)}
                              className="accent-primary"
                            />
                            <label htmlFor="openEnded" className="text-xs -mt-0.5 cursor-pointer">{lang === "ar" ? "بدون موعد (مفتوح)" : "Open-ended"}</label>
                          </div>
                        </label>
                        {!isAssignmentOpenEnded && (
                          <Input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-secondary/50" />
                        )}
                      </div>
                    )}
                    {isAssignment && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <span>🔗</span> {lang === "ar" ? "رابط التسليم (اختياري)" : "Submission Link (optional)"}
                        </label>
                        <Input 
                          placeholder={lang === "ar" ? "مثال: رابط Google Form أو Moodle" : "e.g. Google Form or Moodle link"} 
                          value={submissionLink} 
                          onChange={e => setSubmissionLink(e.target.value)} 
                          className="bg-secondary/50" 
                        />
                      </div>
                    )}
                    {!isFolderMode && (
                      <Button type="submit" className="w-full" disabled={uploading}>
                        {uploading ? t("admin.uploading") : t("admin.upload")}
                      </Button>
                    )}
                  </form>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={canAddMaterials ? "lg:col-span-2" : "lg:col-span-3"}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-display font-semibold text-lg">{t("admin.allMaterials")}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <Select value={materialCourseFilter} onValueChange={setMaterialCourseFilter}>
                    <SelectTrigger className="w-40 h-8 text-xs bg-secondary/50">
                      <SelectValue placeholder={t("admin.selectCourse")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{lang === "ar" ? "كل المقررات" : "All Courses"}</SelectItem>
                      {filteredCourses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{translateCourseName(c.name, lang)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={materialCategoryFilter} onValueChange={setMaterialCategoryFilter}>
                    <SelectTrigger className="w-36 h-8 text-xs bg-secondary/50">
                      <SelectValue placeholder={lang === "ar" ? "النوع" : "Type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{lang === "ar" ? "كل الأنواع" : "All Types"}</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{lang === "ar" ? cat.name_ar : cat.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button onClick={() => setShowArchived(!showArchived)} className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap">
                    {showArchived ? t("admin.showActive") : t("admin.showArchived")}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {filtered.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">{t("admin.noMaterials")}</p>
                ) : (
                  filtered.map((m, i) => (
                    <MaterialCard key={m.id} material={m} index={i} isAdmin
                      showDelete={canDelete && !isStrictAddOnly}
                      showEdit={canEdit && !isStrictAddOnly}
                      onArchive={canDelete ? handleArchive : undefined}
                      onDelete={canDelete ? handleDelete : undefined}
                      onUpdate={loadData}
                      categories={categories}
                      courses={courses}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeSection === "courses" && (
          <CourseManager courses={filteredCourses} departments={departments} deptFilter={deptFilter} onUpdate={loadData}
            canEdit={canEdit} canDelete={canDelete && !isStrictAddOnly}
            canCreate={isOwner || auth.hasPermission("add_courses")} />
        )}

        {activeSection === "links" && canAddExtLinks && (
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-6 sticky top-24">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> {t("admin.addLink")}
                </h2>
                <form onSubmit={handleAddLink} className="space-y-3">
                  <Input placeholder={t("admin.titleEn")} value={linkTitle} onChange={e => setLinkTitle(e.target.value)} className="bg-secondary/50" />
                  <Input placeholder={t("admin.titleAr")} value={linkTitleAr} onChange={e => setLinkTitleAr(e.target.value)} className="bg-secondary/50" />
                  <Input placeholder={t("admin.link")} value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="bg-secondary/50" />
                  <Button type="submit" className="w-full">{t("admin.addLinkBtn")}</Button>
                </form>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <h2 className="font-display font-semibold text-lg mb-4">{t("admin.allLinks")}</h2>
              <div className="space-y-3">
                {links.map((link, i) => (
                  <motion.div key={link.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{link.title}</p>
                      {link.title_ar && <p className="text-xs text-muted-foreground">{link.title_ar}</p>}
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{link.url}</a>
                    </div>
                    {!link.is_persistent && canDelete && (
                      <button onClick={() => handleRemoveLink(link.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeSection === "notifications" && <NotificationManager />}
        {activeSection === "announcements" && (isOwner || auth.hasPermission("announcements")) && <AnnouncementManager />}
        {activeSection === "categories" && (isOwner || auth.hasPermission("manage_categories")) && <CategoryManager />}
        {activeSection === "moderators" && isOwner && <ManageModerators departments={departments} />}
        {activeSection === "audit_logs" && isOwner && <AuditLog />}
      </div>
    </div>
  );
};

export default AdminDashboard;
