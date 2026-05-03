import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DHIKR = [
  "سبحان الله",
  "الحمد لله",
  "الله أكبر",
  "لا إله إلا الله",
  "سبحان الله وبحمده",
  "سبحان الله وبحمده، سبحان الله العظيم",
  "لا حول ولا قوة إلا بالله",
  "اللهم صلِّ على نبينا محمد وعلى آله وصحبه وسلم",
];

const pickIndex = () => {
  // Changes every hour, deterministic per hour
  const hourStamp = Math.floor(Date.now() / (1000 * 60 * 60));
  return hourStamp % DHIKR.length;
};

const DhikrBanner = () => {
  const [index, setIndex] = useState(pickIndex);

  useEffect(() => {
    const tick = () => setIndex(pickIndex());
    // align to next hour boundary
    const now = new Date();
    const msToNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
    const timeout = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 60 * 60 * 1000);
      // store interval on window for cleanup fallback
      (window as any).__dhikrInterval = interval;
    }, msToNextHour);
    return () => {
      clearTimeout(timeout);
      if ((window as any).__dhikrInterval) {
        clearInterval((window as any).__dhikrInterval);
      }
    };
  }, []);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 px-4 pointer-events-none w-full flex justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="pointer-events-auto"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="backdrop-blur-xl border-2 border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full px-6 py-2 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.25)] max-w-xl"
            dir="rtl"
          >
            <div className="text-base leading-none" aria-hidden>
              📿
            </div>
            <p className="text-sm font-semibold leading-tight whitespace-nowrap">
              {DHIKR[index]}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DhikrBanner;
