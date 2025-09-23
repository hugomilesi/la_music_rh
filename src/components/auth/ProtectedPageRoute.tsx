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
  const { hasPermission, canViewModule, canManagePermissions, loading: permissionsLoading, userPermissions, isSuperAdmin, isAdmin } = usePermissionsV2();
  const previousUserIdRef = useRef<string | null>(null);

  // Limpar cache quando o usuário muda
  useEffect(() => {
    if (user?.id !== previousUserIdRef.current) {
      if (previousUserIdRef.current !== null) {
        clearPermissionCheckCache();
      }
      previousUserIdRef.current = user?.id || null;
    }
  }, [user?.id]);
  
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
    if (!requiredPermission) {
      return true;
    }
    
    if (!user || !profile) {
      return false;
    }
    
    if (loading || permissionsLoading) {
      return null; // Ainda carregando
    }
    
    // Verificar cache primeiro
    const cacheKey = `${user.id}-${requiredPermission}`;
    if (permissionCheckCache.has(cacheKey)) {
      const cached = permissionCheckCache.get(cacheKey);
      return cached;
    }
    
    // Super admin e admin têm acesso total
    if (isSuperAdmin || isAdmin) {
      permissionCheckCache.set(cacheKey, true);
      return true;
    }
    
    // Verificar se as permissões foram carregadas
    if (!userPermissions || userPermissions.length === 0) {
      permissionCheckCache.set(cacheKey, false);
      return false;
    }
    
    // Verificar se a permissão específica existe
    const hasAccess = userPermissions.some(p => p.name === requiredPermission);
    
    permissionCheckCache.set(cacheKey, hasAccess);
    return hasAccess;
  }, [requiredPermission, user?.id, profile?.role, loading, permissionsLoading, userPermissions, isSuperAdmin, isAdmin]);

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
    console.log('❌ ProtectedPageRoute - Redirecionando para home:', {
      hasUser: !!user,
      hasSession: !!session,
      isSessionValid,
      requiredPermission,
      currentPath: window.location.pathname
    });
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

  console.log('✅ ProtectedPageRoute - Acesso autorizado:', {
    requiredPermission,
    hasRequiredPermission,
    userRole: profile?.role,
    currentPath: window.location.pathname
  });
  return <>{children}</>;
});

ProtectedPageRoute.displayName = 'ProtectedPageRoute';