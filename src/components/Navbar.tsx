import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Link2, Menu, X, BookOpen, CalendarDays, Globe, Volume2, VolumeX, MousePointer, MousePointerClick } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useI18n } from "@/lib/i18n";
import { useSfx } from "@/hooks/use-sfx";

interface Props {
  cursorEnabled: boolean;
  onToggleCursor: () => void;
}

const Navbar = ({ cursorEnabled, onToggleCursor }: Props) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t, lang, setLang } = useI18n();
  const { muted, toggleMute } = useSfx();

  const navItems = [
    { to: "/", label: t("nav.courses"), icon: BookOpen },
    { to: "/calendar", label: t("nav.calendar"), icon: Calendar },
    { to: "/links", label: t("nav.links"), icon: Link2 },
    { to: "/schedule", label: t("nav.schedule"), icon: CalendarDays },
  ];

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="CIC Logo" className="w-9 h-9 rounded-lg object-contain" loading="lazy" />
          <span className="font-display font-bold text-lg">CIC</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) =>
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className="p-2 rounded-lg bg-secondary text-secondary-foreground"
              aria-label="Toggle sound"
              title={muted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>
            <span className="text-[10px] text-muted-foreground text-center leading-tight mt-1 max-w-[80px] hidden md:block">
              {lang === "ar" ? "إذا أردت إلغاء المؤثرات الصوتية اضغط هنا" : "Toggle sound effects"}
            </span>
          </div>
          {!isMobile && (
            <div className="flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleCursor}
                className="p-2 rounded-lg bg-secondary text-secondary-foreground"
                aria-label="Toggle cursor effect"
                title={cursorEnabled ? "إلغاء تأثير المؤشر" : "تفعيل تأثير المؤشر"}
              >
                {cursorEnabled ? <MousePointerClick className="w-4 h-4" /> : <MousePointer className="w-4 h-4" />}
              </motion.button>
              <span className="text-[10px] text-muted-foreground text-center leading-tight mt-1 max-w-[80px]">
                {lang === "ar" ? "إذا أردت إلغاء تخصيص شكل المؤشر اضغط هنا" : "Toggle cursor style"}
              </span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="relative p-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold flex items-center gap-1"
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === "ar" ? "EN" : "AR"}</span>
          </motion.button>
          <ThemeToggle />
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && isMobile &&
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-border bg-card px-4 pb-4">
          {navItems.map((item) =>
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === item.to ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          )}
        </motion.div>
      }
    </motion.nav>
  );
};

export default Navbar;
