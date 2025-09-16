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
import { Shuffle, AlertTriangle, Maximize2, X } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

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
        // Log desabilitado: Error loading allocations for entry
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
      // Log desabilitado: Error updating allocation
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
      // Log desabilitado: Error auto-distributing allocation
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
    <>
      {/* Normal Table View */}
      <div className={`${isExpanded ? 'hidden' : 'block'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Rateio de Folha de Pagamento</h3>
          <button
            onClick={toggleExpansion}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg rounded-lg transition-all duration-300 border-none"
          >
            <Maximize2 className="w-4 h-4" />
            Expandir Tabela
          </button>
        </div>
        <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Colaborador</TableHead>
            {units.map((unit, index) => (
              <TableHead key={unit.id} className={`text-right ${index >= 2 ? 'hidden lg:table-cell' : index >= 1 ? 'hidden md:table-cell' : ''}`}>
                {unit.nome}
              </TableHead>
            ))}
            <TableHead className="text-right">Total Alocado</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Esperado</TableHead>
            <TableHead className="hidden sm:table-cell">Ações</TableHead>
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
                className={!isValid ? 'bg-gray-50 dark:bg-gray-800/20' : ''}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {entry.collaborator_name}
                    {!isValid && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </TableCell>
                
                {units.map((unit, index) => (
                  <TableCell key={unit.id} className={`text-right ${index >= 2 ? 'hidden lg:table-cell' : index >= 1 ? 'hidden md:table-cell' : ''}`}>
                    <EditableAllocationCell
                      entryId={entry.id}
                      unitId={unit.id}
                      value={allocations[entry.id]?.[unit.id] || 0}
                    />
                  </TableCell>
                ))}
                
                <TableCell className="text-right font-medium">
                  <Badge variant={isValid ? 'default' : 'secondary'}>
                    {formatCurrency(total)}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right hidden sm:table-cell">
                  {formatCurrency(expected)}
                </TableCell>
                
                <TableCell className="hidden sm:table-cell">
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

      {/* Expanded Table View with Glassmorphism */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-[95vw] sm:w-[90vw] max-h-[90vh] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden relative">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/50 dark:bg-gray-800/50">
              <h3 className="text-xl font-semibold">Rateio de Folha de Pagamento - Expandido</h3>
              <button
                onClick={toggleExpansion}
                className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
                style={{ background: 'linear-gradient(135deg, hsl(0, 0%, 98%) 0%, #FAFAFA 100%)' }}
              >
                <X className="w-4 h-4" />
                Fechar
              </button>
            </div>
            
            {/* Scrollable table container */}
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              <Table className="w-full min-w-[1200px]">
                <TableHeader className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <TableRow className="border-b border-white/20">
                    <TableHead className="font-semibold w-[200px] bg-white/90 dark:bg-gray-800/90">Nome do Colaborador</TableHead>
                    {units.map((unit, index) => (
                      <TableHead key={unit.id} className="font-semibold w-[120px] text-right bg-white/90 dark:bg-gray-800/90">
                        {unit.nome}
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold w-[120px] text-right bg-white/90 dark:bg-gray-800/90">Total Alocado</TableHead>
                    <TableHead className="font-semibold w-[120px] text-right bg-white/90 dark:bg-gray-800/90">Esperado</TableHead>
                    <TableHead className="font-semibold w-[100px] bg-white/90 dark:bg-gray-800/90">Ações</TableHead>
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
                        className={`hover:bg-white/30 dark:hover:bg-gray-800/30 border-b border-white/10 ${
                          !isValid ? 'bg-gray-100/50 dark:bg-gray-800/30' : ''
                        }`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {entry.collaborator_name}
                            {!isValid && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        
                        {units.map((unit, index) => {
                          const value = allocations[entry.id]?.[unit.id] || 0;
                          const isEditing = editingCell?.entryId === entry.id && editingCell?.unitId === unit.id;
                          
                          return (
                            <TableCell key={unit.id} className="text-right w-[120px]">
                              {isEditing ? (
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
                              ) : (
                                <div 
                                  className="cursor-pointer hover:bg-white/20 p-2 rounded transition-colors"
                                  onClick={() => handleCellEdit(entry.id, unit.id, value)}
                                >
                                  {formatCurrency(value)}
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                        
                        <TableCell className="text-right font-medium">
                          <Badge variant={isValid ? 'default' : 'secondary'}>
                            {formatCurrency(total)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-right w-[120px]">
                          {formatCurrency(expected)}
                        </TableCell>
                        
                        <TableCell className="w-[100px]">
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
          </div>
        </div>
      )}
    </>
  );
}