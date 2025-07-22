
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Copy, Edit, Trash2, FileText, FileSpreadsheet } from 'lucide-react';
import type { Payroll } from '@/types/payroll';

interface PayrollSheetActionsProps {
  payroll: Payroll;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export function PayrollSheetActions({
  payroll,
  onEdit,
  onDuplicate,
  onDelete,
  onExportPDF,
  onExportExcel
}: PayrollSheetActionsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'approved':
        return <Badge variant="default">Aprovado</Badge>;
      case 'paid':
        return <Badge variant="destructive">Pago</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        <div>
          <h3 className="font-semibold">
            {getMonthName(payroll.month)} de {payroll.year}
          </h3>
          <p className="text-sm text-muted-foreground">
            Criado em {new Date(payroll.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        {getStatusBadge(payroll.status)}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onEdit} variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar Folha
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar Folha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete} 
              className="text-destructive"
              disabled={payroll.status !== 'draft'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Folha
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
