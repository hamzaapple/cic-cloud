import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import NotificationPrompt from "./components/NotificationPrompt";
import InstallPrompt from "./components/InstallPrompt";
import AnnouncementBanner from "./components/AnnouncementBanner";
import DhikrBanner from "./components/DhikrBanner";
import YearPickerModal from "./components/YearPickerModal";

import Index from "./pages/Index";
import YearDepartmentsPage from "./pages/YearDepartmentsPage";
import YearSemestersPage from "./pages/YearSemestersPage";
import YearCoursesPage from "./pages/YearCoursesPage";
import CoursePage from "./pages/CoursePage";
import CalendarPage from "./pages/CalendarPage";
import LinksPage from "./pages/LinksPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import SchedulePage from "./pages/SchedulePage";
import NotFound from "./pages/NotFound";
import BachelorTechPage from "./pages/BachelorTechPage";

// Lazy load heavy visual components
const ParticleBackground = lazy(() => import("./components/ParticleBackground"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/year/:yearId/departments" element={<YearDepartmentsPage />} />
          <Route path="/year/:yearId/semesters" element={<YearSemestersPage />} />
          <Route path="/year/:yearId/courses" element={<YearCoursesPage />} />
          <Route path="/course/:id" element={<CoursePage />} />
          <Route path="/:yearId/:semesterId/:courseSlug" element={<CoursePage />} />
          <Route path="/:yearId/:semesterId/:courseSlug/:categorySlug" element={<CoursePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/bachelor-tech" element={<BachelorTechPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AppContent = () => {
  return (
    <>
      <Suspense fallback={null}><ParticleBackground /></Suspense>
      <Navbar />
      <AnnouncementBanner />
      <DhikrBanner />
      <NotificationPrompt />
      <InstallPrompt />
      <YearPickerModal />
      <div className="relative z-10">
        <AnimatedRoutes />
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
