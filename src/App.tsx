
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Error Handling
import { initializeErrorHandling } from './utils/errorHandler';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProtectedPageRoute } from './components/auth/ProtectedPageRoute';

// Contexts
import { UnitProvider } from './contexts/UnitContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { ColaboradorProvider } from './contexts/ColaboradorContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { VacationProvider } from './contexts/VacationContext';
import { EvaluationProvider } from './contexts/EvaluationContext';
import { BenefitsProvider } from './contexts/BenefitsContext';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { NPSProvider } from './contexts/NPSContext';
import { IncidentsProvider } from './contexts/IncidentsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';

// Components
import { AuthPage } from './components/auth/AuthPage';
import { MainLayout } from './components/layout/MainLayout';
import PageTransition from './components/layout/PageTransition';

import Index from '@/pages/Index';
import DashboardPage from '@/pages/DashboardPage';

import BenefitsPage from '@/pages/BenefitsPage';
import DocumentsPage from '@/pages/DocumentsPage';
import EvaluationsPage from '@/pages/EvaluationsPage';
import CoffeeConnectionPage from '@/pages/CoffeeConnectionPage';
import EvaluationsOnlyPage from '@/pages/EvaluationsOnlyPage';
import PayrollPage from '@/pages/PayrollPage';
import RecognitionPage from '@/pages/RecognitionPage';
import SchedulePage from '@/pages/SchedulePage';
import VacationPage from '@/pages/VacationPage';
import WhatsAppPage from '@/pages/WhatsAppPage';
import ColaboradoresPage from '@/pages/ColaboradoresPage';
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
  requiredPermission?: string;
}> = ({ children, requiredPermission }) => {
  
  return (
    <ProtectedRoute>
      <ProtectedPageRoute requiredPermission={requiredPermission}>
        <UnitProvider>
          <EmployeeProvider>
            <ColaboradorProvider>
              <DocumentProvider>
                <VacationProvider>
                  <EvaluationProvider>
                    <BenefitsProvider>
                      <ScheduleProvider>
                        <NPSProvider>
                          <IncidentsProvider>
                            <NotificationProvider>
                              <WhatsAppProvider>
                                <MainLayout>
                                  <PageTransition>
                                    {children}
                                  </PageTransition>
                                </MainLayout>
                              </WhatsAppProvider>
                            </NotificationProvider>
                          </IncidentsProvider>
                        </NPSProvider>
                      </ScheduleProvider>
                    </BenefitsProvider>
                  </EvaluationProvider>
                </VacationProvider>
              </DocumentProvider>
            </ColaboradorProvider>
          </EmployeeProvider>
        </UnitProvider>
      </ProtectedPageRoute>
    </ProtectedRoute>
  );
};

// Wrapper component for user pages with minimal context (only what's needed for the header)
const UserPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <UnitProvider>
      <EmployeeProvider>
        <ColaboradorProvider>
          <ScheduleProvider>
            <NPSProvider>
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
            </NPSProvider>
          </ScheduleProvider>
        </ColaboradorProvider>
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
  // Inicializa o sistema global de tratamento de erros
  useEffect(() => {
    initializeErrorHandling();
    console.log('Sistema de tratamento de erros inicializado');
  }, []);

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
                      <EvaluationsOnlyPage />
                    </ProtectedPageWrapper>
                  } />
                
                <Route path="/coffee-connection" element={
                    <ProtectedPageWrapper requiredPermission="dashboard">
                      <CoffeeConnectionPage />
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
                
                <Route path="/colaboradores" element={
                  <ProtectedPageWrapper requiredPermission="colaboradores">
                    <ColaboradoresPage />
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
