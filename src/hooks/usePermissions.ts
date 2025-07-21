import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

export interface UserPermissions {
  canManageEmployees: boolean;
  canManageDocuments: boolean;
  canManageSchedule: boolean;
  canManageEvaluations: boolean;
  canAccessSettings: boolean;
  canViewReports: boolean;
  canDeleteEmployees: boolean;
  canCreateUsers: boolean;
  canPromoteUsers: boolean;
  canExportData: boolean;
  isAdmin: boolean;
  isSuperUser: boolean;
}

export const usePermissions = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const isAdmin = useMemo(() => {
    if (!user || !profile) {
      return false;
    }
    
    // Verificação específica para usuários administrativos
    if (user.id === '32349eb8-daae-4c8f-849c-18af9552c000' || user.email === 'madorgas295@gmail.com') {
      return true
    }
    
    return profile.role === 'admin' || profile.role === 'super_admin';
  }, [user, profile])

  const isSuperUser = useMemo(() => {
    if (!user || !profile) return false
    
    // Verificação específica para usuários administrativos
    if (user.id === '32349eb8-daae-4c8f-849c-18af9552c000' || user.email === 'madorgas295@gmail.com') {
      return true
    }
    
    // Todo admin deve ser um super user
    return profile.role === 'admin' || profile.role === 'super_admin';
  }, [user, profile])
  
  const hasAdminAccess = isAdmin || isSuperUser;

  const permissions: UserPermissions = {
    canManageEmployees: hasAdminAccess,
    canManageDocuments: hasAdminAccess,
    canManageSchedule: hasAdminAccess,
    canManageEvaluations: hasAdminAccess,
    canAccessSettings: hasAdminAccess,
    canViewReports: hasAdminAccess,
    canDeleteEmployees: hasAdminAccess,
    canCreateUsers: hasAdminAccess,
    canPromoteUsers: hasAdminAccess,
    canExportData: hasAdminAccess,
    isAdmin: isAdmin,
    isSuperUser: isSuperUser
  };
  


  const checkPermission = (permission: keyof UserPermissions, showToast = true): boolean => {
    const hasPermission = permissions[permission];
    
    if (!hasPermission && showToast) {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para realizar esta ação.',
        variant: 'destructive'
      });
    }
    
    return hasPermission;
  };

  const requirePermission = (permission: keyof UserPermissions, action?: string): boolean => {
    const hasPermission = permissions[permission];
    
    if (!hasPermission) {
      const actionText = action ? ` para ${action}` : '';
      toast({
        title: 'Permissão Necessária',
        description: `Você precisa de permissões de administrador${actionText}. Entre em contato com um administrador do sistema.`,
        variant: 'destructive'
      });
    }
    
    return hasPermission;
  };

  const getPermissionLevel = (): 'user' | 'admin' | 'super' => {
    if (isSuperUser) return 'super';
    if (isAdmin) return 'admin';
    return 'user';
  };

  return {
    permissions,
    checkPermission,
    requirePermission,
    getPermissionLevel,
    userProfile: profile,
    canAccessSettings: hasAdminAccess,
    canCreateUsers: hasAdminAccess,
    isAdmin,
    isSuperUser
  };
};

export default usePermissions;