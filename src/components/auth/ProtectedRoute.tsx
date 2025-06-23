
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session, loading, forceLogout } = useAuth();

  useEffect(() => {
    // Check if we have a user but invalid session
    if (user && session) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        console.log('Expired session detected in ProtectedRoute, forcing logout');
        forceLogout();
        return;
      }
    }
  }, [user, session, forceLogout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Check for valid authentication
  if (!user || !session) {
    console.log('User not authenticated or session invalid, redirecting to home page');
    return <Navigate to="/" replace />;
  }

  // Additional session validation
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at < now) {
    console.log('Session expired, redirecting to home page');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
