import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debugRender, debugPermissions, debugCache } from '@/utils/debugUtils';
import { notifyPermissionChange, clearRedirectCache } from '@/utils/redirectUtils';
import { clearPermissionCheckCache } from '@/components/auth/ProtectedPageRoute';

export interface Permission {
  name: string;
  description: string;
}

export interface RolePermissions {
  [key: string]: boolean;
}

// Cache global para evitar múltiplas chamadas - agora persiste durante toda a sessão
const permissionsCache = new Map<string, { permissions: Permission[], timestamp: number, sessionId: string }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas - cache muito longo para persistir durante a sessão
const currentSessionId = Date.now().toString(); // ID único para esta sessão do navegador

// Função para obter descrição das permissões
const getPermissionDescription = (permissionName: string): string => {
  const descriptions: { [key: string]: string } = {
    dashboard: 'Acesso ao painel principal',
    employees: 'Gerenciar funcionários',
    payroll: 'Gerenciar folha de pagamento',
    benefits: 'Gerenciar benefícios',
    vacation: 'Gerenciar férias',
    evaluation: 'Gerenciar avaliações',
    reports: 'Visualizar relatórios',
    settings: 'Configurações do sistema',
    users: 'Gerenciar usuários',
    support: 'Suporte técnico',
    nps: 'Pesquisas de satisfação'
  };
  
  return descriptions[permissionName] || `Permissão: ${permissionName}`;
};

// Função para invalidar cache de permissões
export const invalidatePermissionsCache = (userId?: string) => {
  if (userId) {
    // Remover todas as entradas que começam com o userId
    const keysToDelete = Array.from(permissionsCache.keys()).filter(key => key.startsWith(userId));
    keysToDelete.forEach(key => permissionsCache.delete(key));
  } else {
    permissionsCache.clear();
  }
  
  // Também limpar cache de redirecionamento
  clearRedirectCache();
  clearPermissionCheckCache(); // Limpar também o cache de verificações do ProtectedPageRoute
};

