
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
import UserProfilePage from './pages/UserProfilePage';
import UserSettingsPage from './pages/UserSettingsPage';
import NotFound from './pages/NotFound';

// Wrapper component for protected pages with global context
const ProtectedPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <GlobalContextProvider>
      <MainLayout>
        {children}
      </MainLayout>
    </GlobalContextProvider>
  </ProtectedRoute>
);

// Wrapper component for user pages without global context (since they don't need all the data contexts)
const UserPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
          
          {/* User profile and settings routes */}
          <Route path="/perfil" element={
            <UserPageWrapper>
              <UserProfilePage />
            </UserPageWrapper>
          } />
          
          <Route path="/configuracoes-usuario" element={
            <UserPageWrapper>
              <UserSettingsPage />
            </UserPageWrapper>
          } />
          
          {/* All protected routes share the same GlobalContextProvider instance */}
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
