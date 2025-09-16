import React from 'react';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PermissionsTest: React.FC = () => {
  const { 
    userPermissions, 
    loading: isLoading, 
    error, 
    hasPermission, 
    canViewModule, 
    canManageModule, 
    isAdmin, 
    isSuperAdmin 
  } = usePermissionsV2();
  const { profile } = useAuth();

  const testPermissions = [
    'beneficios.view',
    'beneficios.manage',
    'permissoes.manage',
    'usuarios.view',
    'usuarios.manage'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando permissões...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Permissões - Sistema V2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Informações do Usuário:</h3>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Role:</strong> {profile?.role}</p>
            <p><strong>Nível:</strong> {profile?.nivel}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Permissões Carregadas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {userPermissions && userPermissions.length > 0 ? (
                userPermissions.map((perm) => (
                  <Badge key={perm} variant="outline">
                    {perm}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma permissão carregada</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Teste de Permissões:</h3>
            <div className="space-y-2">
              {testPermissions.map((permission) => {
                const hasAccess = hasPermission(permission);
                return (
                  <div key={permission} className="flex items-center justify-between p-2 border rounded">
                    <span>{permission}</span>
                    <div className="flex items-center gap-2">
                      {hasAccess ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={hasAccess ? "default" : "destructive"}>
                        {hasAccess ? "Permitido" : "Negado"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsTest;