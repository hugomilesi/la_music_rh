import React, { useEffect, useMemo, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { getFirstAccessibleRoute, useDynamicRedirect } from '@/utils/redirectUtils';

// Cache de verificações de permissão para evitar redirecionamentos desnecessários
const permissionCheckCache = new Map<string, boolean>();

// Função para limpar o cache de verificações
export const clearPermissionCheckCache = () => {
  permissionCheckCache.clear();
  console.log('🧹 [ProtectedPageRoute] Cache de verificações limpo');
};

interface ProtectedPageRouteProps {
  children: React.ReactNode;
  requiredPermission?: string; // Tornando opcional
}

export const ProtectedPageRoute: React.FC<ProtectedPageRouteProps> = React.memo(({ 
  children, 
  requiredPermission 
}) => {
  
  const { user, session, profile, loading, forceLogout } = useAuth();
  const { hasPermission, canViewModule, canManagePermissions, loading: permissionsLoading } = usePermissionsV2();
  const previousUserIdRef = useRef<string | null>(null);

  // Limpar cache quando o usuário muda
  useEffect(() => {
    if (user?.id !== previousUserIdRef.current) {
      if (previousUserIdRef.current !== null) {
        console.log('👤 [ProtectedPageRoute] Usuário mudou, limpando cache de verificações');
        clearPermissionCheckCache();
      }
      previousUserIdRef.current = user?.id || null;
    }
  }, [user?.id]);
  
  // Estado atual para debug
  
  // Temporariamente desabilitado para evitar loop de redirecionamento
  // useDynamicRedirect();

  // Memoize session validation to prevent unnecessary recalculations
  const isSessionValid = useMemo(() => {
    if (!session) return false;
    const now = Math.floor(Date.now() / 1000);
    const valid = !session.expires_at || session.expires_at >= now;
    return valid;
  }, [session]);

  // Cache key para esta verificação específica
  const cacheKey = useMemo(() => {
    if (!user?.id || !requiredPermission) return '';
    return `${user.id}-${requiredPermission}`;
  }, [user?.id, requiredPermission]);

  // Memoize permission check to prevent unnecessary recalculations
  // Only check permissions when they are fully loaded
  const hasRequiredPermission = useMemo(() => {
    if (!requiredPermission) return true;
    
    // Don't check permissions while they're still loading
    if (permissionsLoading) {
      return null; // Return null to indicate loading state, not false
    }
    
    // Verificar cache primeiro para evitar verificações desnecessárias
    if (cacheKey && permissionCheckCache.has(cacheKey)) {
      const cachedResult = permissionCheckCache.get(cacheKey)!;
      return cachedResult;
    }
    
    const hasPermissionResult = hasPermission(requiredPermission);
    
    // Salvar no cache apenas se a verificação foi bem-sucedida
    if (cacheKey && hasPermissionResult) {
      permissionCheckCache.set(cacheKey, hasPermissionResult);
    }
    return hasPermissionResult;
  }, [requiredPermission, hasPermission, permissionsLoading, cacheKey]);

  useEffect(() => {
    // Check if we have a user but invalid session
    if (user && session) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {

        forceLogout();
        return;
      }
    }
  }, [user, session, forceLogout]);

  // Show loading state while checking authentication or permissions
  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // Show loading state if we have a required permission but permissions are still loading
  if (requiredPermission && (permissionsLoading || hasRequiredPermission === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to home if not authenticated or session expired
  if (!user || !session || !isSessionValid) {
    return <Navigate to="/" replace />;
  }

  // Wait for profile to load
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Verificar permissão se especificada e redirecionar para página acessível
  // Só redireciona se hasRequiredPermission for explicitamente false (não null)
  if (requiredPermission && hasRequiredPermission === false) {
    const firstAccessibleRoute = getFirstAccessibleRoute(canViewModule, canManagePermissions());
    return <Navigate to={firstAccessibleRoute} replace />;
  }

  return <>{children}</>;
});

ProtectedPageRoute.displayName = 'ProtectedPageRoute';