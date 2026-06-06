import { useState, useEffect } from "react";
import { db, type NotificationTemplate } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function NotificationTemplateManager() {
  const { lang } = useI18n();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      const data = await db.getNotificationTemplates();
      setTemplates(data);
    } catch (e) {
      console.error("Failed to load templates", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleUpdate = async (id: string, title: string, message: string) => {
    setSaving(id);
    try {
      await db.updateNotificationTemplate(id, title, message);
      toast.success(lang === "ar" ? "تم تحديث القالب بنجاح ✅" : "Template updated successfully ✅");
    } catch (e) {
      toast.error(lang === "ar" ? "فشل تحديث القالب" : "Failed to update template");
    } finally {
      setSaving(null);
    }
  };

  const getTemplateName = (id: string) => {
    const namesAr: Record<string, string> = {
      material_upload: "رفع مادة عادية",
      bulk_upload: "رفع مجلد كامل (Bulk)",
      assignment_deadline: "رفع تكليف (بموعد تسليم)",
      assignment_open: "رفع تكليف (بدون موعد)",
    };
    const namesEn: Record<string, string> = {
      material_upload: "Normal Material Upload",
      bulk_upload: "Bulk Folder Upload",
      assignment_deadline: "Assignment Upload (With Deadline)",
      assignment_open: "Assignment Upload (Open-ended)",
    };
    return lang === "ar" ? namesAr[id] || id : namesEn[id] || id;
  };

  if (loading) {
    return <p className="text-muted-foreground text-center py-8">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-secondary/30 p-4 rounded-xl border border-secondary">
        <h3 className="font-semibold mb-2">{lang === "ar" ? "تعليمات استخدام المتغيرات:" : "Variables Usage Instructions:"}</h3>
        <p className="text-sm text-muted-foreground mb-1">
          {lang === "ar" ? "يمكنك استخدام هذه المتغيرات في العنوان أو النص، وسيتم استبدالها تلقائياً بالبيانات الحقيقية:" : "You can use these variables in the title or message, they will be automatically replaced with real data:"}
        </p>
        <ul className="text-sm list-disc list-inside space-y-1 text-primary/80">
          <li><code>{'{type}'}</code> - {lang === "ar" ? "نوع المادة (مثال: محاضرة، سيكشن)" : "Material type (e.g. Lecture, Section)"}</li>
          <li><code>{'{title}'}</code> - {lang === "ar" ? "اسم المادة" : "Material name"}</li>
          <li><code>{'{courseName}'}</code> - {lang === "ar" ? "اسم المقرر" : "Course name"}</li>
          <li><code>{'{deadline}'}</code> - {lang === "ar" ? "موعد التسليم (للتكاليف فقط)" : "Deadline (for assignments only)"}</li>
          <li><code>{'{count}'}</code> - {lang === "ar" ? "عدد الملفات (للمجلدات فقط)" : "Files count (for bulk upload only)"}</li>
        </ul>
      </div>

      <div className="grid gap-6">
        {templates.map((t, i) => (
          <motion.div 
            key={t.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 rounded-2xl space-y-4"
          >
            <h4 className="font-display font-semibold text-lg">{getTemplateName(t.id)}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "عنوان الإشعار (Title)" : "Notification Title"}</label>
                <Input 
                  value={t.title_template}
                  onChange={(e) => setTemplates(templates.map(temp => temp.id === t.id ? { ...temp, title_template: e.target.value } : temp))}
                  className="bg-secondary/50 font-mono text-sm"
                  dir="auto"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "نص الإشعار (Message)" : "Notification Message"}</label>
                <Input 
                  value={t.message_template}
                  onChange={(e) => setTemplates(templates.map(temp => temp.id === t.id ? { ...temp, message_template: e.target.value } : temp))}
                  className="bg-secondary/50 font-mono text-sm"
                  dir="auto"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => handleUpdate(t.id, t.title_template, t.message_template)}
                disabled={saving === t.id}
                size="sm"
              >
                <Save className="w-4 h-4 me-1.5" />
                {saving === t.id ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ التعديلات" : "Save Changes")}
              </Button>
            </div>
          </motion.div>
        ))}
        {templates.length === 0 && (
          <p className="text-muted-foreground">{lang === "ar" ? "لا توجد قوالب. يرجى التأكد من تشغيل ملف الـ Migration." : "No templates found. Make sure migration is applied."}</p>
        )}
      </div>
    </div>
  );
}
