
import React, { useState, useEffect, useMemo } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Employee } from '@/types/employee';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { EditEmployeeDialog } from './EditEmployeeDialog';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { PermissionAlert } from '@/components/ui/PermissionAlert';

interface EmployeeCardProps {
  employee: Employee;
  autoOpenEdit?: boolean;
  onEditClose?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  autoOpenEdit = false,
  onEditClose 
}) => {
  const { updateEmployee, deleteEmployee } = useEmployees();
  const { toast } = useToast();
  const { canEditInModule, canDeleteInModule } = usePermissionsV2();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  
  const canManageEmployees = useMemo(() => canEditInModule('usuarios'), [canEditInModule]);
  const canDelete = useMemo(() => canDeleteInModule('usuarios'), [canDeleteInModule]);

  // Auto-open edit dialog when autoOpenEdit prop is true
  useEffect(() => {
    if (autoOpenEdit) {
      setIsEditDialogOpen(true);
    }
  }, [autoOpenEdit]);

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open && onEditClose) {
      onEditClose();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusToggle = async () => {
    if (!canManageEmployees) {
      setShowPermissionAlert(true);
      return;
    }
    
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    await updateEmployee(employee.id, { status: newStatus });
  };

  const handleDelete = async () => {
    if (!canDelete) {
      setShowPermissionAlert(true);
      return;
    }
    
    try {
      await deleteEmployee(employee.id);
    } catch (error) {
      // Log desabilitado: Erro ao deletar funcionário
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="bg-purple-100 text-purple-600">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-600">{employee.position}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {employee.department}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    employee.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => {
                if (!canManageEmployees) {
                  setShowPermissionAlert(true);
                  return;
                }
                setIsEditDialogOpen(true);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Colaborador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStatusToggle}>
                {employee.status === 'active' ? 'Desativar' : 'Ativar'} Colaborador
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover Colaborador
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja remover {employee.name}? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditEmployeeDialog
        employee={employee}
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
      />
      
      <PermissionAlert
        open={showPermissionAlert}
        onOpenChange={setShowPermissionAlert}
        title="Permissão Negada"
        description="Você não tem permissão para gerenciar funcionários. Esta ação é restrita a administradores."
        variant="error"
        action="Contatar Administrador"
      />
    </>
  );
};
