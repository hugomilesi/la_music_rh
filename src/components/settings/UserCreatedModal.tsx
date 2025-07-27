import React, { useState } from 'react';
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
import { Copy, Check, User, Mail, Lock, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserCreatedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {
    name: string;
    email: string;
    password: string;
    position: string;
    department?: string;
  };
}

export const UserCreatedModal: React.FC<UserCreatedModalProps> = ({
  open,
  onOpenChange,
  userData
}) => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [field]: true });
      toast({
        title: "Copiado!",
        description: `${field} copiado para a área de transferência`,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied({ ...copied, [field]: false });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar para a área de transferência",
        variant: "destructive"
      });
    }
  };

  const copyAllCredentials = async () => {
    const credentials = `Nome: ${userData.name}\nEmail: ${userData.email}\nSenha Temporária: ${userData.password}\nCargo: ${userData.position}${userData.department ? `\nDepartamento: ${userData.department}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(credentials);
      toast({
        title: "Credenciais copiadas!",
        description: "Todas as informações foram copiadas para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar credenciais",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Usuário Criado com Sucesso!
          </DialogTitle>
          <DialogDescription>
            O usuário foi criado com sucesso. Copie as informações abaixo para enviar ao novo usuário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome
            </Label>
            <div className="flex gap-2">
              <Input
                value={userData.name}
                readOnly
                className="bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(userData.name, 'Nome')}
              >
                {copied.Nome ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <div className="flex gap-2">
              <Input
                value={userData.email}
                readOnly
                className="bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(userData.email, 'Email')}
              >
                {copied.Email ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Senha Temporária */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Senha Temporária
            </Label>
            <div className="flex gap-2">
              <Input
                value={userData.password}
                readOnly
                className="bg-muted font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(userData.password, 'Senha')}
              >
                {copied.Senha ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Cargo
            </Label>
            <div className="flex gap-2">
              <Input
                value={userData.position}
                readOnly
                className="bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(userData.position, 'Cargo')}
              >
                {copied.Cargo ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Departamento (se existir) */}
          {userData.department && (
            <div className="space-y-2">
              <Label>Departamento</Label>
              <div className="flex gap-2">
                <Input
                  value={userData.department}
                  readOnly
                  className="bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(userData.department!, 'Departamento')}
                >
                  {copied.Departamento ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={copyAllCredentials}
              className="flex-1"
              variant="default"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Todas as Credenciais
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};