
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { EvaluationProvider } from './contexts/EvaluationContext';
import { VacationProvider } from './contexts/VacationContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { UnitProvider } from './contexts/UnitContext';
import { IncidentsProvider } from './contexts/IncidentsContext';
import { NPSProvider } from './contexts/NPSContext';
import { BenefitsProvider } from './contexts/BenefitsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';

// Pages
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import DocumentsPage from './pages/DocumentsPage';
import EvaluationsPage from './pages/EvaluationsPage';
import VacationPage from './pages/VacationPage';
import SchedulePage from './pages/SchedulePage';
import TimesheetPage from './pages/TimesheetPage';
import NPSPage from './pages/NPSPage';
import RecognitionPage from './pages/RecognitionPage';
import IncidentsPage from './pages/IncidentsPage';
import BenefitsPage from './pages/BenefitsPage';
import WhatsAppPage from './pages/WhatsAppPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';

// Wrapper component for protected pages with all providers
const ProtectedPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <UnitProvider>
      <EmployeeProvider>
        <DocumentProvider>
          <EvaluationProvider>
            <VacationProvider>
              <ScheduleProvider>
                <IncidentsProvider>
                  <NPSProvider>
                    <BenefitsProvider>
                      <NotificationProvider>
                        <WhatsAppProvider>
                          <MainLayout>
                            {children}
                          </MainLayout>
                        </WhatsAppProvider>
                      </NotificationProvider>
                    </BenefitsProvider>
                  </NPSProvider>
                </IncidentsProvider>
              </ScheduleProvider>
            </VacationProvider>
          </EvaluationProvider>
        </DocumentProvider>
      </EmployeeProvider>
    </UnitProvider>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedPageWrapper>
              <DashboardPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/colaboradores" element={
            <ProtectedPageWrapper>
              <EmployeesPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/documentos" element={
            <ProtectedPageWrapper>
              <DocumentsPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/avaliacoes" element={
            <ProtectedPageWrapper>
              <EvaluationsPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/ferias" element={
            <ProtectedPageWrapper>
              <VacationPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/agenda" element={
            <ProtectedPageWrapper>
              <SchedulePage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/ponto" element={
            <ProtectedPageWrapper>
              <TimesheetPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/nps" element={
            <ProtectedPageWrapper>
              <NPSPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/reconhecimento" element={
            <ProtectedPageWrapper>
              <RecognitionPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/ocorrencias" element={
            <ProtectedPageWrapper>
              <IncidentsPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/beneficios" element={
            <ProtectedPageWrapper>
              <BenefitsPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/whatsapp" element={
            <ProtectedPageWrapper>
              <WhatsAppPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/notificacoes" element={
            <ProtectedPageWrapper>
              <NotificationsPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="/configuracoes" element={
            <ProtectedPageWrapper>
              <SettingsPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
