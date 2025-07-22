
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PayrollSheetSelector } from '@/components/payroll/PayrollSheetSelector';
import { PayrollSheetActions } from '@/components/payroll/PayrollSheetActions';
import { NewPayrollDialog } from '@/components/payroll/NewPayrollDialog';
import { EditPayrollDialog } from '@/components/payroll/EditPayrollDialog';
import { PayrollTable } from '@/components/payroll/PayrollTable';
import { PayrollAllocationTable } from '@/components/payroll/PayrollAllocationTable';
import { PayrollFilters } from '@/components/payroll/PayrollFilters';
import { PayrollTotals } from '@/components/payroll/PayrollTotals';
import { payrollService } from '@/services/payrollService';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { AlertTriangle } from 'lucide-react';
import type { Payroll, PayrollEntry, Unit, PayrollFilters as PayrollFiltersType } from '@/types/payroll';

export default function PayrollPage() {
  const { toast } = useToast();
  const { checkPermission } = usePermissions();
  
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [filters, setFilters] = useState<PayrollFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [newPayrollOpen, setNewPayrollOpen] = useState(false);
  const [editPayrollOpen, setEditPayrollOpen] = useState(false);

  // Check permissions
  const canAccess = checkPermission('canAccessSettings', false);

  useEffect(() => {
    if (canAccess) {
      loadPayrolls();
      loadUnits();
    }
  }, [canAccess]);

  useEffect(() => {
    if (selectedPayroll) {
      loadPayrollEntries();
    }
  }, [selectedPayroll, filters]);

  const loadPayrolls = async () => {
    try {
      const data = await payrollService.getPayrolls();
      setPayrolls(data);
      
      // Auto-select the most recent payroll
      if (data.length > 0 && !selectedPayroll) {
        setSelectedPayroll(data[0]);
      }
    } catch (error) {
      console.error('Error loading payrolls:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar folhas de pagamento',
        variant: 'destructive'
      });
    }
  };

  const loadPayrollEntries = async () => {
    if (!selectedPayroll) return;

    try {
      setLoading(true);
      const entries = await payrollService.getPayrollEntries(
        selectedPayroll.month, 
        selectedPayroll.year, 
        filters
      );
      setPayrollEntries(entries);
    } catch (error) {
      console.error('Error loading payroll entries:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados da folha de pagamento',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const unitsData = await payrollService.getUnits();
      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const handleCreatePayroll = async (data: {
    month: number;
    year: number;
    duplicateFromMonth?: number;
    duplicateFromYear?: number;
  }) => {
    try {
      const duplicateFrom = data.duplicateFromMonth && data.duplicateFromYear 
        ? { month: data.duplicateFromMonth, year: data.duplicateFromYear }
        : undefined;

      const newPayroll = await payrollService.createPayroll(
        data.month, 
        data.year, 
        duplicateFrom
      );
      
      await loadPayrolls();
      setSelectedPayroll(newPayroll);
      
      toast({
        title: 'Sucesso',
        description: 'Folha de pagamento criada com sucesso',
      });
    } catch (error) {
      console.error('Error creating payroll:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar folha de pagamento',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicatePayroll = async () => {
    if (!selectedPayroll) return;

    try {
      const newMonth = selectedPayroll.month === 12 ? 1 : selectedPayroll.month + 1;
      const newYear = selectedPayroll.month === 12 ? selectedPayroll.year + 1 : selectedPayroll.year;

      const newPayroll = await payrollService.createPayroll(
        newMonth,
        newYear,
        { month: selectedPayroll.month, year: selectedPayroll.year }
      );
      
      await loadPayrolls();
      setSelectedPayroll(newPayroll);
      
      toast({
        title: 'Sucesso',
        description: 'Folha de pagamento duplicada com sucesso',
      });
    } catch (error) {
      console.error('Error duplicating payroll:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao duplicar folha de pagamento',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePayroll = async (updates: Partial<Payroll>) => {
    if (!selectedPayroll) return;

    try {
      await payrollService.updatePayrollStatus(selectedPayroll.id, updates.status!);
      
      // Update local state
      const updatedPayroll = { ...selectedPayroll, ...updates };
      setSelectedPayroll(updatedPayroll);
      setPayrolls(payrolls.map(p => p.id === updatedPayroll.id ? updatedPayroll : p));
      
      toast({
        title: 'Sucesso',
        description: 'Folha de pagamento atualizada com sucesso',
      });
    } catch (error) {
      console.error('Error updating payroll:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar folha de pagamento',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePayroll = async () => {
    if (!selectedPayroll) return;

    if (selectedPayroll.status !== 'draft') {
      toast({
        title: 'Erro',
        description: 'Apenas folhas em rascunho podem ser excluídas',
        variant: 'destructive'
      });
      return;
    }

    try {
      await payrollService.deletePayroll(selectedPayroll.id);
      await loadPayrolls();
      setSelectedPayroll(null);
      setPayrollEntries([]);
      
      toast({
        title: 'Sucesso',
        description: 'Folha de pagamento excluída com sucesso',
      });
    } catch (error) {
      console.error('Error deleting payroll:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir folha de pagamento',
        variant: 'destructive'
      });
    }
  };

  const handleEntryUpdate = async (entryId: string, updates: Partial<PayrollEntry>) => {
    try {
      await payrollService.updatePayrollEntry(entryId, updates);
      
      // Update local state
      setPayrollEntries(entries => 
        entries.map(entry => 
          entry.id === entryId 
            ? { ...entry, ...updates }
            : entry
        )
      );
      
      toast({
        title: 'Sucesso',
        description: 'Dados atualizados com sucesso',
      });
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar dados',
        variant: 'destructive'
      });
    }
  };

  const handleFiltersChange = (newFilters: PayrollFiltersType) => {
    setFilters(newFilters);
  };

  const handleExportExcel = async () => {
    if (!selectedPayroll) return;

    try {
      const blob = await payrollService.exportToExcel(selectedPayroll.month, selectedPayroll.year);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `folha-pagamento-${selectedPayroll.month}-${selectedPayroll.year}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar para Excel',
        variant: 'destructive'
      });
    }
  };

  const handleExportPDF = async () => {
    if (!selectedPayroll) return;

    try {
      const blob = await payrollService.exportToPDF(selectedPayroll.month, selectedPayroll.year);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `folha-pagamento-${selectedPayroll.month}-${selectedPayroll.year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar para PDF',
        variant: 'destructive'
      });
    }
  };

  if (!canAccess) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar a folha de pagamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">💸 Folha de Pagamento</h1>
        <p className="text-muted-foreground">
          Gerencie e visualize as folhas de pagamento mensais
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Payroll Selector */}
        <div className="lg:col-span-1">
          <PayrollSheetSelector
            payrolls={payrolls}
            selectedPayroll={selectedPayroll}
            onSelectPayroll={setSelectedPayroll}
            onNewPayroll={() => setNewPayrollOpen(true)}
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedPayroll ? (
            <>
              {/* Payroll Actions */}
              <PayrollSheetActions
                payroll={selectedPayroll}
                onEdit={() => setEditPayrollOpen(true)}
                onDuplicate={handleDuplicatePayroll}
                onDelete={handleDeletePayroll}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
              />

              {/* Filters */}
              <PayrollFilters
                units={units}
                onFiltersChange={handleFiltersChange}
              />

              {/* Main Payroll Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Tabela Principal</CardTitle>
                </CardHeader>
                <CardContent>
                  <PayrollTable
                    entries={payrollEntries}
                    units={units}
                    onEntryUpdate={handleEntryUpdate}
                    loading={loading}
                  />
                </CardContent>
              </Card>

              {/* Allocation Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Tabela de Rateio</CardTitle>
                </CardHeader>
                <CardContent>
                  <PayrollAllocationTable
                    entries={payrollEntries}
                    units={units}
                    onAllocationUpdate={loadPayrollEntries}
                  />
                </CardContent>
              </Card>

              {/* Totals */}
              <PayrollTotals
                entries={payrollEntries}
                units={units}
              />
            </>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Selecione uma folha de pagamento
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Escolha uma folha na barra lateral ou crie uma nova
                  </p>
                  <Button onClick={() => setNewPayrollOpen(true)}>
                    Criar Nova Folha
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <NewPayrollDialog
        open={newPayrollOpen}
        onOpenChange={setNewPayrollOpen}
        onCreatePayroll={handleCreatePayroll}
      />

      <EditPayrollDialog
        open={editPayrollOpen}
        onOpenChange={setEditPayrollOpen}
        payroll={selectedPayroll}
        onUpdatePayroll={handleUpdatePayroll}
      />
    </div>
  );
}
