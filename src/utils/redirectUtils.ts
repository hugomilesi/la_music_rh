import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Mapeamento de rotas e seus módulos necessários
export const ROUTE_MODULES = {
  '/dashboard': 'dashboard',
  '/folha-pagamento': 'folha_pagamento',
  '/ferias': 'ferias',
  '/avaliacoes': 'avaliacoes',
  '/documentos': 'documentos',
  '/beneficios': 'beneficios',
  '/agenda': 'agenda',
  '/ocorrencias': 'ocorrencias',
  '/reconhecimento': 'reconhecimento',
  '/nps': 'nps',
  '/notificacoes': 'notificacoes',
  '/whatsapp': 'whatsapp',
  '/configuracoes': 'configuracoes',
  '/gerenciar-permissoes': null, // Gerenciado por canManagePermissions
  '/perfil': null, // Sempre acessível para usuários autenticados
  '/configuracoes-usuario': null, // Sempre acessível para usuários autenticados
};

// Rotas em ordem de prioridade para redirecionamento
export const PRIORITY_ROUTES = [
  '/dashboard', // Página principal - primeira prioridade
  '/folha-pagamento',
  '/ferias',
  '/avaliacoes',
  '/documentos',
  '/beneficios',
  '/agenda',
  '/ocorrencias',
  '/reconhecimento',
  '/nps',
  '/notificacoes',
  '/whatsapp',
  '/configuracoes',
  '/perfil', // Fallback final - sempre acessível
];

// Cache para evitar recálculos desnecessários
let routeCache: { [key: string]: string } = {};
let lastPermissionsHash = '';

// Sistema de notificação para mudanças de permissão
type PermissionChangeListener = (newPermissions: string[]) => void;
const permissionChangeListeners: Set<PermissionChangeListener> = new Set();

// Função para notificar mudanças de permissão
export const notifyPermissionChange = (newPermissions: string[]) => {
  permissionChangeListeners.forEach(listener => {
    try {
      listener(newPermissions);
    } catch (error) {
      // Error notifying permission listener logging disabled
    }
  });
  
  // Limpar cache quando permissões mudam
  routeCache = {};
  lastPermissionsHash = '';
};

// Função para registrar listener de mudança de permissão
export const addPermissionChangeListener = (listener: PermissionChangeListener) => {
  permissionChangeListeners.add(listener);
  return () => permissionChangeListeners.delete(listener);
};

// Função para limpar cache de redirecionamento
export const clearRedirectCache = () => {
  routeCache = {};
  lastPermissionsHash = '';
};

/**
 * Gera um hash dos módulos para detectar mudanças
 */
const generateModulesHash = (canViewModule: (module: string) => boolean): string => {
  const modules = Object.values(ROUTE_MODULES)
    .filter(Boolean)
    .map(module => `${module}:${canViewModule(module!)}`)
    .join('|');
  return modules;
};

/**
 * Encontra a primeira rota acessível para o usuário baseado em suas permissões
 * @param canViewModule - Função para verificar se o usuário pode visualizar um módulo
 * @param canManagePermissions - Se o usuário pode gerenciar permissões
 * @returns A primeira rota acessível ou '/perfil' como fallback
 */
export const getFirstAccessibleRoute = (
  canViewModule: (module: string) => boolean,
  canManagePermissions: boolean
): string => {
  
  // Se pode gerenciar permissões, sempre pode acessar configurações
  if (canManagePermissions) {
    return '/configuracoes';
  }
  
  // Verificar rotas por ordem de prioridade
  for (const route of PRIORITY_ROUTES) {
    const module = ROUTE_MODULES[route as keyof typeof ROUTE_MODULES];
    
    if (module) {
      const hasAccess = canViewModule(module);
      
      if (hasAccess) {
        return route;
      }
    } else {
      // Se não há módulo definido, assumir que é acessível
      return route;
    }
  }
  
  // Se nenhuma rota for acessível, redirecionar para perfil
  return '/perfil';
};

/**
 * Hook para obter a primeira rota acessível para o usuário atual
 */
export const useFirstAccessibleRoute = () => {
  const { canViewModule, canManagePermissions } = usePermissionsV2();
  
  // Memoiza o resultado para evitar recálculos desnecessários
  return useMemo(() => {
    return getFirstAccessibleRoute(canViewModule, canManagePermissions() || false);
  }, [canViewModule, canManagePermissions]);
};

