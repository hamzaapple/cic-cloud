import { useState, useEffect } from "react";
import { db } from "@/lib/store";
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

const AuditLog = () => {
  const { lang } = useI18n();
  const locale = lang === "ar" ? ar : enUS;
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [restoringId, setRestoringId] = useState<string | null>(null);

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
    } catch {
      toast.error(
        lang === "ar" ? "فشل استعادة المادة" : "Failed to restore material"
      );
    } finally {
      setRestoringId(null);
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

                              {/* Restore button */}
                              {canRestore && (
                                <button
                                  onClick={() => handleRestore(log)}
                                  disabled={isRestoring}
                                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default AuditLog;
