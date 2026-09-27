import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Link2, Menu, X, BookOpen, CalendarDays, Globe, Volume2, VolumeX, Home } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import { useState, useMemo, lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSfx, playClickSfx } from "@/hooks/use-sfx";
import { useYear } from "@/hooks/use-year";
import { useI18n } from "@/lib/i18n";
import { useOfflineStorage } from "@/hooks/use-offline-storage";
import { HardDrive } from "lucide-react";

const OfflineFilesModal = lazy(() =>
  import("./OfflineFilesModal").then((m) => ({ default: m.OfflineFilesModal }))
);

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t, lang, setLang } = useI18n();
  const { muted, toggleMute } = useSfx();
  const { year } = useYear();
  const { totalSize, formatSize, isSupported } = useOfflineStorage();

  const coursesRoute = useMemo(() => {
    if (!year) return "/";
    return ["1", "2"].includes(year) ? `/year/${year}/departments` : `/year/${year}/semesters`;
  }, [year]);

  const navItems = [
    { to: "/", label: t("nav.home") || "الرئيسية", icon: Home, exact: true },
    { to: coursesRoute, label: t("nav.courses"), icon: BookOpen, exact: false },
    { to: "/calendar", label: t("nav.calendar"), icon: Calendar, exact: false },
    { to: "/links", label: t("nav.links"), icon: Link2, exact: false },
    { to: "/schedule", label: t("nav.schedule"), icon: CalendarDays, exact: false },
  ];

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="CIC Logo" className="w-9 h-9 rounded-lg object-contain" loading="lazy" />
          <span className="font-display font-bold text-lg">CIC</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to) && item.to !== "/";
              
            return (
              <Link key={item.label} to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          {isSupported && totalSize > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playClickSfx();
                setOfflineModalOpen(true);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/30 transition-all cursor-pointer shadow-sm"
              title={lang === "ar" ? "عرض وإدارة الملفات المحفوظة بدون إنترنت" : "View & manage offline files"}
              aria-label="Offline downloaded files"
            >
              <HardDrive className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-[11px] sm:text-xs font-bold">{formatSize(totalSize)}</span>
            </motion.button>
          )}
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className="p-2 rounded-lg bg-secondary text-secondary-foreground"
              aria-label="Toggle sound"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>
            <span className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-2 py-1 rounded-md bg-popover text-popover-foreground border border-border shadow opacity-0 group-hover:opacity-100 transition-opacity">
              {lang === "ar" ? (muted ? "تشغيل الصوت" : "كتم الصوت") : muted ? "Unmute" : "Mute"}
            </span>
          </div>
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
          <NotificationBell />
          <ThemeToggle />
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && isMobile &&
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-border bg-card px-4 pb-4">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to) && item.to !== "/";
              
            return (
              <Link key={item.label} to={item.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}>
                <item.icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}

          {isSupported && (
            <button
              onClick={() => {
                playClickSfx();
                setOpen(false);
                setOfflineModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 mt-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4" />
                <span>{lang === "ar" ? "الملفات المحفوظة بدون إنترنت" : "Offline Downloaded Files"}</span>
              </div>
              {totalSize > 0 && (
                <span className="font-mono text-xs font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  {formatSize(totalSize)}
                </span>
              )}
            </button>
          )}
        </motion.div>
      }

      {offlineModalOpen && (
        <Suspense fallback={null}>
          <OfflineFilesModal
            open={offlineModalOpen}
            onOpenChange={setOfflineModalOpen}
          />
        </Suspense>
      )}
    </motion.nav>
  );
};

export default Navbar;
