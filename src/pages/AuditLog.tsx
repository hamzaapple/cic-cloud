import { useState, useEffect } from "react";
import { db, type Course, type MaterialCategory, type Material } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { auth } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Clock,
  User,
  Upload,
  Trash2,
  Pencil,
  Archive,
  RotateCcw,
  Link2,
  Megaphone,
  Filter,
  FolderUp,
  RefreshCw,
  X,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { toast } from "sonner";

interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  details: string;
  action_type: string;
  related_material_id?: string | null;
  material_snapshot?: Record<string, any> | null;
  created_at: string;
}

// Action type configuration: icon, color, label
const ACTION_CONFIG: Record<
  string,
  {
    icon: typeof Upload;
    color: string;
    bgColor: string;
    labelAr: string;
    labelEn: string;
  }
> = {
  upload: {
    icon: Upload,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    labelAr: "رفع",
    labelEn: "Upload",
  },
  bulk_upload: {
    icon: FolderUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    labelAr: "رفع مجموعة",
    labelEn: "Bulk Upload",
  },
  delete: {
    icon: Trash2,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    labelAr: "حذف",
    labelEn: "Delete",
  },
  edit: {
    icon: Pencil,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    labelAr: "تعديل",
    labelEn: "Edit",
  },
  archive: {
    icon: Archive,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    labelAr: "أرشفة",
    labelEn: "Archive",
  },
  restore: {
    icon: RotateCcw,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    labelAr: "استعادة",
    labelEn: "Restore",
  },
  add_link: {
    icon: Link2,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    labelAr: "إضافة رابط",
    labelEn: "Add Link",
  },
  delete_link: {
    icon: Link2,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    labelAr: "حذف رابط",
    labelEn: "Delete Link",
  },
  add_announcement: {
    icon: Megaphone,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    labelAr: "إعلان",
    labelEn: "Announcement",
  },
  delete_announcement: {
    icon: Megaphone,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    labelAr: "حذف إعلان",
    labelEn: "Delete Announcement",
  },
  other: {
    icon: ShieldAlert,
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
    labelAr: "أخرى",
    labelEn: "Other",
  },
};

interface AuditLogProps {
  courses?: Course[];
  categories?: MaterialCategory[];
  onUpdate?: () => void;
}

