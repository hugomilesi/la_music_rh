import React from 'react';
import { usePermissionsV2 } from '../../hooks/usePermissionsV2';
import { getFirstAccessibleRoute, ROUTE_MODULES, PRIORITY_ROUTES } from '../../utils/redirectUtils';
import { useAuth } from '../../contexts/AuthContext';

const RedirectDebug: React.FC = () => {
  const { user, profile } = useAuth();
  const { 
    canViewModule, 
    canManagePermissions, 
    userPermissions, 
    loading, 
    error,
    isSuperAdmin,
    isAdmin,
    isGestorRH,
    isGerente
  } = usePermissionsV2();

  const firstAccessibleRoute = getFirstAccessibleRoute(canViewModule, canManagePermissions);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Debug de Redirecionamento</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações do Usuário */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Informações do Usuário</h3>
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Profile ID:</strong> {profile?.id || 'N/A'}</p>
            <p><strong>Role:</strong> {profile?.role || 'N/A'}</p>
            <p><strong>Nome:</strong> {profile?.username || 'N/A'}</p>
          </div>
        </div>

        {/* Status das Permissões */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Status das Permissões</h3>
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
            <p><strong>Error:</strong> {error || 'Nenhum'}</p>
            <p><strong>Permissões Carregadas:</strong> {userPermissions?.length || 0}</p>
            <p><strong>É Super Admin:</strong> {isSuperAdmin ? 'Sim' : 'Não'}</p>
            <p><strong>É Admin:</strong> {isAdmin ? 'Sim' : 'Não'}</p>
            <p><strong>É Gestor RH:</strong> {isGestorRH ? 'Sim' : 'Não'}</p>
            <p><strong>É Gerente:</strong> {isGerente ? 'Sim' : 'Não'}</p>
            <p><strong>Pode Gerenciar Permissões:</strong> {canManagePermissions() ? 'Sim' : 'Não'}</p>
          </div>
        </div>

        {/* Teste de Módulos */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Teste de Acesso aos Módulos</h3>
          <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
            {Object.entries(ROUTE_MODULES).map(([route, module]) => {
              if (!module) return null;
              const canView = canViewModule(module);
              return (
                <div key={route} className={`p-2 rounded mb-1 ${canView ? 'bg-green-100' : 'bg-red-100'}`}>
                  <strong>{route}</strong> ({module}): {canView ? '✅ Permitido' : '❌ Negado'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rotas Prioritárias */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Teste de Rotas Prioritárias</h3>
          <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
            {PRIORITY_ROUTES.map((route, index) => {
              const module = ROUTE_MODULES[route as keyof typeof ROUTE_MODULES];
              let canAccess = false;
              
              if (route === '/gerenciar-permissoes') {
                canAccess = !!canManagePermissions();
              } else if (!module) {
                canAccess = true; // Rotas sem módulo específico são acessíveis
              } else {
                canAccess = canViewModule(module);
              }
              
              return (
                <div key={route} className={`p-2 rounded mb-1 ${canAccess ? 'bg-green-100' : 'bg-red-100'}`}>
                  <strong>#{index + 1} {route}</strong> {module ? `(${module})` : '(sem módulo)'}: {canAccess ? '✅ Acessível' : '❌ Bloqueado'}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resultado Final */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Resultado do Redirecionamento</h3>
        <p className="text-xl font-bold text-blue-600">
          Primeira Rota Acessível: <span className="bg-blue-200 px-2 py-1 rounded">{firstAccessibleRoute}</span>
        </p>
      </div>

      {/* Permissões Detalhadas */}
      <div className="mt-6 space-y-2">
        <h3 className="text-lg font-semibold">Permissões Detalhadas</h3>
        <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
          {userPermissions && userPermissions.length > 0 ? (
            userPermissions.map((permission, index) => (
              <div key={index} className="text-sm">
                {permission.name}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma permissão carregada</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedirectDebug;