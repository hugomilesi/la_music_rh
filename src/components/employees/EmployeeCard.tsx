
import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Mail, Phone, Calendar } from 'lucide-react';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';

interface EmployeeCardProps {
  employee: Employee;
  autoOpenSheet?: boolean;
  onSheetClose?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  autoOpenSheet = false,
  onSheetClose 
}) => {
  const { updateEmployee, deleteEmployee } = useEmployees();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Auto-open sheet when autoOpenSheet prop is true
  useEffect(() => {
    if (autoOpenSheet) {
      setIsSheetOpen(true);
    }
  }, [autoOpenSheet]);

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open && onSheetClose) {
      onSheetClose();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{employee.name}</SheetTitle>
              <SheetDescription>
                Informações e ações do colaborador
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Início: {formatDate(employee.startDate)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleStatusToggle}
                  className="w-full"
                >
                  {employee.status === 'active' ? 'Desativar' : 'Ativar'} Colaborador
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Remover Colaborador
                    </Button>
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
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
