import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, type Announcement } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { safeFormatDate } from "@/lib/utils";
import { ar, enUS } from "date-fns/locale";

const AnnouncementManager = () => {
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? ar : enUS;
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [link, setLink] = useState("");
  const [targetYear, setTargetYear] = useState("all");
  const [color, setColor] = useState("#3b82f6");
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
      await db.addAnnouncement({ content: finalContent, expires_at: new Date(expiresAt).toISOString(), link: link || null, target_year: targetYear === "all" ? null : targetYear, color: isImportant ? null : color });
      await db.addAuditLog("إضافة إعلان", `${content.substring(0, 30)}...`, {
        action_type: "add_announcement",
      });

      // Send push notification with the same announcement text
      await db.addNotification({
        title: isImportant 
          ? (lang === "ar" ? "📢 إعلان هام!" : "📢 Important Announcement!") 
          : (lang === "ar" ? "📢 إعلان جديد" : "📢 New Announcement"),
        message: content, // always use raw content (without [URGENT] prefix)
        target_audience: "all",
        target_year: targetYear === "all" ? null : targetYear,
        link: link || null,
        sent_by: "system",
      });

      toast.success(lang === "ar" ? "تم نشر الإعلان وإرسال الإشعار 🔔" : "Announcement posted & notification sent 🔔");
      setContent("");
      setIsImportant(false);
      setExpiresAt("");
      setLink("");
      setTargetYear("all");
      setColor("#3b82f6");
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
      await db.addAuditLog("حذف إعلان", `ID: ${id}`, {
        action_type: "delete_announcement",
      });
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
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "الصف المستهدف" : "Target Year"}</label>
              <Select value={targetYear} onValueChange={setTargetYear}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder={lang === "ar" ? "الصف المستهدف" : "Target Year"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "ar" ? "كل الصفوف" : "All Years"}</SelectItem>
                  <SelectItem value="1">{lang === "ar" ? "الصف الأول" : "1st Year"}</SelectItem>
                  <SelectItem value="2">{lang === "ar" ? "الصف الثاني" : "2nd Year"}</SelectItem>
                  <SelectItem value="3">{lang === "ar" ? "الصف الثالث" : "3rd Year"}</SelectItem>
                  <SelectItem value="4">{lang === "ar" ? "الصف الرابع" : "4th Year"}</SelectItem>
                  <SelectItem value="2b">{lang === "ar" ? "الصف الثاني - بكالوريا" : "2nd Year - Bachelor"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "رابط إضافي (اختياري)" : "Optional Link"}</label>
              <Input 
                value={link} 
                onChange={e => setLink(e.target.value)} 
                className="bg-secondary/50" 
                placeholder="https://..."
              />
            </div>
            {!isImportant && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "لون الإعلان" : "Announcement Color"}</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="color" 
                    value={color} 
                    onChange={e => setColor(e.target.value)} 
                    className="w-12 h-10 p-1 cursor-pointer bg-secondary/50 border-0" 
                  />
                  <span className="text-xs text-muted-foreground" style={{ color: color }}>{lang === "ar" ? "معاينة اللون" : "Color Preview"}</span>
                </div>
              </div>
            )}
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
              <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5 flex justify-between items-start" style={{ borderLeft: ann.color && !ann.content.startsWith("[URGENT]") ? `4px solid ${ann.color}` : undefined }}>
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-3 ${ann.content.startsWith("[URGENT]") ? "text-red-500" : ""}`} style={{ color: ann.color && !ann.content.startsWith("[URGENT]") ? ann.color : undefined }}>
                    {ann.content.replace("[URGENT] ", "")}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    <span>{lang === "ar" ? "ينتهي في:" : "Expires:"} {safeFormatDate(ann.expires_at, "dd MMM yyyy - hh:mm a", { locale })}</span>
                  </div>
                  {ann.target_year && (
                    <div className="text-xs mt-1 text-muted-foreground">
                      {lang === "ar" ? "مخصص لـ:" : "Target:"} {lang === "ar" ? "الصف" : "Year"} {ann.target_year}
                    </div>
                  )}
                  {ann.link && (
                    <a href={ann.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                      {ann.link}
                    </a>
                  )}
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
