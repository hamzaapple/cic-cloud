import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import CustomCursor from "./components/CustomCursor";
import NotificationPrompt from "./components/NotificationPrompt";
import InstallPrompt from "./components/InstallPrompt";
import AnnouncementBanner from "./components/AnnouncementBanner";
import DhikrBanner from "./components/DhikrBanner";
import { useCursorToggle } from "./hooks/use-cursor";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const DepartmentPage = lazy(() => import("./pages/DepartmentPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const LinksPage = lazy(() => import("./pages/LinksPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load heavy visual components
const ParticleBackground = lazy(() => import("./components/ParticleBackground"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  const { cursorEnabled, toggleCursor } = useCursorToggle();

  return (
    <>
      <Suspense fallback={null}><ParticleBackground /></Suspense>
      <CustomCursor enabled={cursorEnabled} />
      <Navbar cursorEnabled={cursorEnabled} onToggleCursor={toggleCursor} />
      <AnnouncementBanner />
      <NotificationPrompt />
      <InstallPrompt />
      <div className="relative z-10">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/department/:id" element={<DepartmentPage />} />
            <Route path="/course/:id" element={<CoursePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
