import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, type Notification } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const NotificationManager = () => {
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? ar : enUS;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    const data = await db.getNotifications();
    setNotifications(data);
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) { toast.error(t("notif.titleMessageReq")); return; }
    setLoading(true);

    try {
      await db.addNotification({
        title, message, target_audience: targetAudience,
        link: link || null, sent_by: "owner",
      });

      if ("Notification" in window && window.Notification.permission === "granted") {
        new window.Notification(title, { body: message });
      } else if ("Notification" in window && window.Notification.permission !== "denied") {
        const perm = await window.Notification.requestPermission();
        if (perm === "granted") new window.Notification(title, { body: message });
      }

      await loadNotifications();
      setTitle(""); setMessage(""); setLink("");
      toast.success(t("notif.sentSuccess"));
    } catch {
      toast.error(t("notif.sentFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
        <div className="glass-card rounded-2xl p-6 sticky top-24">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" /> {t("notif.sendNotification")}
          </h2>
          <form onSubmit={handleSend} className="space-y-3">
            <Input placeholder={t("notif.title")} value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50" />
            <Textarea placeholder={t("notif.message")} value={message} onChange={e => setMessage(e.target.value)} className="bg-secondary/50 min-h-[80px]" />
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger className="bg-secondary/50"><SelectValue placeholder={t("notif.targetAudience")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل (طالب/مشرف)</SelectItem>
                <SelectItem value="cs">علوم الحاسب (CS)</SelectItem>
                <SelectItem value="ai_cyber">الذكاء الاصطناعي (AI & Cyber)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder={t("notif.optionalLink")} value={link} onChange={e => setLink(e.target.value)} className="bg-secondary/50" />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("notif.sending") : t("notif.send")}
            </Button>
          </form>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
        <h2 className="font-display font-semibold text-lg mb-4">{t("notif.history")}</h2>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">{t("notif.noNotifications")}</p>
          ) : (
            notifications.map((notif, i) => (
              <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="w-4 h-4 text-primary" />
                      <h3 className="font-display font-semibold text-sm">{notif.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(notif.created_at), "dd MMM yyyy - HH:mm", { locale })}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                        {notif.target_audience === "all" ? t("notif.everyone") : notif.target_audience}
                      </span>
                    </div>
                    {notif.link && (
                      <a href={notif.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                        {notif.link}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationManager;
