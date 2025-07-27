
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { GlobalContextProvider } from './contexts/GlobalContextProvider';
import { UnitProvider } from './contexts/UnitContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

import DocumentsPage from './pages/DocumentsPage';
import EvaluationsPage from './pages/EvaluationsPage';
import VacationPage from './pages/VacationPage';
import SchedulePage from './pages/SchedulePage';

import NPSPage from './pages/NPSPage';
import RecognitionPage from './pages/RecognitionPage';
import IncidentsPage from './pages/incidents';
import BenefitsPage from './pages/BenefitsPage';
import WhatsAppPage from './pages/WhatsAppPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import PayrollPage from './pages/PayrollPage';
import UserProfilePage from './pages/UserProfilePage';
import UserSettingsPage from './pages/UserSettingsPage';
import ProfilePage from './pages/ProfilePage';
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

// Wrapper component for user pages with minimal context (only what's needed for the header)
const UserPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <UnitProvider>
      <EmployeeProvider>
        <NotificationProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </NotificationProvider>
      </EmployeeProvider>
    </UnitProvider>
  </ProtectedRoute>
);

function App() {
  return (
    <HelmetProvider>
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
          
          <Route path="/meu-perfil" element={
            <UserPageWrapper>
              <ProfilePage />
            </UserPageWrapper>
          } />
          
          {/* All protected routes share the same GlobalContextProvider instance */}
          <Route path="/dashboard" element={
            <ProtectedPageWrapper>
              <DashboardPage />
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
          
          <Route path="/folha-pagamento" element={
            <ProtectedPageWrapper>
              <PayrollPage />
            </ProtectedPageWrapper>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
