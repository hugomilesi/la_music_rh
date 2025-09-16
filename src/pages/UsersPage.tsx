import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerenciamento de usuários do sistema</p>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Página de usuários em desenvolvimento</p>
            <p className="text-sm text-gray-400 mt-2">
              Esta página será implementada em breve com funcionalidades completas de gerenciamento de usuários.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;