import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { auth } from "@/lib/store";
import { motion } from "framer-motion";
import { ShieldAlert, Clock, User, Activity } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  details: string;
  created_at: string;
}

const AuditLog = () => {
  const { lang } = useI18n();
  const locale = lang === "ar" ? ar : enUS;
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const user = auth.getCurrentUser();
  const isOwner = user.role === "owner";

  useEffect(() => {
    if (!isOwner) return;
    
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("audit_logs" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
          
        if (data) setLogs(data as AuditLogEntry[]);
      } catch (e) {
        console.error("Failed to load audit logs", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [isOwner]);

  if (!isOwner) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground">{lang === "ar" ? "غير مصرح لك بمشاهدة هذا السجل." : "Unauthorized."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-display font-semibold">{lang === "ar" ? "سجل نشاطات المشرفين" : "Moderators Audit Log"}</h2>
      </div>
      
      {loading ? (
        <p className="text-center py-12 text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
      ) : logs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center">
          <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">{lang === "ar" ? "لا توجد نشاطات مسجلة حتى الآن." : "No activities recorded yet."}</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">{lang === "ar" ? "الوقت" : "Time"}</th>
                  <th className="px-6 py-4">{lang === "ar" ? "المشرف" : "Moderator"}</th>
                  <th className="px-6 py-4">{lang === "ar" ? "الإجراء" : "Action"}</th>
                  <th className="px-6 py-4 rounded-tr-xl">{lang === "ar" ? "التفاصيل" : "Details"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log, i) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground flex items-center gap-2">
                       <Clock className="w-3 h-3" />
                       {format(new Date(log.created_at), "dd MMM, HH:mm", { locale })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium flex items-center gap-2">
                      <User className="w-3 h-3 text-primary" />
                      {log.admin_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-secondary rounded-md text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                      {log.details}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
