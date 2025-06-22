
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UnitProvider } from './contexts/UnitContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { EvaluationProvider } from './contexts/EvaluationContext';
import { VacationProvider } from './contexts/VacationContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from './components/ui/toaster';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import DocumentsPage from './pages/DocumentsPage';
import EvaluationsPage from './pages/EvaluationsPage';
import VacationPage from './pages/VacationPage';
import SchedulePage from './pages/SchedulePage';
import NotificationsPage from './pages/NotificationsPage';
import RecognitionPage from './pages/RecognitionPage';
import WhatsAppPage from './pages/WhatsAppPage';
import NPSPage from './pages/NPSPage';
import TimesheetPage from './pages/TimesheetPage';
import IncidentsPage from './pages/IncidentsPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <UnitProvider>
        <EmployeeProvider>
          <DocumentProvider>
            <EvaluationProvider>
              <VacationProvider>
                <ScheduleProvider>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/colaboradores" element={<EmployeesPage />} />
                      <Route path="/documentos" element={<DocumentsPage />} />
                      <Route path="/avaliacoes" element={<EvaluationsPage />} />
                      <Route path="/ferias" element={<VacationPage />} />
                      <Route path="/agenda" element={<SchedulePage />} />
                      <Route path="/notificacoes" element={<NotificationsPage />} />
                      <Route path="/reconhecimento" element={<RecognitionPage />} />
                      <Route path="/whatsapp" element={<WhatsAppPage />} />
                      <Route path="/nps" element={<NPSPage />} />
                      <Route path="/timesheet" element={<TimesheetPage />} />
                      <Route path="/incidentes" element={<IncidentsPage />} />
                      <Route path="/configuracoes" element={<SettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </MainLayout>
                  <Toaster />
                </ScheduleProvider>
              </VacationProvider>
            </EvaluationProvider>
          </DocumentProvider>
        </EmployeeProvider>
      </UnitProvider>
    </BrowserRouter>
  );
}

export default App;
