
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { SystemUser } from '@/types/systemUser';
import { deleteSystemUser } from '@/services/settingsService';

interface DeleteUserDialogProps {
  user: SystemUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDelete: (user: SystemUser) => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUserDelete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Call the parent's delete handler which handles the actual deletion
      onUserDelete(user);
      
      toast({
        title: "Usuário removido",
        description: `${user.name} foi removido do sistema`
      });

      onOpenChange(false);
    } catch (error) {

      toast({
        title: "Erro ao remover usuário",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o usuário <strong>{user?.name}</strong>?
            Esta ação não pode ser desfeita e o usuário perderá acesso ao sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Removendo...' : 'Remover Usuário'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
