import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n";
import { hasToken } from "@/lib/auth";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import NotFound from "./pages/NotFound.tsx";

const Providers = lazy(() => import("./pages/Providers.tsx"));
const ProviderDetail = lazy(() => import("./pages/ProviderDetail.tsx"));
const Alerts = lazy(() => import("./pages/Alerts.tsx"));
const Plans = lazy(() => import("./pages/Plans.tsx"));
const Adjustments = lazy(() => import("./pages/Adjustments.tsx"));

const queryClient = new QueryClient();

function ProtectedRoute() {
  const location = useLocation();

  if (!hasToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  if (hasToken()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RouteFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
              <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/providers/:id" element={<ProviderDetail />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/adjustments" element={<Adjustments />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
