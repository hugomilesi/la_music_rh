
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProtectedPageRoute } from '@/components/auth/ProtectedPageRoute';
import { AuthPage } from '@/components/auth/AuthPage';
import { MainLayout } from '@/components/layout/MainLayout';
import PageTransition from '@/components/layout/PageTransition';
import { Toaster } from '@/components/ui/toaster';
import { GlobalContextProvider } from '@/contexts/GlobalContextProvider';
import { UnitProvider } from '@/contexts/UnitContext';
import { EmployeeProvider } from '@/contexts/EmployeeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NPSProvider } from './contexts/NPSContext';
import { IncidentsProvider } from './contexts/IncidentsContext';
import { VacationProvider } from './contexts/VacationContext';
import { EvaluationProvider } from './contexts/EvaluationContext';
import { BenefitsProvider } from './contexts/BenefitsContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import Index from '@/pages/Index';
import DashboardPage from '@/pages/DashboardPage';

import BenefitsPage from '@/pages/BenefitsPage';
import DocumentsPage from '@/pages/DocumentsPage';
import EvaluationsPage from '@/pages/EvaluationsPage';
import PayrollPage from '@/pages/PayrollPage';
import RecognitionPage from '@/pages/RecognitionPage';
import SchedulePage from '@/pages/SchedulePage';
import VacationPage from '@/pages/VacationPage';
import WhatsAppPage from '@/pages/WhatsAppPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import UserSettingsPage from '@/pages/UserSettingsPage';
import IncidentsIndexPage from '@/pages/incidents/index';
import NPSPage from '@/pages/NPSPage';
import NotificationsPage from '@/pages/NotificationsPage';
import PermissionsManagement from '@/pages/PermissionsManagement';
import PermissionsMigration from '@/components/permissions/PermissionsMigration';
import PermissionsTest from '@/pages/PermissionsTest';
import PermissionsDebug from '@/pages/PermissionsDebug';
import RedirectDebug from '@/components/debug/RedirectDebug';
import NotFound from '@/pages/NotFound';
import { PublicSurveyPage } from '@/pages/PublicSurveyPage';
import { NPSResponsePage } from '@/components/nps/NPSResponsePage';
import LocalNPSSurveyPage from './pages/LocalNPSSurveyPage';
import { useParams, useSearchParams } from 'react-router-dom';

import './index.css';

// Wrapper component for NPSResponsePage to handle URL parameters
const NPSResponsePageWrapper: React.FC = () => {
  const { token: routeToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  
  // Priorizar o token dos query parameters, se não existir, usar o da rota
  const token = searchParams.get('token') || routeToken;
  
  if (!token) {
    return <div>Link inválido ou expirado</div>;
  }
  
  return <NPSResponsePage token={token} />;
};

// Wrapper component for protected pages with global context and permission check
const ProtectedPageWrapper: React.FC<{ 
  children: React.ReactNode;
  requiredPermission: string;
}> = ({ children, requiredPermission }) => {
  
  return (
    <ProtectedPageRoute requiredPermission={requiredPermission}>
      <GlobalContextProvider>
        <MainLayout>
          <PageTransition>
            {children}
          </PageTransition>
        </MainLayout>
      </GlobalContextProvider>
    </ProtectedPageRoute>
  );
};

// Wrapper component for user pages with minimal context (only what's needed for the header)
const UserPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <UnitProvider>
      <EmployeeProvider>
        <ScheduleProvider>
          <NPSProvider>
            <IncidentsProvider>
              <VacationProvider>
                <EvaluationProvider>
                  <BenefitsProvider>
                    <NotificationProvider>
                      <MainLayout>
                        <PageTransition>
                          {children}
                        </PageTransition>
                      </MainLayout>
                    </NotificationProvider>
                  </BenefitsProvider>
                </EvaluationProvider>
              </VacationProvider>
            </IncidentsProvider>
          </NPSProvider>
        </ScheduleProvider>
      </EmployeeProvider>
    </UnitProvider>
  </ProtectedRoute>
);

