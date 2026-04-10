import { motion } from "framer-motion";
import { db } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

const CalendarPage = () => {
  const { t, lang } = useI18n();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: allMaterials = [] } = useQuery({ queryKey: ["materials"], queryFn: () => db.getMaterials() });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: db.getCourses });

  const locale = lang === "ar" ? ar : enUS;
  const materials = allMaterials.filter(m => m.deadline && !m.archived);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const getEventsForDay = (day: Date) =>
    materials.filter(m => m.deadline && isSameDay(new Date(m.deadline), day));

  const dayHeaders = lang === "ar"
    ? ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">{t("calendar.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("calendar.subtitle")}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(d => addMonths(d, 1))} className="p-2 rounded-lg hover:bg-secondary">
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="font-display font-semibold text-lg">{format(currentMonth, "MMMM yyyy", { locale })}</h2>
            <button onClick={() => setCurrentMonth(d => subMonths(d, 1))} className="p-2 rounded-lg hover:bg-secondary">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayHeaders.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map(day => {
              const events = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              return (
                <motion.div
                  key={day.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  className={`relative min-h-[60px] md:min-h-[80px] p-1.5 rounded-lg border transition-colors ${
                    isToday ? "border-primary bg-primary/5" : "border-transparent hover:bg-secondary/50"
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  {events.map(ev => {
                    const course = courses.find(c => c.id === ev.course_id);
                    return (
                      <div key={ev.id} className="mt-0.5 text-[10px] leading-tight px-1 py-0.5 rounded truncate"
                        style={{ background: course ? `hsl(${course.color} / 0.15)` : undefined, color: course ? `hsl(${course.color})` : undefined }}
                        title={ev.title}>
                        {ev.title.length > 15 ? ev.title.slice(0, 15) + "…" : ev.title}
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
          <h2 className="font-display font-semibold text-lg mb-4">{t("calendar.upcoming")}</h2>
          <div className="space-y-2">
            {materials
              .filter(m => m.deadline && new Date(m.deadline) >= new Date())
              .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
              .slice(0, 5)
              .map((m, i) => {
                const course = courses.find(c => c.id === m.course_id);
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {format(new Date(m.deadline!), "dd MMM", { locale })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{course?.name}</p>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarPage;
