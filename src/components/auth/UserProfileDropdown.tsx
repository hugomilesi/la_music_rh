
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const UserProfileDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, session } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    console.log('User initiated logout');

    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Erro ao sair",
          description: "Houve um problema ao fazer logout. Tente o logout de emergência.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro durante o logout. Use o logout de emergência se necessário.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = () => {
    navigate('/perfil');
  };



  const handleSettingsClick = () => {
    navigate('/configuracoes-usuario');
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getRoleColor = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'gerente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Session status indicator
  const getSessionStatus = () => {
    if (!session) return { color: 'bg-red-500', text: 'Desconectado' };
    
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      return { color: 'bg-orange-500', text: 'Sessão Expirada' };
    }
    
    return { color: 'bg-green-500', text: 'Conectado' };
  };

  const sessionStatus = getSessionStatus();

  return (
    <div className="flex items-center gap-2">
      {/* Session Status Indicator */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <div className={`w-2 h-2 rounded-full ${sessionStatus.color}`} />
        <span className="hidden sm:inline">{sessionStatus.text}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ''} />
              <AvatarFallback className="text-sm">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ''} />
                <AvatarFallback>
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{profile?.full_name || 'Usuário'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            {profile?.role && (
              <Badge variant="secondary" className={getRoleColor(profile.role)}>
                {profile.role}
              </Badge>
            )}
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${sessionStatus.color}`} />
              <span>{sessionStatus.text}</span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="text-red-600 focus:text-red-600"
          >
            {isLoggingOut ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saindo...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </>
            )}
          </DropdownMenuItem>
          

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
