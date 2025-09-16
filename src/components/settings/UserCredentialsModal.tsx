import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';

interface UserCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCredentials: {
    name: string;
    email: string;
    password: string;
    position: string;
    department?: string;
  };
}

export const UserCredentialsModal: React.FC<UserCredentialsModalProps> = ({
  isOpen,
  onClose,
  userCredentials
}) => {
  const { canCreateInModule } = usePermissionsV2();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [field]: true });
      toast.success(`${field} copiado para a área de transferência`);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied({ ...copied, [field]: false });
      }, 2000);
    } catch (error) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const copyAllCredentials = async () => {
    const credentials = `Nome: ${userCredentials.name}
Email: ${userCredentials.email}
Senha: ${userCredentials.password}
Cargo: ${userCredentials.position}${userCredentials.department ? `
Departamento: ${userCredentials.department}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(credentials);
      toast.success('Todas as credenciais copiadas!');
    } catch (error) {
      toast.error('Erro ao copiar credenciais');
    }
  };

  // Verificação de permissão
  if (!canCreateInModule('usuarios')) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para visualizar credenciais de usuários.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Usuário Criado com Sucesso!</span>
          </DialogTitle>
          <DialogDescription>
            O usuário foi criado com sucesso. Anote ou copie as credenciais abaixo para fornecer ao novo colaborador.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="flex space-x-2">
              <Input
                id="name"
                value={userCredentials.name}
                readOnly
                className="bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(userCredentials.name, 'Nome')}
                className="px-3"
              >
                {copied.Nome ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email de Acesso</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                value={userCredentials.email}
                readOnly
                className="bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(userCredentials.email, 'Email')}
                className="px-3"
              >
                {copied.Email ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha Temporária</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={userCredentials.password}
                  readOnly
                  className="bg-gray-50 pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(userCredentials.password, 'Senha')}
                className="px-3"
              >
                {copied.Senha ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label htmlFor="modal-position">Cargo</Label>
            <div className="flex space-x-2">
              <Input
                id="modal-position"
                value={userCredentials.position}
                readOnly
                className="bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(userCredentials.position, 'Cargo')}
                className="px-3"
              >
                {copied.Cargo ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Departamento */}
          {userCredentials.department && (
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <div className="flex space-x-2">
                <Input
                  id="department"
                  value={userCredentials.department}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(userCredentials.department!, 'Departamento')}
                  className="px-3"
                >
                  {copied.Departamento ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Aviso de Segurança */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs">!</span>
              </div>
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Forneça essas credenciais ao novo colaborador de forma segura</li>
                  <li>Oriente o usuário a alterar a senha no primeiro acesso</li>
                  <li>Essas informações não serão exibidas novamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={copyAllCredentials}
            className="flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copiar Tudo</span>
          </Button>
          
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};