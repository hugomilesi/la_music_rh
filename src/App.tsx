
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { GlobalContextProvider } from './contexts/GlobalContextProvider';

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

// Wrapper component for protected pages
const ProtectedPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>
      {children}
    </MainLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected routes wrapped with global context provider */}
          <Route path="/dashboard" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <DashboardPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/colaboradores" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <EmployeesPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/documentos" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <DocumentsPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/avaliacoes" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <EvaluationsPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/ferias" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <VacationPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/agenda" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <SchedulePage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/ponto" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <TimesheetPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/nps" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <NPSPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/reconhecimento" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <RecognitionPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/ocorrencias" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <IncidentsPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/beneficios" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <BenefitsPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/whatsapp" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <WhatsAppPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/notificacoes" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <NotificationsPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="/configuracoes" element={
            <GlobalContextProvider>
              <ProtectedPageWrapper>
                <SettingsPage />
              </ProtectedPageWrapper>
            </GlobalContextProvider>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