/**
 * Verifica se uma rota específica é acessível para o usuário
 * @param route - A rota a ser verificada
 * @param canViewModule - Função para verificar módulos
 * @param canManagePermissions - Se pode gerenciar permissões
 * @returns true se a rota é acessível, false caso contrário
 */
export const isRouteAccessible = (route: string, canViewModule: (module: string) => boolean, canManagePermissions: boolean = false): boolean => {
  const requiredModule = ROUTE_MODULES[route as keyof typeof ROUTE_MODULES];
  
  // Se não requer módulo específico, é acessível
  if (!requiredModule) {
    return true;
  }
  
  // Verificação especial para gerenciar permissões
  if (route === '/gerenciar-permissoes') {
    return canManagePermissions;
  }
  
  // Verifica se pode visualizar o módulo necessário
  return canViewModule(requiredModule);
};

/**
 * Hook para utilitários de redirecionamento
 */
export const useRedirectUtils = () => {
  const { canViewModule, canManagePermissions, loading: isLoading } = usePermissionsV2();
  const navigate = useNavigate();
  const location = useLocation();
  

  
  const permissionsHash = useMemo(() => {
    return generateModulesHash(canViewModule);
  }, [canViewModule]);
  
  // Limpar cache se as permissões mudaram
  if (permissionsHash !== lastPermissionsHash) {
    routeCache = {};
    lastPermissionsHash = permissionsHash;
  }
  
  const isRouteAccessibleMemo = useMemo(() => {
    return (route: string): boolean => {
      const accessible = isRouteAccessible(route, canViewModule, canManagePermissions);
      return accessible;
    };
  }, [canViewModule, canManagePermissions]);
  
  const getFirstAccessibleRouteMemo = useMemo(() => {
    return (): string => {
      const cacheKey = `first_accessible_${permissionsHash}`;
      
      if (routeCache[cacheKey]) {
        return routeCache[cacheKey];
      }
      
      const route = getFirstAccessibleRoute(canViewModule, canManagePermissions() || false);
      routeCache[cacheKey] = route;
      return route;
    };
  }, [canViewModule, canManagePermissions, permissionsHash]);
  
  return {
    isRouteAccessible: isRouteAccessibleMemo,
    getFirstAccessibleRoute: getFirstAccessibleRouteMemo,
  };
};

/**
 * Hook para gerenciar redirecionamentos dinâmicos baseados em mudanças de permissão
 */
export const useDynamicRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRouteAccessible, getFirstAccessibleRoute } = useRedirectUtils();
  const { canViewModule, canManagePermissions } = usePermissionsV2();
  
  // Verificar se a rota atual ainda é acessível quando as permissões mudam
  const checkCurrentRouteAccess = useCallback(() => {
    const currentPath = location.pathname;
    
    // Ignorar rotas que não precisam de verificação
    if (currentPath === '/' || currentPath === '/auth' || currentPath === '/access-denied') {
      return;
    }
    
    // Verificar se a rota está mapeada no ROUTE_MODULES
    const requiredModule = ROUTE_MODULES[currentPath as keyof typeof ROUTE_MODULES];
    
    // Se a rota não está mapeada, não fazer redirecionamento automático
    if (requiredModule === undefined) {
      return;
    }
    
    const hasAccess = isRouteAccessible(currentPath, canViewModule, canManagePermissions() || false);
    
    if (!hasAccess) {
      const newRoute = getFirstAccessibleRoute();
      navigate(newRoute, { replace: true });
    }
  }, [location.pathname, isRouteAccessible, getFirstAccessibleRoute, navigate, canViewModule, canManagePermissions]);
  
  // Registrar listener para mudanças de permissão
  useEffect(() => {
    const unsubscribe = addPermissionChangeListener((newPermissions) => {
      // Aguardar um tick para garantir que o hook de permissões foi atualizado
      setTimeout(checkCurrentRouteAccess, 100);
    });
    
    return unsubscribe;
  }, [checkCurrentRouteAccess]);
  
  // Verificar acesso quando a rota muda
  useEffect(() => {
    checkCurrentRouteAccess();
  }, [location.pathname, checkCurrentRouteAccess]);
  
  return {
    checkCurrentRouteAccess,
    isRouteAccessible,
    getFirstAccessibleRoute,
  };
};