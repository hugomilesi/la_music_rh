import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';

interface PayrollUnit {
  id: string;
  name: string;
  total: number;
  employees: number;
  color: string;
  icon: React.ReactNode;
}

interface PayrollSummary {
  totalGeneral: number;
  totalEmployees: number;
  units: PayrollUnit[];
}

interface PayrollSummaryCardsProps {
  summary: PayrollSummary;
}

export function PayrollSummaryCards({ summary }: PayrollSummaryCardsProps) {
  // Verificações de segurança para evitar erros
  const safeUnits = summary?.units || [];
  const safeTotalGeneral = summary?.totalGeneral || 0;
  const safeTotalEmployees = summary?.totalEmployees || 0;
  const safeAverage = safeTotalEmployees > 0 ? safeTotalGeneral / safeTotalEmployees : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Total Geral - Estilizado igual aos demais */}
      <Card className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                Total Geral
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(safeTotalGeneral)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {safeTotalEmployees} funcionários
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Média: {formatCurrency(safeAverage)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards das Unidades */}
      {safeUnits.map((unit) => (
        <Card 
          key={unit.id} 
          className={`bg-white dark:bg-gray-800 border-l-4 ${unit.color} hover:shadow-lg transition-shadow`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {unit.icon}
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {unit.name}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(unit.total || 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {unit.employees || 0} funcionários
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Média: {formatCurrency((unit.employees && unit.employees > 0) ? (unit.total || 0) / unit.employees : 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}