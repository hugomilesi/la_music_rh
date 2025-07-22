import React, { useState, useEffect } from 'react';
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
import { Shuffle, AlertTriangle } from 'lucide-react';
import { payrollService } from '@/services/payrollService';
import { useToast } from '@/hooks/use-toast';
import type { PayrollEntry, Unit, PayrollAllocation } from '@/types/payroll';

interface PayrollAllocationTableProps {
  entries: PayrollEntry[];
  units: Unit[];
  onAllocationUpdate: () => void;
}

export function PayrollAllocationTable({ 
  entries, 
  units, 
  onAllocationUpdate 
}: PayrollAllocationTableProps) {
  const { toast } = useToast();
  const [allocations, setAllocations] = useState<Record<string, Record<string, number>>>({});
  const [editingCell, setEditingCell] = useState<{ entryId: string; unitId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    loadAllocations();
  }, [entries]);

  const loadAllocations = async () => {
    const allocationData: Record<string, Record<string, number>> = {};
    
    for (const entry of entries) {
      try {
        const entryAllocations = await payrollService.getAllocations(entry.id);
        allocationData[entry.id] = {};
        
        for (const unit of units) {
          const allocation = entryAllocations.find(a => a.unidade_id === unit.id);
          allocationData[entry.id][unit.id] = allocation?.valor || 0;
        }
      } catch (error) {
        console.error('Error loading allocations for entry:', entry.id, error);
      }
    }
    
    setAllocations(allocationData);
  };

  const handleCellEdit = (entryId: string, unitId: string, currentValue: number) => {
    setEditingCell({ entryId, unitId });
    setEditValue(currentValue.toString());
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    try {
      const numericValue = parseFloat(editValue) || 0;
      
      await payrollService.updateAllocation(
        editingCell.entryId, 
        editingCell.unitId, 
        numericValue
      );

      // Update local state
      setAllocations(prev => ({
        ...prev,
        [editingCell.entryId]: {
          ...prev[editingCell.entryId],
          [editingCell.unitId]: numericValue
        }
      }));

      onAllocationUpdate();
      
      toast({
        title: 'Sucesso',
        description: 'Rateio atualizado com sucesso',
      });
    } catch (error) {
      console.error('Error updating allocation:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar rateio',
        variant: 'destructive'
      });
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleAutoDistribute = async (entry: PayrollEntry) => {
    try {
      const totalAmount = (entry.base_salary || 0) + (entry.bonus || 0);
      
      if (totalAmount === 0) {
        toast({
          title: 'Aviso',
          description: 'Não há valor para distribuir (salário + bônus = 0)',
          variant: 'destructive'
        });
        return;
      }

      // For now, distribute equally among all units
      // In a real scenario, you'd want to know which units the employee is assigned to
      const unitIds = units.map(unit => unit.id);
      
      await payrollService.autoDistributeAllocation(entry.id, unitIds);
      await loadAllocations();
      onAllocationUpdate();
      
      toast({
        title: 'Sucesso',
        description: 'Rateio automático aplicado com sucesso',
      });
    } catch (error) {
      console.error('Error auto-distributing allocation:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao aplicar rateio automático',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAllocationTotal = (entryId: string) => {
    const entryAllocations = allocations[entryId] || {};
    return Object.values(entryAllocations).reduce((sum, value) => sum + value, 0);
  };

  const getExpectedTotal = (entry: PayrollEntry) => {
    return (entry.base_salary || 0) + (entry.bonus || 0);
  };

  const isAllocationValid = (entry: PayrollEntry) => {
    const total = getAllocationTotal(entry.id);
    const expected = getExpectedTotal(entry);
    return Math.abs(total - expected) < 0.01; // Allow for small rounding differences
  };

  const EditableAllocationCell = ({ 
    entryId, 
    unitId, 
    value 
  }: { 
    entryId: string; 
    unitId: string; 
    value: number; 
  }) => {
    const isEditing = editingCell?.entryId === entryId && editingCell?.unitId === unitId;

    if (isEditing) {
      return (
        <TableCell>
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
        className="cursor-pointer hover:bg-muted/50 text-right"
        onClick={() => handleCellEdit(entryId, unitId, value)}
      >
        {formatCurrency(value)}
      </TableCell>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Nome do Colaborador</TableHead>
            {units.map(unit => (
              <TableHead key={unit.id} className="text-right min-w-[150px]">
                {unit.nome}
              </TableHead>
            ))}
            <TableHead className="text-right min-w-[150px]">Total Alocado</TableHead>
            <TableHead className="text-right min-w-[150px]">Esperado</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isValid = isAllocationValid(entry);
            const total = getAllocationTotal(entry.id);
            const expected = getExpectedTotal(entry);
            
            return (
              <TableRow 
                key={entry.id}
                className={!isValid ? 'bg-red-50 dark:bg-red-950/20' : ''}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {entry.collaborator_name}
                    {!isValid && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </TableCell>
                
                {units.map(unit => (
                  <EditableAllocationCell
                    key={unit.id}
                    entryId={entry.id}
                    unitId={unit.id}
                    value={allocations[entry.id]?.[unit.id] || 0}
                  />
                ))}
                
                <TableCell className="text-right font-medium">
                  <Badge variant={isValid ? 'default' : 'destructive'}>
                    {formatCurrency(total)}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  {formatCurrency(expected)}
                </TableCell>
                
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoDistribute(entry)}
                    className="gap-2"
                  >
                    <Shuffle className="h-4 w-4" />
                    Auto
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}