const AuditLog = ({ courses = [], categories = [], onUpdate }: AuditLogProps) => {
  const { lang } = useI18n();
  const locale = lang === "ar" ? ar : enUS;
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCourseId, setEditCourseId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editExternalLink, setEditExternalLink] = useState("");
  const [editSubmissionLink, setEditSubmissionLink] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editPdfDisplayName, setEditPdfDisplayName] = useState("");
  const [editIsList, setEditIsList] = useState(false);
  const [editListContent, setEditListContent] = useState("");
  const [saving, setSaving] = useState(false);

  const user = auth.getCurrentUser();
  const isOwner = user.role === "owner";

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await db.getAuditLogs(300);
      if (data) setLogs(data as AuditLogEntry[]);
    } catch (e) {
      console.error("Failed to load audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOwner) return;
    fetchLogs();
  }, [isOwner]);

  const handleRestore = async (log: AuditLogEntry) => {
    if (!log.related_material_id) return;
    setRestoringId(log.id);
    try {
      await db.restoreMaterial(log.related_material_id);
      toast.success(
        lang === "ar"
          ? "تم استعادة المادة بنجاح ✅"
          : "Material restored successfully ✅"
      );
      // Log the restore action
      db.addAuditLog("استعادة مادة", `من السجل — ${log.action}`, {
        action_type: "restore",
        related_material_id: log.related_material_id,
      }).catch(() => {});
      // Refresh logs
      await fetchLogs();
      onUpdate?.();
    } catch {
      toast.error(
        lang === "ar" ? "فشل استعادة المادة" : "Failed to restore material"
      );
    } finally {
      setRestoringId(null);
    }
  };

  const handleEditOpen = async (log: AuditLogEntry) => {
    if (!log.related_material_id) return;
    try {
      const material = await db.getMaterialById(log.related_material_id);
      if (!material) {
        toast.error(lang === "ar" ? "المادة غير موجودة أو محذوفة نهائياً" : "Material not found");
        return;
      }
      setEditingMaterial(material);
      setEditTitle(material.title);
      setEditCourseId(material.course_id);
      setEditCategoryId(material.category_id || "");
      setEditExternalLink(material.external_link || "");
      setEditSubmissionLink(material.submission_link || "");
      setEditDeadline(material.deadline ? material.deadline.slice(0, 16) : "");
      setEditPdfDisplayName(material.pdf_display_name || "");
      setEditIsList(material.is_list || false);
      setEditListContent(material.list_content || "");
      setEditOpen(true);
    } catch (e) {
      toast.error(lang === "ar" ? "خطأ في جلب بيانات المادة" : "Error fetching material");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMaterial) return;
    if (!editTitle.trim()) {
      toast.error(lang === "ar" ? "العنوان مطلوب" : "Title is required");
      return;
    }
    setSaving(true);
    try {
      await db.updateMaterial(editingMaterial.id, {
        title: editTitle.trim(),
        course_id: editCourseId,
        category_id: editCategoryId || null,
        external_link: editExternalLink || null,
        submission_link: editingMaterial.is_assignment ? (editSubmissionLink || null) : null,
        deadline: editDeadline || null,
        pdf_display_name: editPdfDisplayName || null,
        is_list: editIsList,
        list_content: editIsList ? editListContent : null,
      });
      toast.success(lang === "ar" ? "تم التعديل بنجاح ✅" : "Updated successfully ✅");
      
      db.addAuditLog(`تعديل مادة: ${editTitle.trim()}`, `ID: ${editingMaterial.id}`, {
        action_type: "edit",
        related_material_id: editingMaterial.id,
      }).catch(() => {});

      setEditOpen(false);
      onUpdate?.();
      fetchLogs();
    } catch {
      toast.error(lang === "ar" ? "فشل التعديل" : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (log: AuditLogEntry) => {
    if (!log.related_material_id) return;
    if (!confirm(lang === "ar" ? "تأكيد حذف هذه المادة؟" : "Confirm delete?")) return;
    try {
      const material = await db.getMaterialById(log.related_material_id);
      const snapshot = material ? { ...material } : undefined;
      await db.deleteMaterial(log.related_material_id);
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted successfully");
      
      db.addAuditLog(`حذف مادة من السجل`, `ID: ${log.related_material_id}`, {
        action_type: "delete",
        related_material_id: log.related_material_id,
        material_snapshot: snapshot,
      }).catch(() => {});

      onUpdate?.();
      fetchLogs();
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  const filteredLogs =
    filter === "all" ? logs : logs.filter((l) => l.action_type === filter);

  // Group logs by date
  const groupedLogs: Record<string, AuditLogEntry[]> = {};
  filteredLogs.forEach((log) => {
    const dateKey = format(new Date(log.created_at), "yyyy-MM-dd");
    if (!groupedLogs[dateKey]) groupedLogs[dateKey] = [];
    groupedLogs[dateKey].push(log);
  });

  const filterOptions = [
    { value: "all", labelAr: "الكل", labelEn: "All" },
    { value: "upload", labelAr: "رفع", labelEn: "Upload" },
    { value: "delete", labelAr: "حذف", labelEn: "Delete" },
    { value: "edit", labelAr: "تعديل", labelEn: "Edit" },
    { value: "archive", labelAr: "أرشفة", labelEn: "Archive" },
    { value: "restore", labelAr: "استعادة", labelEn: "Restore" },
    { value: "add_link", labelAr: "روابط", labelEn: "Links" },
  ];

  if (!isOwner) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "غير مصرح لك بمشاهدة هذا السجل."
            : "Unauthorized."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-display font-semibold">
            {lang === "ar" ? "سجل نشاطات المشرفين" : "Admin Activity Log"}
          </h2>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {lang === "ar" ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0 mt-1.5" />
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filter === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {lang === "ar" ? opt.labelAr : opt.labelEn}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "لا توجد نشاطات مسجلة حتى الآن."
              : "No activities recorded yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([dateKey, dayLogs]) => (
            <div key={dateKey}>
              {/* Date header */}
              <div className="sticky top-20 z-10 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                  {format(new Date(dateKey), "EEEE, dd MMMM yyyy", { locale })}
                </span>
              </div>

              {/* Timeline entries */}
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute top-0 bottom-0 start-5 w-px bg-border" />

                <div className="space-y-2">
                  <AnimatePresence>
                    {dayLogs.map((log, i) => {
                      const config =
                        ACTION_CONFIG[log.action_type] || ACTION_CONFIG.other;
                      const Icon = config.icon;
                      const canRestore =
                        (log.action_type === "delete" || log.action_type === "archive") &&
                        log.related_material_id;
                      const isRestoring = restoringId === log.id;

                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.02, 0.5) }}
                          className="relative flex gap-3 group"
                        >
                          {/* Timeline dot */}
                          <div
                            className={`relative z-10 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center shrink-0 ring-4 ring-background`}
                          >
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>

                          {/* Card */}
                          <div className="flex-1 glass-card rounded-xl p-4 hover:bg-secondary/10 transition-colors min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {/* Action badge */}
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${config.bgColor} ${config.color}`}
                                  >
                                    {lang === "ar"
                                      ? config.labelAr
                                      : config.labelEn}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {format(
                                      new Date(log.created_at),
                                      "hh:mm a",
                                      { locale }
                                    )}
                                  </span>
                                </div>

                                {/* Action text */}
                                <p className="text-sm font-medium truncate">
                                  {log.action}
                                </p>

                                {/* Details */}
                                {log.details && (
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {log.details}
                                  </p>
                                )}

                                {/* Admin name */}
                                <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground/70">
                                  <User className="w-2.5 h-2.5" />
                                  {log.admin_name}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2">
                                {canRestore && (
                                  <button
                                    onClick={() => handleRestore(log)}
                                    disabled={isRestoring}
                                    className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={
                                      lang === "ar"
                                        ? "استعادة المادة"
                                        : "Restore Material"
                                    }
                                  >
                                    <RotateCcw
                                      className={`w-3.5 h-3.5 ${
                                        isRestoring ? "animate-spin" : ""
                                      }`}
                                    />
                                    {isRestoring
                                      ? lang === "ar"
                                        ? "جاري..."
                                        : "..."
                                      : lang === "ar"
                                      ? "استعادة"
                                      : "Restore"}
                                  </button>
                                )}
                                
                                {log.action_type === "upload" && log.related_material_id && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleEditOpen(log)}
                                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                                      title={lang === "ar" ? "تعديل" : "Edit"}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(log)}
                                      className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                      title={lang === "ar" ? "حذف" : "Delete"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && filteredLogs.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground">
          {lang === "ar"
            ? `إجمالي ${filteredLogs.length} نشاط مسجل`
            : `${filteredLogs.length} activities recorded`}
        </p>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editOpen && editingMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setEditOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-xl z-10 shrink-0">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-primary" />
                  {lang === "ar" ? "تعديل المادة" : "Edit Material"}
                </h3>
                <button
                  onClick={() => setEditOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "العنوان" : "Title"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {lang === "ar" ? "المقرر" : "Course"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editCourseId}
                      onChange={(e) => setEditCourseId(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {lang === "ar" ? "القسم" : "Category"}
                    </label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">{lang === "ar" ? "بدون قسم" : "No Category"}</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name_en}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assignment settings */}
                {editingMaterial.is_assignment && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        {lang === "ar" ? "رابط التسليم" : "Submission Link"}
                      </label>
                      <input
                        type="url"
                        value={editSubmissionLink}
                        onChange={(e) => setEditSubmissionLink(e.target.value)}
                        className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://docs.google.com/forms/..."
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        {lang === "ar" ? "موعد التسليم" : "Deadline"}
                      </label>
                      <input
                        type="datetime-local"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </>
                )}

                {!editingMaterial.pdf_url && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {lang === "ar" ? "رابط خارجي" : "External Link"}
                    </label>
                    <input
                      type="url"
                      value={editExternalLink}
                      onChange={(e) => setEditExternalLink(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      dir="ltr"
                    />
                  </div>
                )}

                {editingMaterial.pdf_url && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {lang === "ar" ? "اسم الملف (اختياري)" : "File Display Name"}
                    </label>
                    <input
                      type="text"
                      value={editPdfDisplayName}
                      onChange={(e) => setEditPdfDisplayName(e.target.value)}
                      className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={lang === "ar" ? "مثال: تحميل المحاضرة" : "e.g., Download Lecture"}
                    />
                  </div>
                )}

                {/* List Mode toggle */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <input
                    type="checkbox"
                    id="editIsList"
                    checked={editIsList}
                    onChange={(e) => setEditIsList(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded border-border"
                  />
                  <label htmlFor="editIsList" className="text-sm font-medium cursor-pointer">
                    {lang === "ar" ? "عرض كنص قائمة" : "Display as List text"}
                  </label>
                </div>
                {editIsList && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {lang === "ar" ? "محتوى القائمة (يدعم Markdown)" : "List Content (Markdown supported)"}
                    </label>
                    <textarea
                      value={editListContent}
                      onChange={(e) => setEditListContent(e.target.value)}
                      rows={5}
                      className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      placeholder="- Point 1&#10;- Point 2"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border/50 flex gap-3 shrink-0 bg-secondary/20">
                <button
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-secondary/80 hover:bg-secondary text-foreground transition-colors"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50"
                >
                  {saving ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ التغييرات" : "Save Changes")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditLog;
