
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import { EvaluationProvider } from "@/contexts/EvaluationContext";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import EvaluationsPage from "./pages/EvaluationsPage";
import SchedulePage from "./pages/SchedulePage";
import DocumentsPage from "./pages/DocumentsPage";
import IncidentsPage from "./pages/IncidentsPage";
import NPSPage from "./pages/NPSPage";
import RecognitionPage from "./pages/RecognitionPage";
import TimesheetPage from "./pages/TimesheetPage";
import NotificationsPage from "./pages/NotificationsPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EmployeeProvider>
        <EvaluationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/evaluations" element={<EvaluationsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/nps" element={<NPSPage />} />
                <Route path="/recognition" element={<RecognitionPage />} />
                <Route path="/timesheet" element={<TimesheetPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/whatsapp" element={<WhatsAppPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </EvaluationProvider>
      </EmployeeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
