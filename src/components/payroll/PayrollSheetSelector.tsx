
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, FileText } from 'lucide-react';
import type { Payroll } from '@/types/payroll';

interface PayrollSheetSelectorProps {
  payrolls: Payroll[];
  selectedPayroll: Payroll | null;
  onSelectPayroll: (payroll: Payroll) => void;
  onNewPayroll: () => void;
  loading?: boolean;
}

export function PayrollSheetSelector({
  payrolls,
  selectedPayroll,
  onSelectPayroll,
  onNewPayroll,
  loading = false
}: PayrollSheetSelectorProps) {
  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

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

  const sortedPayrolls = [...payrolls].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Folhas de Pagamento
          </CardTitle>
          <Button onClick={onNewPayroll} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Folha
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : payrolls.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhuma folha de pagamento encontrada
            </p>
            <Button onClick={onNewPayroll} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Folha
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPayrolls.map((payroll) => (
              <div
                key={payroll.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-colors
                  ${selectedPayroll?.id === payroll.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                  }
                `}
                onClick={() => onSelectPayroll(payroll)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {getMonthName(payroll.month)} de {payroll.year}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Criada em {new Date(payroll.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {getStatusBadge(payroll.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
