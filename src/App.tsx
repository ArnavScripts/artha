import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Protected Pages (Preload core)
import CarbonDashboard from "./pages/CarbonDashboard";
import EmissionsTracker from "./pages/EmissionsTracker";
import CarbonMarket from "./pages/CarbonMarket";
import ComplianceReports from "./pages/ComplianceReports";
import RegulatoryHub from "./pages/RegulatoryHub";
import GreenDashboard from "./pages/GreenDashboard";
import GreenMarketplace from "./pages/GreenMarketplace";
import GreenPortfolio from "./pages/GreenPortfolio";

// Lazy load less frequently accessed pages
const Intelligence = lazy(() => import("./pages/Intelligence"));
const GreenVerification = lazy(() => import("./pages/GreenVerification"));
const Settings = lazy(() => import("./pages/Settings"));
const Wallet = lazy(() => import("./pages/Wallet"));
const AuditorDashboard = lazy(() => import("./pages/AuditorDashboard"));

const queryClient = new QueryClient();

import { GlobalLoader } from "@/components/loading/GlobalLoader";

// Loading fallback component
function PageLoader() {
  return <GlobalLoader />;
}

import { CinematicTransition } from "@/components/shared/CinematicTransition";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<CinematicTransition><LandingPage /></CinematicTransition>} />
        <Route path="/login" element={<CinematicTransition><Login /></CinematicTransition>} />
        <Route path="/register" element={<CinematicTransition><Register /></CinematicTransition>} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <MainLayout>
                <Routes location={location}>
                  {/* CCTS Compliance Stream (Mandatory) */}
                  <Route path="/compliance/dashboard" element={<CinematicTransition><CarbonDashboard /></CinematicTransition>} />
                  <Route path="/compliance/emissions" element={<CinematicTransition><EmissionsTracker /></CinematicTransition>} />
                  <Route path="/compliance/market" element={<CinematicTransition><CarbonMarket /></CinematicTransition>} />
                  <Route path="/compliance/reports" element={<CinematicTransition><ComplianceReports /></CinematicTransition>} />
                  <Route path="/compliance/registry" element={<CinematicTransition><RegulatoryHub /></CinematicTransition>} />
                  <Route path="/compliance/intelligence" element={<CinematicTransition><Intelligence /></CinematicTransition>} />

                  {/* GCP Voluntary Stream (Green Credit Programme) */}
                  <Route path="/voluntary/dashboard" element={<CinematicTransition><GreenDashboard /></CinematicTransition>} />
                  <Route path="/voluntary/market" element={<CinematicTransition><GreenMarketplace /></CinematicTransition>} />
                  <Route path="/voluntary/portfolio" element={<CinematicTransition><GreenPortfolio /></CinematicTransition>} />
                  <Route path="/voluntary/verification" element={<CinematicTransition><GreenVerification /></CinematicTransition>} />

                  {/* Shared Settings & Wallet */}
                  <Route path="/settings" element={<CinematicTransition><Settings /></CinematicTransition>} />
                  <Route path="/wallet" element={<CinematicTransition><Wallet /></CinematicTransition>} />

                  {/* Auditor Portal */}
                  <Route path="/auditor/dashboard" element={<CinematicTransition><AuditorDashboard /></CinematicTransition>} />

                  {/* Redirects for legacy routes */}
                  <Route path="/dashboard" element={<Navigate to="/compliance/dashboard" replace />} />
                  <Route path="/green" element={<Navigate to="/voluntary/dashboard" replace />} />

                  {/* Catch-all: Default to Compliance Dashboard */}
                  <Route path="*" element={<Navigate to="/compliance/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </AuthGuard>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <WorkspaceProvider>
            <ErrorBoundary>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <AnimatedRoutes />
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </WorkspaceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
