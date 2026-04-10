import { motion, AnimatePresence } from "framer-motion";
import { FileText, ExternalLink, Clock, Archive, Trash2, Download, Pencil, X, Save, Link } from "lucide-react";
import type { Material, MaterialCategory, Course } from "@/lib/store";
import { db } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { format, isPast } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { playClickSfx } from "@/hooks/use-sfx";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  material: Material;
  index: number;
  isAdmin?: boolean;
  showDelete?: boolean;
  showEdit?: boolean;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
  categories?: MaterialCategory[];
  courses?: Course[];
}

const MaterialCard = ({
  material,
  index,
  isAdmin,
  showDelete = true,
  showEdit = true,
  onArchive,
  onDelete,
  onUpdate,
  categories = [],
  courses = [],
}: Props) => {
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? ar : enUS;
  const deadlinePast = material.deadline && isPast(new Date(material.deadline));

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(material.title);
  const [editCourseId, setEditCourseId] = useState(material.course_id);
  const [editCategoryId, setEditCategoryId] = useState(material.category_id || "");
  const [editExternalLink, setEditExternalLink] = useState(material.external_link || "");
  const [editSubmissionLink, setEditSubmissionLink] = useState(material.submission_link || "");
  const [editDeadline, setEditDeadline] = useState(
    material.deadline ? material.deadline.slice(0, 16) : ""
  );
  const [editPdfDisplayName, setEditPdfDisplayName] = useState(material.pdf_display_name || "");

  const openEdit = () => {
    playClickSfx();
    setEditTitle(material.title);
    setEditCourseId(material.course_id);
    setEditCategoryId(material.category_id || "");
    setEditExternalLink(material.external_link || "");
    setEditSubmissionLink(material.submission_link || "");
    setEditDeadline(material.deadline ? material.deadline.slice(0, 16) : "");
    setEditPdfDisplayName(material.pdf_display_name || "");
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast.error(lang === "ar" ? "العنوان مطلوب" : "Title is required");
      return;
    }
    setSaving(true);
    try {
      await db.updateMaterial(material.id, {
        title: editTitle.trim(),
        course_id: editCourseId,
        category_id: editCategoryId || null,
        external_link: editExternalLink || null,
        submission_link: material.is_assignment ? (editSubmissionLink || null) : null,
        deadline: editDeadline || null,
        pdf_display_name: editPdfDisplayName || null,
      });
      toast.success(lang === "ar" ? "تم التعديل بنجاح ✅" : "Updated successfully ✅");
      setEditOpen(false);
      onUpdate?.();
    } catch {
      toast.error(lang === "ar" ? "فشل التعديل" : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25, ease: "easeOut" }}
        whileHover={{ y: -4, scale: 1.01 }}
        className={`glass-card rounded-xl p-5 group relative overflow-hidden ${material.archived ? "opacity-60" : ""}`}
      >
        <div className="absolute top-0 start-0 w-1 h-full bg-primary rounded-s-xl opacity-60 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <h3 className="font-display font-semibold text-sm truncate">{material.title}</h3>
            </div>

            {material.is_assignment && (
              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary mb-2">
                {t("material.assignment")}
              </span>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {material.is_assignment && !material.deadline && (
                <span className="flex items-center gap-1 text-primary">
                  <Clock className="w-3 h-3" />
                  {lang === "ar" ? "مفتوح (بدون موعد نهائي)" : "Open-ended"}
                </span>
              )}
              {material.deadline && (
                <span className={`flex items-center gap-1 ${deadlinePast ? "text-destructive" : ""}`}>
                  <Clock className="w-3 h-3" />
                  {format(new Date(material.deadline), "dd MMM yyyy - hh:mm a", { locale })}
                  {deadlinePast && ` (${t("material.expired")})`}
                </span>
              )}
              {material.pdf_url && (
                <a href={material.pdf_url} target="_blank" rel="noopener noreferrer" onClick={() => playClickSfx()} className="flex items-center gap-1 text-primary hover:underline">
                  <Download className="w-3 h-3" /> {material.pdf_display_name || t("material.downloadPdf")}
                </a>
              )}
              {material.external_link && (
                <a href={material.external_link} target="_blank" rel="noopener noreferrer" onClick={() => playClickSfx()} className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="w-3 h-3" /> {t("material.externalLink")}
                </a>
              )}
            </div>

            {/* Submission Link — shown to everyone for assignments */}
            {material.is_assignment && material.submission_link && (
              <a
                href={material.submission_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClickSfx()}
                className="mt-3 flex items-center gap-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors px-3 py-1.5 rounded-lg w-fit"
              >
                <Link className="w-3 h-3" />
                {lang === "ar" ? "🔗 رابط تسليم التكليف" : "🔗 Submit Assignment"}
              </a>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {showEdit && (
                <button onClick={openEdit} title={lang === "ar" ? "تعديل" : "Edit"} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {showEdit && onArchive && !material.archived && (
                <button onClick={() => onArchive(material.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <Archive className="w-4 h-4" />
                </button>
              )}
              {showDelete && onDelete && (
                <button onClick={() => onDelete(material.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative glass-card rounded-2xl p-6 w-full max-w-md shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-primary" />
                  {lang === "ar" ? "تعديل المادة" : "Edit Material"}
                </h2>
                <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{lang === "ar" ? "العنوان" : "Title"}</label>
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-secondary/50" />
                </div>

                {courses.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{lang === "ar" ? "المقرر" : "Course"}</label>
                    <select
                      value={editCourseId}
                      onChange={e => setEditCourseId(e.target.value)}
                      className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {categories.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{lang === "ar" ? "النوع / القسم" : "Category"}</label>
                    <select
                      value={editCategoryId}
                      onChange={e => setEditCategoryId(e.target.value)}
                      className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm"
                    >
                      <option value="">{lang === "ar" ? "بدون" : "None"}</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{lang === "ar" ? cat.name_ar : cat.name_en}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{lang === "ar" ? "اسم عرض الـ PDF" : "PDF Display Name"}</label>
                  <Input value={editPdfDisplayName} onChange={e => setEditPdfDisplayName(e.target.value)} className="bg-secondary/50" />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{lang === "ar" ? "رابط خارجي" : "External Link"}</label>
                  <Input value={editExternalLink} onChange={e => setEditExternalLink(e.target.value)} className="bg-secondary/50" placeholder="https://..." />
                </div>

                {material.is_assignment && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">🔗 {lang === "ar" ? "رابط التسليم" : "Submission Link"}</label>
                      <Input value={editSubmissionLink} onChange={e => setEditSubmissionLink(e.target.value)} className="bg-secondary/50" placeholder="https://forms.google.com/..." />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{lang === "ar" ? "الموعد النهائي" : "Deadline"}</label>
                      <Input type="datetime-local" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} className="bg-secondary/50" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ التعديلات" : "Save Changes")}
                </Button>
                <Button variant="outline" onClick={() => setEditOpen(false)} className="w-24">
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MaterialCard;
