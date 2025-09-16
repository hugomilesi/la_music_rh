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
    debugPermissions('fetchUserPermissions called', { userId: user?.id, role: profile?.role });
    
    if (!user?.id) {
      debugPermissions('fetchUserPermissions early return', { reason: 'missing user.id' });
      setUserPermissions([]);
      setLoading(false);
      return;
    }
    
    if (!session) {
      debugPermissions('fetchUserPermissions early return', { reason: 'missing session' });
      return;
    }
    
    if (!profile?.role) {
      debugPermissions('fetchUserPermissions early return', { reason: 'missing profile.role' });
      return;
    }

    // Evitar múltiplas chamadas simultâneas
    if (fetchingRef.current || lastFetchRef.current === cacheKey) {
      debugPermissions('fetchUserPermissions blocked', { reason: 'already fetching or same cache key' });
      return;
    }

    // Verificar cache primeiro - agora verifica se é da mesma sessão
    const cached = permissionsCache.get(cacheKey);
    if (cached && cached.sessionId === currentSessionId && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setUserPermissions(cached.permissions);
      setLoading(false);
      setError(null);
      return;
    } else if (cached && cached.sessionId !== currentSessionId) {
      permissionsCache.delete(cacheKey);
    }

    fetchingRef.current = true;
    lastFetchRef.current = cacheKey;

    try {
      setLoading(true);
      setError(null);

      let userPerms: Permission[] = [];

      // Buscar permissões usando a função get_user_permissions para todos os usuários
      // user.id é o auth_user_id do Supabase Auth
      
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_id: user.id
      });

      if (error) {
        setError('Erro ao carregar permissões');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as permissões do usuário.',
          variant: 'destructive'
        });
        return;
      }

      // Mapear os dados retornados pela função para o formato esperado
      
      // A função RPC agora retorna JSON diretamente
      if (data && Array.isArray(data)) {
        userPerms = data.map((p: any) => {
          const mapped = {
            name: p.name,
            description: p.description
          };
          return mapped;
        });
      } else {
        userPerms = [];
      }



      // Verificar se as permissões mudaram
      const previousPermissions = cached?.permissions || [];
      const previousPermissionNames = previousPermissions.map(p => p.name).sort();
      const currentPermissionNames = userPerms.map(p => p.name).sort();
      const permissionsChanged = JSON.stringify(previousPermissionNames) !== JSON.stringify(currentPermissionNames);
      

      
      setUserPermissions(userPerms);
      // Salvar no cache com sessionId
      permissionsCache.set(cacheKey, { permissions: userPerms, timestamp: Date.now(), sessionId: currentSessionId });
      
      // Notificar mudança se as permissões foram alteradas
      if (permissionsChanged) {
        // Notificar mudança de permissões para componentes que dependem
        const permissionNames = userPerms.map(p => p.name);
        notifyPermissionChange(permissionNames);
      }
    } catch (error) {

      setError('Falha ao carregar permissões do usuário');
      setUserPermissions([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user?.id, session?.access_token, profile?.role]);

  useEffect(() => {
    
    if (user && profile) {
      fetchUserPermissions();
    } else if (user === null && profile === null) {
      // Só limpar permissões se ambos user e profile forem explicitamente null (logout)
      setUserPermissions([]);
      setLoading(false);
    }
  }, [user?.id, profile?.role]); // Removido fetchUserPermissions e cacheKey das dependências

  // Listen for profile-loaded event to ensure permissions are fetched when profile becomes available
  useEffect(() => {
    const handleProfileLoaded = (event: CustomEvent) => {
      const { profile: loadedProfile, user: loadedUser } = event.detail;
      
      if (loadedUser && loadedProfile && loadedUser.id === user?.id) {
        // Force refetch permissions
        fetchUserPermissions();
      }
    };

    window.addEventListener('profile-loaded', handleProfileLoaded as EventListener);
    
    return () => {
      window.removeEventListener('profile-loaded', handleProfileLoaded as EventListener);
    };
  }, [user?.id, fetchUserPermissions]);

  // Verificações de role específicas (definidas antes de hasPermission)
  const isSuperAdmin = useMemo(() => {
    return profile?.role === 'super_admin';
  }, [profile]);

  const isAdmin = useMemo(() => {
    return profile?.role === 'admin' || isSuperAdmin;
  }, [profile, isSuperAdmin]);

  const isGestorRH = useMemo(() => {
    return profile?.role === 'gestor_rh';
  }, [profile]);

  const isGerente = useMemo(() => {
    return profile?.role === 'gerente';
  }, [profile]);

  // Função principal para verificar permissões
  const hasPermission = useCallback((permissionName: string): boolean => {
    
    if (!user || !profile) {
      return false;
    }
    
    if (!memoizedUserPermissions || memoizedUserPermissions.length === 0) {
      return false;
    }
    
    // Super admin e admin têm acesso total a todas as permissões
    if (isSuperAdmin || isAdmin) {
      return true;
    }
    
    // Verificar se a permissão existe nas permissões carregadas
    const hasAccess = memoizedUserPermissions.some(p => p.name === permissionName);
    
    return hasAccess;
  }, [user?.id, profile?.role, memoizedUserPermissions, isSuperAdmin, isAdmin]);

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
    
    // Super admin e admin têm acesso total a todos os módulos
    if (isSuperAdmin || isAdmin) {
      return true;
    }
    
    const permissionName = `${module}.view`;
    
    const hasAccess = hasPermission(permissionName);
    
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