import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PayrollTable } from '@/components/payroll/PayrollTable';
import { PayrollAllocationTable } from '@/components/payroll/PayrollAllocationTable';
import { PayrollFilters } from '@/components/payroll/PayrollFilters';
import { PayrollTotals } from '@/components/payroll/PayrollTotals';
import { payrollService } from '@/services/payrollService';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Download, FileText, FileSpreadsheet, Plus } from 'lucide-react';
import type { Payroll, PayrollEntry, Unit, PayrollFilters as PayrollFiltersType } from '@/types/payroll';

export default function PayrollPage() {
  const { toast } = useToast();
  const { checkPermission } = usePermissions();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [filters, setFilters] = useState<PayrollFiltersType>({});
  const [loading, setLoading] = useState(true);

  // Check permissions
  const canAccess = checkPermission('canAccessSettings', false);

  useEffect(() => {
    if (canAccess) {
      loadData();
      loadUnits();
    }
  }, [currentMonth, currentYear, canAccess]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load or create payroll
      let currentPayroll = await payrollService.getPayroll(currentMonth, currentYear);
      if (!currentPayroll) {
        currentPayroll = await payrollService.createPayroll(currentMonth, currentYear);
        await payrollService.createPayrollEntries(currentPayroll.id);
      }
      
      setPayroll(currentPayroll);
      
      // Load payroll entries
      const entries = await payrollService.getPayrollEntries(currentMonth, currentYear, filters);
      setPayrollEntries(entries);
      
    } catch (error) {
      console.error('Error loading payroll data:', error);
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

  const handleCreatePayroll = async () => {
    try {
      const newPayroll = await payrollService.createPayroll(currentMonth, currentYear);
      await payrollService.createPayrollEntries(newPayroll.id);
      setPayroll(newPayroll);
      await loadData();
      
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
    loadData();
  };

  const handleExportExcel = async () => {
    try {
      const blob = await payrollService.exportToExcel(currentMonth, currentYear);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `folha-pagamento-${currentMonth}-${currentYear}.xlsx`;
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
    try {
      const blob = await payrollService.exportToPDF(currentMonth, currentYear);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `folha-pagamento-${currentMonth}-${currentYear}.pdf`;
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

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">💸 Folha de Pagamento</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize a folha de pagamento mensal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={currentMonth.toString()}
            onValueChange={(value) => setCurrentMonth(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {getMonthName(i + 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentYear.toString()}
            onValueChange={(value) => setCurrentYear(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status and Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">
                {getMonthName(currentMonth)} de {currentYear}
              </CardTitle>
              {payroll && (
                <Badge variant={
                  payroll.status === 'draft' ? 'secondary' :
                  payroll.status === 'approved' ? 'default' : 'destructive'
                }>
                  {payroll.status === 'draft' ? 'Rascunho' :
                   payroll.status === 'approved' ? 'Aprovado' : 'Pago'}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              {!payroll ? (
                <Button onClick={handleCreatePayroll} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Gerar Folha para {getMonthName(currentMonth)}/{currentYear}
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleExportPDF}
                    disabled={payrollEntries.length === 0}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportExcel}
                    disabled={payrollEntries.length === 0}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {payroll && (
        <>
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
                onAllocationUpdate={loadData}
              />
            </CardContent>
          </Card>

          {/* Totals */}
          <PayrollTotals
            entries={payrollEntries}
            units={units}
          />
        </>
      )}
    </div>
  );
}