import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, type Announcement } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const AnnouncementManager = () => {
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? ar : enUS;
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const data = await db.getAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      console.error("Failed to load announcements", e);
    }
  };

  useEffect(() => { loadAnnouncements(); }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !expiresAt) {
      toast.error(lang === "ar" ? "الرجاء إدخال نص الإعلان وتاريخ الانتهاء" : "Please enter content and expiration date");
      return;
    }
    setLoading(true);

    try {
      const finalContent = isImportant ? `[URGENT] ${content}` : content;
      await db.addAnnouncement({ content: finalContent, expires_at: new Date(expiresAt).toISOString() });
      await db.addAuditLog("Add Announcement", `${content.substring(0, 30)}...`);

      // Send push notification with the same announcement text
      await db.addNotification({
        title: isImportant 
          ? (lang === "ar" ? "📢 إعلان هام!" : "📢 Important Announcement!") 
          : (lang === "ar" ? "📢 إعلان جديد" : "📢 New Announcement"),
        message: content, // always use raw content (without [URGENT] prefix)
        target_audience: "all",
        sent_by: "system",
      });

      toast.success(lang === "ar" ? "تم نشر الإعلان وإرسال الإشعار 🔔" : "Announcement posted & notification sent 🔔");
      setContent("");
      setIsImportant(false);
      setExpiresAt("");
      await loadAnnouncements();
    } catch (e) {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteAnnouncement(id);
      await db.addAuditLog("Delete Announcement", `ID: ${id}`);
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted successfully");
      await loadAnnouncements();
    } catch (e) {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
        <div className="glass-card rounded-2xl p-6 sticky top-24">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" /> {lang === "ar" ? "إعلان جديد" : "New Announcement"}
          </h2>
          <form onSubmit={handlePost} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "نص الإعلان" : "Content"}</label>
              <Input 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                className="bg-secondary/50" 
                placeholder={lang === "ar" ? "اكتب الإعلان هنا..." : "Type here..."}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "تاريخ ووقت الانتهاء" : "Expiration Date"}</label>
              <Input 
                type="datetime-local" 
                value={expiresAt} 
                onChange={e => setExpiresAt(e.target.value)} 
                className="bg-secondary/50" 
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isImportant"
                checked={isImportant}
                onChange={e => setIsImportant(e.target.checked)}
                className="accent-red-500 w-4 h-4"
              />
              <label htmlFor="isImportant" className="text-sm cursor-pointer text-red-500 font-medium">
                {lang === "ar" ? "إعلان هام (لون أحمر ونبض)" : "Important (Red & Pulse)"}
              </label>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? (lang === "ar" ? "جاري النشر..." : "Posting...") : (lang === "ar" ? "نشر الإعلان" : "Post Announcement")}
            </Button>
          </form>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
        <h2 className="font-display font-semibold text-lg mb-4">{lang === "ar" ? "الإعلانات النشطة" : "Active Announcements"}</h2>
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">{lang === "ar" ? "لا توجد إعلانات نشطة" : "No active announcements"}</p>
          ) : (
            announcements.map((ann, i) => (
              <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5 flex justify-between items-start">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-3 ${ann.content.startsWith("[URGENT]") ? "text-red-500" : ""}`}>
                    {ann.content.replace("[URGENT] ", "")}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    <span>{lang === "ar" ? "ينتهي في:" : "Expires:"} {format(new Date(ann.expires_at), "dd MMM yyyy - hh:mm a", { locale })}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(ann.id)} className="p-2 ml-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AnnouncementManager;
