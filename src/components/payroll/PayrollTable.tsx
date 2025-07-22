import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit } from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import type { PayrollEntry, Unit } from '@/types/payroll';

interface PayrollTableProps {
  entries: PayrollEntry[];
  units: Unit[];
  onEntryUpdate: (entryId: string, updates: Partial<PayrollEntry>) => void;
  loading: boolean;
}

export function PayrollTable({ entries, units, onEntryUpdate, loading }: PayrollTableProps) {
  const [editingCell, setEditingCell] = useState<{ entryId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleCellEdit = (entryId: string, field: string, currentValue: number | string) => {
    setEditingCell({ entryId, field });
    setEditValue(currentValue.toString());
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const numericValue = parseFloat(editValue) || 0;
    onEntryUpdate(editingCell.entryId, {
      [editingCell.field]: numericValue
    });

    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const EditableCell = ({ 
    entryId, 
    field, 
    value, 
    className = "" 
  }: { 
    entryId: string; 
    field: string; 
    value: number; 
    className?: string;
  }) => {
    const isEditing = editingCell?.entryId === entryId && editingCell?.field === field;

    if (isEditing) {
      return (
        <TableCell className={className}>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCellSave();
              if (e.key === 'Escape') handleCellCancel();
            }}
            autoFocus
            type="number"
            step="0.01"
            className="h-8 text-sm"
          />
        </TableCell>
      );
    }

    return (
      <TableCell 
        className={`cursor-pointer hover:bg-muted/50 ${className}`}
        onClick={() => handleCellEdit(entryId, field, value)}
      >
        {formatCurrency(value)}
      </TableCell>
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum colaborador encontrado para este período.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Nome</TableHead>
            <TableHead className="min-w-[120px]">Classificação</TableHead>
            <TableHead className="min-w-[150px]">Função</TableHead>
            <TableHead className="min-w-[150px]">Rateio</TableHead>
            <TableHead className="text-right min-w-[120px]">Salário</TableHead>
            <TableHead className="text-right min-w-[120px]">Bônus</TableHead>
            <TableHead className="text-right min-w-[120px]">Comissão</TableHead>
            <TableHead className="text-right min-w-[120px]">Passagem</TableHead>
            <TableHead className="text-right min-w-[120px]">Reembolso</TableHead>
            <TableHead className="text-right min-w-[120px]">INSS</TableHead>
            <TableHead className="text-right min-w-[120px]">Lojinha</TableHead>
            <TableHead className="text-right min-w-[120px]">Bistrô</TableHead>
            <TableHead className="text-right min-w-[120px]">Adiantamento</TableHead>
            <TableHead className="text-right min-w-[120px]">Desconto</TableHead>
            <TableHead className="text-right min-w-[150px]">Total Proventos</TableHead>
            <TableHead className="text-right min-w-[150px]">Total Descontos</TableHead>
            <TableHead className="text-right min-w-[150px]">Total Líquido</TableHead>
            <TableHead className="w-[50px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">
                <div>
                  <p className="font-medium">{entry.collaborator_name}</p>
                  <p className="text-sm text-muted-foreground">{entry.collaborator_email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {entry.classification || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>{entry.role}</TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {/* This would show unit allocation summary */}
                  Multiple units
                </span>
              </TableCell>
              
              <EditableCell 
                entryId={entry.id} 
                field="base_salary" 
                value={entry.base_salary || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="bonus" 
                value={entry.bonus || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="commission" 
                value={entry.commission || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="transport_voucher" 
                value={entry.transport_voucher || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="reimbursement" 
                value={entry.reimbursement || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="inss" 
                value={entry.inss || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="store_expenses" 
                value={entry.store_expenses || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="bistro_expenses" 
                value={entry.bistro_expenses || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="salary_advance" 
                value={entry.salary_advance || 0}
                className="text-right"
              />
              <EditableCell 
                entryId={entry.id} 
                field="other_discounts" 
                value={entry.other_discounts || 0}
                className="text-right"
              />
              
              <TableCell className="text-right font-medium text-green-600">
                {formatCurrency(entry.total_earnings || 0)}
              </TableCell>
              <TableCell className="text-right font-medium text-red-600">
                {formatCurrency(entry.total_deductions || 0)}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(entry.net_total || 0)}
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Ver Histórico
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Adicionar Observação
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}