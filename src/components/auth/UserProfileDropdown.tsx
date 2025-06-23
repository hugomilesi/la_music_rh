
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const UserProfileDropdown: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Debounced logout handler to prevent multiple simultaneous attempts
  const handleSignOut = useCallback(async () => {
    if (isLoggingOut) {
      console.log('Logout already in progress, ignoring duplicate request');
      return;
    }

    console.log('Starting logout process...');
    setIsLoggingOut(true);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Logout error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('session_not_found') || error.message?.includes('Session not found')) {
          console.log('Session already invalid, proceeding with logout cleanup');
          toast({
            title: 'Sessão finalizada',
            description: 'Você foi desconectado com sucesso.',
            variant: 'default'
          });
          // Don't navigate here - let AuthContext handle it
          return;
        }
        
        toast({
          title: 'Erro ao sair',
          description: 'Não foi possível fazer logout. Tente novamente.',
          variant: 'destructive'
        });
        setIsLoggingOut(false);
        return;
      }
      
      console.log('Logout successful');
      toast({
        title: 'Sessão finalizada',
        description: 'Você foi desconectado com sucesso.',
        variant: 'default'
      });
      
      // Don't navigate here - let AuthContext handle redirection
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive'
      });
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, signOut, toast]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.email || 'Usuário';
  const initials = getInitials(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {profile?.role && (
              <p className="text-xs leading-none text-muted-foreground capitalize">
                {profile.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className={isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
