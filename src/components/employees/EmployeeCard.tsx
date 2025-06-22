
import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Edit } from 'lucide-react';
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleStatusToggle = () => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    updateEmployee(employee.id, { status: newStatus });
    
    toast({
      title: 'Status atualizado',
      description: `Colaborador ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
    });
  };

  const handleDelete = () => {
    deleteEmployee(employee.id);
    toast({
      title: 'Colaborador removido',
      description: 'O colaborador foi removido com sucesso.',
    });
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
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Colaborador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStatusToggle}>
                {employee.status === 'active' ? 'Desativar' : 'Ativar'} Colaborador
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
                    <AlertDialogAction onClick={handleDelete}>
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
    </>
  );
};
