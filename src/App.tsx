
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { GlobalContextProvider } from "@/contexts/GlobalContextProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import VacationPage from "./pages/VacationPage";
import EvaluationsPage from "./pages/EvaluationsPage";
import NPSPage from "./pages/NPSPage";
import RecognitionPage from "./pages/RecognitionPage";
import IncidentsPage from "./pages/IncidentsPage";
import BenefitsPage from "./pages/BenefitsPage";
import DocumentsPage from "./pages/DocumentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import SchedulePage from "./pages/SchedulePage";
import TimesheetPage from "./pages/TimesheetPage";
import SettingsPage from "./pages/SettingsPage";
import ContentManagementPage from "./pages/ContentManagementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ContentProvider>
            <GlobalContextProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employees"
                  element={
                    <ProtectedRoute>
                      <EmployeesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vacation"
                  element={
                    <ProtectedRoute>
                      <VacationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/evaluations"
                  element={
                    <ProtectedRoute>
                      <EvaluationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nps"
                  element={
                    <ProtectedRoute>
                      <NPSPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recognition"
                  element={
                    <ProtectedRoute>
                      <RecognitionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incidents"
                  element={
                    <ProtectedRoute>
                      <IncidentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/benefits"
                  element={
                    <ProtectedRoute>
                      <BenefitsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <ProtectedRoute>
                      <DocumentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/whatsapp"
                  element={
                    <ProtectedRoute>
                      <WhatsAppPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schedule"
                  element={
                    <ProtectedRoute>
                      <SchedulePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/timesheet"
                  element={
                    <ProtectedRoute>
                      <TimesheetPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/content-management"
                  element={
                    <ProtectedRoute>
                      <ContentManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GlobalContextProvider>
          </ContentProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
