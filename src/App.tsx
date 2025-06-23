
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
          {/* Public landing page */}
          <Route path="/" element={<Index />} />
          
          {/* Protected admin routes */}
          <Route path="/dashboard" element={
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
                                      <DashboardPage />
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
          
          <Route path="/colaboradores" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <MainLayout>
                    <EmployeesPage />
                  </MainLayout>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/documentos" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <DocumentProvider>
                    <MainLayout>
                      <DocumentsPage />
                    </MainLayout>
                  </DocumentProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/avaliacoes" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <EvaluationProvider>
                    <MainLayout>
                      <EvaluationsPage />
                    </MainLayout>
                  </EvaluationProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/ferias" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <VacationProvider>
                    <MainLayout>
                      <VacationPage />
                    </MainLayout>
                  </VacationProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/agenda" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <ScheduleProvider>
                    <MainLayout>
                      <SchedulePage />
                    </MainLayout>
                  </ScheduleProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/ponto" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <MainLayout>
                    <TimesheetPage />
                  </MainLayout>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/nps" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <NPSProvider>
                    <MainLayout>
                      <NPSPage />
                    </MainLayout>
                  </NPSProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/reconhecimento" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <MainLayout>
                    <RecognitionPage />
                  </MainLayout>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/ocorrencias" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <IncidentsProvider>
                    <MainLayout>
                      <IncidentsPage />
                    </MainLayout>
                  </IncidentsProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/beneficios" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <BenefitsProvider>
                    <MainLayout>
                      <BenefitsPage />
                    </MainLayout>
                  </BenefitsProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/whatsapp" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <WhatsAppProvider>
                    <MainLayout>
                      <WhatsAppPage />
                    </MainLayout>
                  </WhatsAppProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/notificacoes" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <NotificationProvider>
                    <MainLayout>
                      <NotificationsPage />
                    </MainLayout>
                  </NotificationProvider>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <UnitProvider>
                <EmployeeProvider>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </EmployeeProvider>
              </UnitProvider>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
