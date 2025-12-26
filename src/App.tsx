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

const queryClient = new QueryClient();

import { GlobalLoader } from "@/components/loading/GlobalLoader";

// Loading fallback component
function PageLoader() {
  return <GlobalLoader />;
}

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <MainLayout>
                <Routes>
                  {/* Carbon Mode Routes */}
                  <Route path="/dashboard" element={<CarbonDashboard />} />
                  <Route path="/emissions" element={<EmissionsTracker />} />
                  <Route path="/market" element={<CarbonMarket />} />
                  <Route path="/compliance" element={<ComplianceReports />} />
                  <Route path="/regulatory" element={<RegulatoryHub />} />
                  <Route path="/intelligence" element={<Intelligence />} />

                  {/* Green Mode Routes */}
                  <Route path="/green" element={<GreenDashboard />} />
                  <Route path="/green/marketplace" element={<GreenMarketplace />} />
                  <Route path="/green/portfolio" element={<GreenPortfolio />} />
                  <Route path="/green/verification" element={<GreenVerification />} />

                  {/* Settings */}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/wallet" element={<Wallet />} />

                  {/* Catch-all for protected: redirect to dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
