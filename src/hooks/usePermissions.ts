import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar permissões do banco de dados quando o perfil for carregado
  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!profile?.role) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('permissions')
          .eq('role', profile.role)
          .single();

        if (error) {
          console.error('Erro ao buscar permissões:', error);
          setRolePermissions([]);
        } else {
          setRolePermissions(data?.permissions || []);
        }
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
        setRolePermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRolePermissions();
  }, [profile?.role]);

  const isSuperUser = useMemo(() => {
    if (!user || !profile) return false;
    return rolePermissions.includes('canManageEverything');
  }, [user, profile, rolePermissions]);

  const isAdmin = useMemo(() => {
    if (!user || !profile) return false;
    return rolePermissions.includes('canAccessSettings') || isSuperUser;
  }, [user, profile, rolePermissions, isSuperUser]);

  // Construir objeto de permissões baseado nas permissões do banco
  const permissions: UserPermissions = useMemo(() => {
    if (loading) {
      // Retornar permissões vazias enquanto carrega
      return {
        canManageEmployees: false,
        canManageDocuments: false,
        canManageSchedule: false,
        canManageEvaluations: false,
        canAccessSettings: false,
        canViewReports: false,
        canDeleteEmployees: false,
        canCreateUsers: false,
        canPromoteUsers: false,
        canExportData: false,
        isAdmin: false,
        isSuperUser: false
      };
    }

    // Se for super_admin com canManageEverything, dar todas as permissões
    if (isSuperUser && rolePermissions.includes('canManageEverything')) {
      return {
        canManageEmployees: true,
        canManageDocuments: true,
        canManageSchedule: true,
        canManageEvaluations: true,
        canAccessSettings: true,
        canViewReports: true,
        canDeleteEmployees: true,
        canCreateUsers: true,
        canPromoteUsers: true,
        canExportData: true,
        isAdmin: true,
        isSuperUser: true
      };
    }

    // Caso contrário, verificar cada permissão individualmente
    return {
      canManageEmployees: rolePermissions.includes('canManageEmployees'),
      canManageDocuments: rolePermissions.includes('canManageDocuments'),
      canManageSchedule: rolePermissions.includes('canManageSchedule'),
      canManageEvaluations: rolePermissions.includes('canManageEvaluations'),
      canAccessSettings: rolePermissions.includes('canAccessSettings'),
      canViewReports: rolePermissions.includes('canViewReports'),
      canDeleteEmployees: rolePermissions.includes('canDeleteEmployees'),
      canCreateUsers: rolePermissions.includes('canCreateUsers'),
      canPromoteUsers: rolePermissions.includes('canPromoteUsers'),
      canExportData: rolePermissions.includes('canExportData'),
      isAdmin: isAdmin,
      isSuperUser: isSuperUser
    };
  }, [rolePermissions, isAdmin, isSuperUser, loading]);
  


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
    canAccessSettings: permissions.canAccessSettings,
    canCreateUsers: permissions.canCreateUsers,
    isAdmin,
    isSuperUser,
    loading
  };
};

export default usePermissions;