export const usePermissionsV2 = () => {

  debugRender('usePermissionsV2');
  
  const { user, session, profile } = useAuth();

  const { toast } = useToast();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<string>('');



  // Memorizar userPermissions para evitar re-renderizações desnecessárias
  const memoizedUserPermissions = useMemo(() => {
    return userPermissions || [];
  }, [userPermissions]);

  // Criar chave única para o cache baseada no usuário e role
  const cacheKey = useMemo(() => {
    if (!user?.id || !profile?.role) return '';
    return `${user.id}-${profile.role}`;
  }, [user?.id, profile?.role]);

  // Buscar permissões do usuário usando a nova função get_user_permissions
  const fetchUserPermissions = useCallback(async () => {
    console.log('🔒 [usePermissionsV2] fetchUserPermissions called', { 
      userId: user?.id, 
      profileRole: profile?.role,
      fetchingRef: fetchingRef.current
    });

    if (!user?.id || !profile?.role) {
      console.log('🔒 [usePermissionsV2] User or profile not available', {
        user: user?.id,
        profile: profile?.role
      });
      setLoading(false); // Importante: definir loading como false quando não há user/profile
      return;
    }
  
    // Evitar múltiplas chamadas simultâneas usando ref
    if (fetchingRef.current) {
      console.log('🔒 [usePermissionsV2] Already fetching permissions');
      return;
    }

    // Criar chave única para evitar chamadas desnecessárias
    const currentFetchKey = `${user.id}-${profile.role}`;
    if (lastFetchRef.current === currentFetchKey) {
      console.log('🔒 [usePermissionsV2] Same fetch key, skipping');
      return;
    }
  
    fetchingRef.current = true;
    lastFetchRef.current = currentFetchKey;
    
    // Só definir loading como true se não houver cache válido
    const cacheKey = `permissions_${user.id}_${profile.role}`;
    const cached = permissionsCache.get(cacheKey);
    
    if (!cached || cached.sessionId !== session?.user?.id) {
      setLoading(true);
    }
    
    setError(null);
  
    try {
      console.log('🔒 [usePermissionsV2] Cache check', {
        cacheKey,
        hasCached: !!cached,
        sessionId: session?.user?.id,
        cachedSessionId: cached?.sessionId
      });
      
      if (cached && cached.sessionId === session?.user?.id) {
        console.log('🔒 [usePermissionsV2] Using cached permissions', cached.permissions);
        setUserPermissions(cached.permissions);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }
  
      console.log('🔒 [usePermissionsV2] Fetching permissions from database for user:', user.id);
      
      // Buscar permissões usando a função RPC atualizada
      const { data: permissionsData, error: permissionsError } = await supabase
        .rpc('get_user_permissions', { 
          user_auth_id: user.id 
        });
  
      console.log('🔒 [usePermissionsV2] RPC response', {
        data: permissionsData,
        error: permissionsError
      });

      if (permissionsError) {
        console.error('🔒 [usePermissionsV2] Error fetching permissions:', permissionsError);
        throw permissionsError;
      }
  
      console.log('🔒 [usePermissionsV2] Raw permissions data:', permissionsData);
  
      // A função RPC agora retorna um JSON array diretamente
      // Mapear os dados para o formato esperado pelo frontend
      const mappedPermissions: Permission[] = Array.isArray(permissionsData) 
        ? permissionsData.map((perm: any) => ({
            name: perm.name,
            description: perm.description || getPermissionDescription(perm.name)
          }))
        : [];
  
      console.log('🔒 [usePermissionsV2] Mapped permissions:', mappedPermissions);
  
      // Atualizar cache
      permissionsCache.set(cacheKey, {
        permissions: mappedPermissions,
        timestamp: Date.now(),
        sessionId: session?.user?.id || ''
      });

      setUserPermissions(mappedPermissions);
      
      // Notificar mudança de permissões apenas se houve mudança real
      const currentPermissionNames = userPermissions.map(p => p.name).sort();
      const newPermissionNames = mappedPermissions.map(p => p.name).sort();
      const hasChanged = JSON.stringify(currentPermissionNames) !== JSON.stringify(newPermissionNames);
      
      if (hasChanged) {
        console.log('🔒 [usePermissionsV2] Permissions changed, dispatching event');
        window.dispatchEvent(new CustomEvent('permissions-changed', { 
          detail: { permissions: mappedPermissions } 
        }));
      }
  
    } catch (error) {
      console.error('🔒 [usePermissionsV2] Error in fetchUserPermissions:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []); // Removendo todas as dependências para evitar recriação da função

  useEffect(() => {
    if (user && profile) {
      fetchUserPermissions();
    } else if (user === null && profile === null) {
      // Só limpar permissões se ambos user e profile forem explicitamente null (logout)
      setUserPermissions([]);
      setLoading(false);
      fetchingRef.current = false;
      lastFetchRef.current = '';
    }
  }, [user?.id, profile?.role]); // Removido fetchUserPermissions das dependências

  // Listen for profile-loaded event to ensure permissions are fetched when profile becomes available
  useEffect(() => {
    const handleProfileLoaded = (event: CustomEvent) => {
      const { profile: loadedProfile, user: loadedUser } = event.detail;
      
      console.log('🔒 [usePermissionsV2] Profile loaded event received', {
        loadedUserId: loadedUser?.id,
        currentUserId: user?.id,
        loadedProfile: loadedProfile?.role,
        currentProfile: profile?.role
      });
      
      // Só recarregar se for o mesmo usuário e ainda não temos permissões
      if (loadedUser && loadedProfile && loadedUser.id === user?.id && userPermissions.length === 0) {
        console.log('🔒 [usePermissionsV2] Triggering permissions fetch from profile-loaded event');
        // Usar uma função inline para evitar dependência de fetchUserPermissions
        if (!fetchingRef.current && user?.id && profile?.role) {
          fetchUserPermissions();
        }
      }
    };

    window.addEventListener('profile-loaded', handleProfileLoaded as EventListener);
    
    return () => {
      window.removeEventListener('profile-loaded', handleProfileLoaded as EventListener);
    };
  }, [user?.id, userPermissions.length]); // Mantido sem fetchUserPermissions

  // Verificações de role específicas (definidas antes de hasPermission)
  const isSuperAdmin = useMemo(() => {
    const result = profile?.role === 'super_admin';
    console.log('🔍 isSuperAdmin check:', { 
      profileRole: profile?.role, 
      result,
      userId: user?.id,
      profileData: profile 
    });
    return result;
  }, [profile]);

  const isAdmin = useMemo(() => {
    const result = profile?.role === 'admin' || isSuperAdmin;
    console.log('🔍 isAdmin check:', { 
      profileRole: profile?.role, 
      isSuperAdmin, 
      result,
      userId: user?.id,
      profileData: profile 
    });
    return result;
  }, [profile, isSuperAdmin]);

  const isGestorRH = useMemo(() => {
    return profile?.role === 'gestor_rh';
  }, [profile]);

  const isGerente = useMemo(() => {
    return profile?.role === 'gerente';
  }, [profile]);

  // Função principal para verificar permissões
  const hasPermission = useCallback((permissionName: string): boolean => {
    console.log('🔐 hasPermission called:', {
      permissionName,
      hasUser: !!user,
      hasProfile: !!profile,
      userRole: profile?.role,
      isSuperAdmin,
      isAdmin,
      memoizedUserPermissionsLength: memoizedUserPermissions?.length || 0,
      memoizedUserPermissions: memoizedUserPermissions?.map(p => p.name) || [],
      loading
    });
    
    if (!user || !profile) {
      console.log('🔐 hasPermission: No user or profile');
      return false;
    }
    
    if (!memoizedUserPermissions || memoizedUserPermissions.length === 0) {
      console.log('🔐 hasPermission: No permissions loaded yet');
      return false;
    }
    
    // Super admin e admin têm acesso total a todas as permissões
    if (isSuperAdmin || isAdmin) {
      console.log('🔐 hasPermission: Super admin or admin access granted');
      return true;
    }
    
    // Verificar se a permissão existe nas permissões carregadas
    const hasAccess = memoizedUserPermissions.some(p => p.name === permissionName);
    
    console.log('🔐 hasPermission result:', {
      permissionName,
      hasAccess,
      availablePermissions: memoizedUserPermissions.map(p => p.name)
    });
    
    return hasAccess;
  }, [user?.id, profile?.role, memoizedUserPermissions, isSuperAdmin, isAdmin, loading]);

  // Função para verificar permissão com toast de erro
  const checkPermission = useCallback((permissionName: string, showToast = true): boolean => {
    const hasAccess = hasPermission(permissionName);
    
    if (!hasAccess && showToast && typeof window !== 'undefined') {
      setTimeout(() => {
        toast({
          title: 'Acesso Negado',
          description: 'Você não tem permissão para realizar esta ação.',
          variant: 'destructive'
        });
      }, 0);
    }
    
    return hasAccess;
  }, [hasPermission, toast]);

  // Função para verificar permissão com toast personalizado
  const requirePermission = useCallback((permissionName: string, actionDescription?: string): boolean => {
    const hasAccess = hasPermission(permissionName);
    
    if (!hasAccess && typeof window !== 'undefined') {
      const actionText = actionDescription ? ` para ${actionDescription}` : '';
      setTimeout(() => {
        toast({
          title: 'Permissão Necessária',
          description: `Você não tem permissão${actionText}. Entre em contato com um administrador do sistema.`,
          variant: 'destructive'
        });
      }, 0);
    }
    
    return hasAccess;
  }, [hasPermission, toast]);

  // Funções de conveniência para módulos específicos
  const canViewModule = useCallback((module: string): boolean => {
    console.log('🔍 canViewModule called with:', {
      module,
      isSuperAdmin,
      isAdmin,
      profileRole: profile?.role,
      userId: user?.id,
      loading,
      permissionsCount: memoizedUserPermissions?.length || 0
    });
    
    // Super admin e admin têm acesso total a todos os módulos
    if (isSuperAdmin || isAdmin) {
      console.log('✅ Super admin or admin access granted for module:', module);
      return true;
    }
    
    // Mapear nomes de módulos para permissões correspondentes
    const modulePermissionMap: { [key: string]: string } = {
      'dashboard': 'dashboard',
      'avaliacoes': 'avaliacoes',
      'agenda': 'agenda',
      'ferias': 'ferias',
      'beneficios': 'beneficios',
      'documentos': 'documentos',
      'ocorrencias': 'dashboard', // Não existe permissão específica, usar dashboard
      'nps': 'nps', // Agora tem permissão específica
      'reconhecimento': 'reconhecimento',
      'notificacoes': 'dashboard', // Não existe permissão específica, usar dashboard
      'whatsapp': 'whatsapp',
      'folha_pagamento': 'folha_pagamento',
      'configuracoes': 'configuracoes',
      'usuarios': 'usuarios',
      'permissoes': 'permissoes.manage'
    };
    
    const permissionName = modulePermissionMap[module] || module;
    
    const hasAccess = hasPermission(permissionName);
    
    console.log('🔐 Permission check result:', {
      module,
      permissionName,
      hasAccess,
      availablePermissions: memoizedUserPermissions?.map(p => p.name) || []
    });
    
    return hasAccess;
  }, [hasPermission, isSuperAdmin, isAdmin, profile?.role, user?.id, memoizedUserPermissions, loading]);

  const canManageModule = useCallback((module: string): boolean => {
    
    // Super admin e admin têm acesso total a todos os módulos
    if (isSuperAdmin || isAdmin) {
      return true;
    }
    
    const hasAccess = hasPermission(`${module}.manage`);
    return hasAccess;
  }, [hasPermission, isSuperAdmin, isAdmin]);

  const canCreateInModule = useCallback((module: string): boolean => {
    // Super admin e admin têm acesso total a todos os módulos
    if (isSuperAdmin || isAdmin) {
      return true;
    }
    return hasPermission(`${module}.create`);
  }, [hasPermission, isSuperAdmin, isAdmin]);

  const canEditInModule = useCallback((module: string): boolean => {
    // Super admin e admin têm acesso total a todos os módulos
    if (isSuperAdmin || isAdmin) {
      return true;
    }
    return hasPermission(`${module}.edit`);
  }, [hasPermission, isSuperAdmin, isAdmin]);

  const canDeleteInModule = useCallback((module: string): boolean => {
    // Super admin e admin têm acesso total a todos os módulos
    if (isSuperAdmin || isAdmin) {
      return true;
    }
    return hasPermission(`${module}.delete`);
  }, [hasPermission, isSuperAdmin, isAdmin]);

  // Função específica para gerenciar permissões
  const canManagePermissions = useCallback((): boolean => {
    
    // Super admin e admin têm acesso total
    if (isSuperAdmin || isAdmin) {
      return true;
    }
    
    // Verificar permissão específica
    const hasAccess = hasPermission('permissoes.manage');
    
    return hasAccess;
  }, [hasPermission, isSuperAdmin, isAdmin, profile?.role]);

  // Função para obter nível de permissão
  const getPermissionLevel = useCallback((): 'user' | 'admin' | 'super_admin' | 'gestor_rh' | 'gerente' => {
    if (!profile?.role) return 'user';
    return profile.role as 'user' | 'admin' | 'super_admin' | 'gestor_rh' | 'gerente';
  }, [profile]);

  // Função para recarregar permissões
  const refreshPermissions = useCallback(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  // Função para forçar atualização das permissões
  const forceRefreshPermissions = useCallback(async () => {
    if (!user?.id) return;
    
    // Invalidar cache
    invalidatePermissionsCache(user.id);
    
    // Recarregar permissões
    await fetchUserPermissions();
  }, [user?.id, fetchUserPermissions]);

  return {
    // Dados
    userPermissions,
    loading,
    error,
    userProfile: profile,
    
    // Verificações de role
    isAdmin,
    isSuperAdmin,
    isGestorRH,
    isGerente,
    
    // Funções principais
    hasPermission,
    checkPermission,
    requirePermission,
    getPermissionLevel,
    refreshPermissions,
    forceRefreshPermissions,
    
    // Funções de conveniência
    canViewModule,
    canManageModule,
    canCreateInModule,
    canEditInModule,
    canDeleteInModule,
    canManagePermissions
  };
};

export default usePermissionsV2;