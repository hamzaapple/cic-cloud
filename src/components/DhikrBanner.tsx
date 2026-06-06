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
    <div className="fixed z-30 pointer-events-none 
      bottom-6 left-1/2 -translate-x-1/2 w-full flex justify-center px-4
      md:bottom-auto md:top-36 md:right-8 md:left-auto md:translate-x-0 md:translate-y-0 md:w-auto md:justify-end">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="pointer-events-auto"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="backdrop-blur-xl border-2 border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]
            flex items-center justify-center
            rounded-full px-6 py-3 max-w-[90vw]
            md:w-40 md:h-40 md:p-6 md:flex-col md:text-center"
            dir="rtl"
          >
            <p className="text-sm md:text-base font-bold leading-relaxed text-center">
              {DHIKR[index]}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DhikrBanner;
