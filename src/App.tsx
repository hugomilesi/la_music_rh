
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/*" element={
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
                                      <Routes>
                                        <Route path="/dashboard" element={<DashboardPage />} />
                                        <Route path="/colaboradores" element={<EmployeesPage />} />
                                        <Route path="/documentos" element={<DocumentsPage />} />
                                        <Route path="/avaliacoes" element={<EvaluationsPage />} />
                                        <Route path="/ferias" element={<VacationPage />} />
                                        <Route path="/agenda" element={<SchedulePage />} />
                                        <Route path="/ponto" element={<TimesheetPage />} />
                                        <Route path="/nps" element={<NPSPage />} />
                                        <Route path="/reconhecimento" element={<RecognitionPage />} />
                                        <Route path="/ocorrencias" element={<IncidentsPage />} />
                                        <Route path="/beneficios" element={<BenefitsPage />} />
                                        <Route path="/whatsapp" element={<WhatsAppPage />} />
                                        <Route path="/notificacoes" element={<NotificationsPage />} />
                                        <Route path="/configuracoes" element={<SettingsPage />} />
                                        <Route path="*" element={<NotFound />} />
                                      </Routes>
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
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
