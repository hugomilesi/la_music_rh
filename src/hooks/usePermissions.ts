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
  isAdmin: boolean;
  isSuperUser: boolean;
}

export const usePermissions = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const isAdmin = useMemo(() => {
    if (!user) return false;
    
    // Verificação especial para Luciano - sempre admin
    if (user.id === '3818876c-dc03-44b0-9018-ee901091bad7') {
      return true;
    }
    
    if (!profile) return false;
    
    // Usar 'nivel' em vez de 'role' conforme estrutura da tabela profiles
    return profile.nivel === 'admin' || profile.nivel === 'super_admin';
  }, [user, profile]);

  const isSuperUser = useMemo(() => {
    if (!user) return false;
    
    // Verificação especial para Luciano - sempre super user
    if (user.id === '3818876c-dc03-44b0-9018-ee901091bad7') {
      return true;
    }
    
    if (!profile) return false;
    
    // Usar 'nivel' em vez de 'role' conforme estrutura da tabela profiles
    return profile.preferences?.super_user === true || profile.nivel === 'super_admin';
  }, [user, profile]);
  
  const hasAdminAccess = isAdmin || isSuperUser;
  


  const permissions: UserPermissions = {
    canManageEmployees: hasAdminAccess || profile?.permissions?.includes('employees') || false,
    canManageDocuments: hasAdminAccess || profile?.permissions?.includes('documents') || false,
    canManageSchedule: hasAdminAccess || profile?.permissions?.includes('schedule') || false,
    canManageEvaluations: hasAdminAccess || profile?.permissions?.includes('evaluations') || false,
    canAccessSettings: hasAdminAccess || profile?.permissions?.includes('settings') || false,
    canViewReports: hasAdminAccess || profile?.permissions?.includes('reports') || false,
    canDeleteEmployees: hasAdminAccess || false,
    canCreateUsers: hasAdminAccess || false,
    canPromoteUsers: hasAdminAccess || false,
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
    userProfile: profile
  };
};

export default usePermissions;