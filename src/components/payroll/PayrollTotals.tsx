import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { PayrollEntry, Unit } from '@/types/payroll';

interface PayrollTotalsProps {
  entries: PayrollEntry[];
  units: Unit[];
}

export function PayrollTotals({ entries, units }: PayrollTotalsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate overall totals
  const overallTotals = entries.reduce(
    (acc, entry) => {
      acc.totalEarnings += entry.total_earnings || 0;
      acc.totalDeductions += entry.total_deductions || 0;
      acc.netTotal += entry.net_total || 0;
      return acc;
    },
    { totalEarnings: 0, totalDeductions: 0, netTotal: 0 }
  );

  // Calculate totals by unit (this would need allocation data in a real implementation)
  const unitTotals = units.map(unit => ({
    unit,
    total: 0 // This would be calculated from actual allocation data
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Totais Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total de Proventos:</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(overallTotals.totalEarnings)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total de Descontos:</span>
            <span className="text-lg font-bold text-red-600">
              {formatCurrency(overallTotals.totalDeductions)}
            </span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-base font-bold">Total Líquido:</span>
            <span className="text-xl font-bold">
              {formatCurrency(overallTotals.netTotal)}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {entries.length} colaborador{entries.length !== 1 ? 'es' : ''} na folha
          </div>
        </CardContent>
      </Card>

      {/* Unit Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Totais por Unidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {unitTotals.map(({ unit, total }) => (
            <div key={unit.id} className="flex justify-between items-center">
              <span className="text-sm font-medium">{unit.nome}:</span>
              <span className="font-bold">
                {formatCurrency(total)}
              </span>
            </div>
          ))}
          
          {unitTotals.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              Nenhuma unidade encontrada
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold">Total Alocado:</span>
            <span className="font-bold">
              {formatCurrency(unitTotals.reduce((sum, { total }) => sum + total, 0))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}