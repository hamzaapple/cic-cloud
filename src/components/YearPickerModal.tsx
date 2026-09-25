import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { YEARS, yearLabel } from "@/lib/year-context";
import { useYear } from "@/hooks/use-year";
import { setPushYear } from "@/lib/push-registration";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/store";

interface Props {
  /** Force the picker open even when a year is already saved */
  open?: boolean;
  onClose?: () => void;
}

/**
 * Asks the visitor once which academic year they are in.
 * The answer is saved locally and filters the calendar, schedule and notifications.
 */
const YearPickerModal = ({ open, onClose }: Props) => {
  const { lang } = useI18n();
  const { year, setYear } = useYear();
  const visible = open ?? (!year || !localStorage.getItem("cic_dept_context"));
  const [step, setStep] = useState<1 | 2>(!year ? 1 : 2);
  const [selectedYear, setSelectedYear] = useState<string | null>(year);

  const { data: allDepartments = [] } = useQuery({ queryKey: ["departments"], queryFn: db.getDepartments });
  const { data: allCourses = [] } = useQuery({ queryKey: ["courses"], queryFn: db.getCourses });

  const availableDepts = allDepartments.filter(d => d.name_en !== "Bachelor");

  const chooseYear = (y: string) => {
    setSelectedYear(y);
    setStep(2);
  };

  const chooseDept = (deptContext: string) => {
    if (selectedYear) {
      setYear(selectedYear);
      setPushYear(selectedYear);
    }
    localStorage.setItem("cic_dept_context", deptContext);
    onClose?.();
  };

  // If there are no departments for this year yet, just finish
  if (step === 2 && availableDepts.length === 0 && selectedYear && allDepartments.length > 0 && allCourses.length > 0) {
    chooseDept("all");
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="glass-card rounded-2xl p-6 w-full max-w-sm text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            {step === 1 ? (
              <>
                <h2 className="font-display font-bold text-lg mb-1">
                  {lang === "ar" ? "أنت في أي صف؟" : "Which year are you in?"}
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {lang === "ar"
                    ? "هنعرضلك التقويم والجدول والإشعارات الخاصة بصفك فقط."
                    : "We'll show only your year's calendar, schedule and notifications."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {YEARS.map(y => (
                    <button
                      key={y}
                      onClick={() => chooseYear(y)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${
                        selectedYear === y
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      {yearLabel(y, lang)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display font-bold text-lg mb-1">
                  {lang === "ar" ? "أنت في أي قسم؟" : "Which department are you in?"}
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {lang === "ar"
                    ? "عشان نعرضلك الإشعارات والجداول الخاصة بتخصصك."
                    : "To show notifications and schedules for your specialization."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availableDepts.map(d => (
                    <button
                      key={d.id}
                      onClick={() => chooseDept(d.name_en === "CS" ? "cs" : "ai_cyber")}
                      className="px-4 py-3 rounded-xl text-sm font-medium border border-border hover:bg-secondary/60 transition-colors"
                    >
                      {lang === "ar" ? d.name_ar : d.name_en}
                    </button>
                  ))}
                </div>
                {/* Fallback button if data hasn't loaded properly yet but they want to skip */}
                {availableDepts.length === 0 && (
                   <button onClick={() => chooseDept("all")} className="mt-4 px-4 py-2 w-full rounded-xl text-sm font-medium border border-border hover:bg-secondary/60 transition-colors">
                     {lang === "ar" ? "تخطي" : "Skip"}
                   </button>
                )}
              </>
            )}
            {onClose && (
              <button onClick={onClose} className="mt-4 text-xs text-muted-foreground hover:text-foreground">
                {lang === "ar" ? "إغلاق" : "Close"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default YearPickerModal;