// Wrapper component for public pages
const PublicPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PageTransition>
    {children}
  </PageTransition>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Completely public routes without any auth context */}

        <Route path="/nps/:token" element={
          <PublicPageWrapper>
            <NPSResponsePageWrapper />
          </PublicPageWrapper>
        } />
        
        <Route path="/whatsapp-nps/response" element={
          <PublicPageWrapper>
            <NPSResponsePageWrapper />
          </PublicPageWrapper>
        } />
        
        <Route path="/local-nps/:token" element={
          <PublicPageWrapper>
            <LocalNPSSurveyPage />
          </PublicPageWrapper>
        } />
        
        <Route path="/local-nps" element={
          <PublicPageWrapper>
            <LocalNPSSurveyPage />
          </PublicPageWrapper>
        } />
        
        {/* Routes with auth context */}
        <Route path="/*" element={
          <AuthProvider>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <PublicPageWrapper>
                    <Index />
                  </PublicPageWrapper>
                } />
                <Route path="/auth" element={
                  <PublicPageWrapper>
                    <AuthPage />
                  </PublicPageWrapper>
                } />
                <Route path="/survey/:surveyId" element={
                  <PublicPageWrapper>
                    <PublicSurveyPage />
                  </PublicPageWrapper>
                } />

                {/* Protected routes with permission checks */}
                <Route path="/dashboard" element={
                  <ProtectedPageWrapper requiredPermission="dashboard">
                    <DashboardPage />
                  </ProtectedPageWrapper>
                } />
                
                <Route path="/beneficios" element={
                    <ProtectedPageWrapper requiredPermission="beneficios">
                      <BenefitsPage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/documentos" element={
                    <ProtectedPageWrapper requiredPermission="documentos">
                      <DocumentsPage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/avaliacoes" element={
                    <ProtectedPageWrapper requiredPermission="dashboard">
                      <EvaluationsPage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/folha-pagamento" element={
                    <ProtectedPageWrapper requiredPermission="folha_pagamento">
                      <PayrollPage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/reconhecimento" element={
                    <ProtectedPageWrapper requiredPermission="dashboard">
                      <RecognitionPage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/agenda" element={
                    <ProtectedPageWrapper requiredPermission="agenda">
                      <SchedulePage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/ferias" element={
                    <ProtectedPageWrapper requiredPermission="ferias">
                      <VacationPage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/whatsapp" element={
                  <ProtectedPageWrapper requiredPermission="dashboard">
                    <WhatsAppPage />
                  </ProtectedPageWrapper>
                } />
                
                <Route path="/configuracoes" element={
                    <ProtectedPageWrapper requiredPermission="configuracoes">
                      <SettingsPage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/ocorrencias" element={
                  <ProtectedPageWrapper requiredPermission="dashboard">
                    <IncidentsIndexPage />
                  </ProtectedPageWrapper>
                } />
                
                <Route path="/nps" element={
                  <ProtectedPageWrapper requiredPermission="dashboard">
                    <NPSPage />
                  </ProtectedPageWrapper>
                } />
                
                <Route path="/notificacoes" element={
                  <ProtectedPageWrapper requiredPermission="dashboard">
                    <NotificationsPage />
                  </ProtectedPageWrapper>
                } />
                
                <Route path="/gerenciar-permissoes" element={
                  <ProtectedPageWrapper requiredPermission="permissoes">
                    <PermissionsManagement />
                  </ProtectedPageWrapper>
                } />
                
                <Route path="/migrar-permissoes" element={
                  <ProtectedPageWrapper requiredPermission="permissoes">
                    <PermissionsMigration />
                  </ProtectedPageWrapper>
                } />
                
                <Route path="/debug-permissoes" element={
                  <UserPageWrapper>
                    <PermissionsDebug />
                  </UserPageWrapper>
                } />
                
                <Route path="/debug-redirect" element={
                  <UserPageWrapper>
                    <RedirectDebug />
                  </UserPageWrapper>
                } />
                
                <Route path="/teste-permissoes" element={
                  <UserPageWrapper>
                    <PermissionsTest />
                  </UserPageWrapper>
                } />
                
                {/* User profile routes (no specific permission required, just authentication) */}
                <Route path="/perfil" element={
                  <UserPageWrapper>
                    <ProfilePage />
                  </UserPageWrapper>
                } />
                
                <Route path="/configuracoes-usuario" element={
                  <UserPageWrapper>
                    <UserSettingsPage />
                  </UserPageWrapper>
                } />
                
                {/* 404 route */}
                <Route path="*" element={
                  <PublicPageWrapper>
                    <NotFound />
                  </PublicPageWrapper>
                } />
              </Routes>
                <Toaster />
          </AuthProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
