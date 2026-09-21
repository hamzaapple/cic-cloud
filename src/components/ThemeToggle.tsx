import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className="relative p-2 rounded-lg bg-secondary text-secondary-foreground overflow-hidden w-9 h-9 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      <AnimatePresence initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
            className="absolute flex items-center justify-center"
          >
            <Sun className="w-5 h-5 text-yellow-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
            className="absolute flex items-center justify-center"
          >
            <Moon className="w-5 h-5 text-slate-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
