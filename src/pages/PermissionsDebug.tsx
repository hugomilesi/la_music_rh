import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissionsV2 } from '../hooks/usePermissionsV2';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function PermissionsDebug() {
  const { user, profile, session } = useAuth();
  const { 
    userPermissions, 
    canManagePermissions, 
    hasPermission, 
    loading, 
    error,
    isAdmin,
    isSuperAdmin 
  } = usePermissionsV2();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug de Permissões</h1>
      
      {/* Informações de Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle>Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Usuário logado:</strong> {user ? 'Sim' : 'Não'}</div>
          <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
          <div><strong>ID do usuário:</strong> {user?.id || 'N/A'}</div>
          <div><strong>Sessão ativa:</strong> {session ? 'Sim' : 'Não'}</div>
        </CardContent>
      </Card>

      {/* Informações do Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Nome:</strong> {profile?.full_name || 'N/A'}</div>
          <div><strong>Email:</strong> {profile?.email || 'N/A'}</div>
          <div><strong>Role:</strong> <Badge>{profile?.role || 'N/A'}</Badge></div>
          <div><strong>Status:</strong> <Badge>{profile?.status || 'N/A'}</Badge></div>
          <div><strong>ID do perfil:</strong> {profile?.id || 'N/A'}</div>
          <div><strong>Auth User ID:</strong> {profile?.auth_user_id || 'N/A'}</div>
        </CardContent>
      </Card>

      {/* Status das Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Permissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</div>
          <div><strong>Erro:</strong> {error || 'Nenhum'}</div>
          <div><strong>É Super Admin:</strong> <Badge variant={isSuperAdmin ? 'default' : 'secondary'}>{isSuperAdmin ? 'Sim' : 'Não'}</Badge></div>
          <div><strong>É Admin:</strong> <Badge variant={isAdmin ? 'default' : 'secondary'}>{isAdmin ? 'Sim' : 'Não'}</Badge></div>
          <div><strong>Pode Gerenciar Permissões:</strong> <Badge variant={canManagePermissions() ? 'default' : 'destructive'}>{canManagePermissions() ? 'Sim' : 'Não'}</Badge></div>
        </CardContent>
      </Card>

      {/* Lista de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Permissões do Usuário ({userPermissions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {userPermissions && userPermissions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {userPermissions.map((permission, index) => (
                <Badge key={index} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma permissão carregada</p>
          )}
        </CardContent>
      </Card>

      {/* Testes de Permissões Específicas */}
      <Card>
        <CardHeader>
          <CardTitle>Testes de Permissões Específicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>permissoes.manage:</strong> 
            <Badge variant={hasPermission('permissoes.manage') ? 'default' : 'destructive'} className="ml-2">
              {hasPermission('permissoes.manage') ? 'Permitido' : 'Negado'}
            </Badge>
          </div>
          <div>
            <strong>usuarios.view:</strong> 
            <Badge variant={hasPermission('usuarios.view') ? 'default' : 'destructive'} className="ml-2">
              {hasPermission('usuarios.view') ? 'Permitido' : 'Negado'}
            </Badge>
          </div>
          <div>
            <strong>dashboard.view:</strong> 
            <Badge variant={hasPermission('dashboard.view') ? 'default' : 'destructive'} className="ml-2">
              {hasPermission('dashboard.view') ? 'Permitido' : 'Negado'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
          <div><strong>User Agent:</strong> {navigator.userAgent}</div>
          <div><strong>URL atual:</strong> {window.location.href}</div>
        </CardContent>
      </Card>
    </div>
  );
}