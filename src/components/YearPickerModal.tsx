import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { YEARS, yearLabel } from "@/lib/year-context";
import { useYear } from "@/hooks/use-year";

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
  const visible = open ?? !year;

  const choose = (y: string) => {
    setYear(y);
    onClose?.();
  };

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
                  onClick={() => choose(y)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${
                    year === y
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-secondary/60"
                  }`}
                >
                  {yearLabel(y, lang)}
                </button>
              ))}
            </div>
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
