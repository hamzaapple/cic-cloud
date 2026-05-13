import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, Volume2, X } from "lucide-react";
import { db, type Announcement, type Material, type Course } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { differenceInHours } from "date-fns";

const AUTO_DISMISS_MS = 10_000; // 10 seconds

const AnnouncementBanner = () => {
  const { lang } = useI18n();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [urgentAssignments, setUrgentAssignments] = useState<{ id: string; title: string; course: string; hoursLeft: number; minutesLeft: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track which banner sections have been dismissed (urgent / normal)
  const [urgentDismissed, setUrgentDismissed] = useState(false);
  const [normalDismissed, setNormalDismissed] = useState(false);

  // Auto-dismiss timers
  const urgentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anns, materials, courses] = await Promise.all([
          db.getAnnouncements(),
          db.getMaterials(),
          db.getCourses()
        ]);
        
        setAnnouncements(anns);
        
        // Find assignments due in less than 24 hours
        const now = new Date();
        const urgent = materials
          .filter(m => m.is_assignment && m.deadline && !m.archived)
          .map(m => {
            // Force Cairo/Local time end-of-day for date-only strings from DB
            const deadlineStr = m.deadline!.includes("T") ? m.deadline! : `${m.deadline!}T23:59:59`;
            const deadline = new Date(deadlineStr);
            const hoursLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
            const minutesLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60));
            const course = courses.find(c => c.id === m.course_id);
            return {
              id: m.id,
              title: m.title,
              course: course ? (lang === "ar" ? course.name : course.code) : "",
              hoursLeft,
              minutesLeft
            };
          })
          .filter(m => m.minutesLeft > 0 && m.minutesLeft <= 24 * 60)
          .sort((a, b) => a.minutesLeft - b.minutesLeft);
          
        setUrgentAssignments(urgent);
      } catch (e) {
        console.error("Failed to fetch announcements:", e);
      }
    };

    fetchData();
    // Poll every 15 seconds to instantly reflect admin changes
    const interval = setInterval(fetchData, 15 * 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const allItems = [
    ...urgentAssignments.map(a => ({
      type: 'assignment',
      id: `ass-${a.id}`,
      content: lang === "ar" 
        ? `عاجل: تكليف "${a.title}" في مادة ${a.course} ينتهي خلال ${a.hoursLeft > 0 ? a.hoursLeft + " ساعة" : a.minutesLeft + " دقيقة"}!`
        : `Urgent: Assignment "${a.title}" in ${a.course} is due in ${a.hoursLeft > 0 ? a.hoursLeft + " hours" : a.minutesLeft + " minutes"}!`,
      icon: Clock,
      color: "text-red-500",
      bg: "bg-red-500/20 border-red-500/40 text-red-600 dark:text-red-400 font-medium",
      pulse: true
    })),
    ...announcements.map(a => {
      const isUrgent = a.content.startsWith("[URGENT]");
      return {
        type: 'announcement',
        id: `ann-${a.id}`,
        content: isUrgent ? a.content.replace("[URGENT] ", "") : a.content,
        icon: isUrgent ? AlertCircle : Volume2,
        color: isUrgent ? "text-red-500" : "text-primary",
        bg: isUrgent ? "bg-red-500/20 border-red-500/40 text-red-600 dark:text-red-400 font-medium shadow-lg" : "bg-background/80 border-primary/20 shadow-lg text-foreground",
        pulse: isUrgent
      };
    })
  ];

  const urgentBannerItems = allItems.filter(i => i.pulse);
  const normalBannerItems = allItems.filter(i => !i.pulse);

  useEffect(() => {
    if (urgentBannerItems.length <= 1 && normalBannerItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => prev + 1);
    }, 8500); // Increased reading time
    return () => clearInterval(timer);
  }, [urgentBannerItems.length, normalBannerItems.length]);

  // Reset dismissed state when new data arrives (new announcements / assignments)
  useEffect(() => {
    if (urgentBannerItems.length > 0) setUrgentDismissed(false);
    if (normalBannerItems.length > 0) setNormalDismissed(false);
  }, [
    // Only react to actual content changes, not re-renders
    urgentBannerItems.map(i => i.id).join(","),
    normalBannerItems.map(i => i.id).join(","),
  ]);

  // Auto-dismiss urgent banner after 10s
  useEffect(() => {
    if (urgentBannerItems.length === 0 || urgentDismissed) return;
    urgentTimerRef.current = setTimeout(() => setUrgentDismissed(true), AUTO_DISMISS_MS);
    return () => { if (urgentTimerRef.current) clearTimeout(urgentTimerRef.current); };
  }, [urgentBannerItems.length, urgentDismissed]);

  // Auto-dismiss normal banner after 10s
  useEffect(() => {
    if (normalBannerItems.length === 0 || normalDismissed) return;
    normalTimerRef.current = setTimeout(() => setNormalDismissed(true), AUTO_DISMISS_MS);
    return () => { if (normalTimerRef.current) clearTimeout(normalTimerRef.current); };
  }, [normalBannerItems.length, normalDismissed]);

  if (allItems.length === 0) return null;

  const urgentCurrent = (!urgentDismissed && urgentBannerItems.length > 0) ? urgentBannerItems[currentIndex % urgentBannerItems.length] : null;
  const normalCurrent = (!normalDismissed && normalBannerItems.length > 0) ? normalBannerItems[currentIndex % normalBannerItems.length] : null;

  // Uppercase refs required for JSX component rendering
  const UrgentIcon = urgentCurrent?.icon;
  const NormalIcon = normalCurrent?.icon;

  return (
    <div className="fixed top-[7.5rem] left-0 right-0 z-40 flex flex-col items-center gap-3 px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {urgentCurrent && (
          <motion.div
            key={urgentCurrent.id}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className={`backdrop-blur-xl border-2 rounded-full px-6 py-2.5 flex items-center gap-3 pointer-events-auto cursor-pointer max-w-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] ${urgentCurrent.bg}`}
            >
              <div className={`p-1.5 rounded-full bg-background/80 ${urgentCurrent.color} shadow-sm`}>
                {UrgentIcon && <UrgentIcon className="w-4 h-4" />}
              </div>
            <p className="text-sm font-bold leading-tight">{urgentCurrent.content}</p>
            {urgentBannerItems.length > 1 && (
              <div className="flex gap-1 ml-4 rtl:mr-4 rtl:ml-0">
                {urgentBannerItems.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === (currentIndex % urgentBannerItems.length) ? 'bg-red-500 scale-125' : 'bg-red-500/30'}`}
                  />
                ))}
              </div>
            )}
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setUrgentDismissed(true); }}
              className="p-1 rounded-full hover:bg-red-500/20 transition-colors shrink-0"
              title={lang === "ar" ? "إغلاق" : "Close"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {normalCurrent && (
          <motion.div
            key={normalCurrent.id}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`backdrop-blur-xl border rounded-full px-6 py-2.5 flex items-center gap-3 pointer-events-auto cursor-pointer max-w-xl shadow-lg ${normalCurrent.bg}`}
          >
            <div className={`p-1.5 rounded-full bg-background/50 ${normalCurrent.color}`}>
              {NormalIcon && <NormalIcon className="w-4 h-4" />}
            </div>
            <p className="text-xs font-medium leading-tight">{normalCurrent.content}</p>
            {normalBannerItems.length > 1 && (
              <div className="flex gap-1 ml-4 rtl:mr-4 rtl:ml-0">
                {normalBannerItems.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === (currentIndex % normalBannerItems.length) ? 'bg-primary scale-125' : 'bg-primary/30'}`}
                  />
                ))}
              </div>
            )}
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setNormalDismissed(true); }}
              className="p-1 rounded-full hover:bg-secondary transition-colors shrink-0"
              title={lang === "ar" ? "إغلاق" : "Close"}
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementBanner;
