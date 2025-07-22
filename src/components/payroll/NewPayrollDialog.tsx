
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface NewPayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePayroll: (data: {
    month: number;
    year: number;
    duplicateFromMonth?: number;
    duplicateFromYear?: number;
  }) => void;
}

export function NewPayrollDialog({
  open,
  onOpenChange,
  onCreatePayroll
}: NewPayrollDialogProps) {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [duplicateData, setDuplicateData] = useState(false);
  const [duplicateMonth, setDuplicateMonth] = useState<number>(new Date().getMonth());
  const [duplicateYear, setDuplicateYear] = useState<number>(new Date().getFullYear());

  const getMonthName = (monthNum: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthNum - 1];
  };

  const handleSubmit = () => {
    onCreatePayroll({
      month,
      year,
      duplicateFromMonth: duplicateData ? duplicateMonth : undefined,
      duplicateFromYear: duplicateData ? duplicateYear : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Folha de Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Mês</Label>
              <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const yearOption = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={yearOption} value={yearOption.toString()}>
                        {yearOption}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="duplicate"
                checked={duplicateData}
                onCheckedChange={setDuplicateData}
              />
              <Label htmlFor="duplicate">
                Duplicar dados de outra folha
              </Label>
            </div>

            {duplicateData && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label>Mês de origem</Label>
                  <Select 
                    value={duplicateMonth.toString()} 
                    onValueChange={(value) => setDuplicateMonth(parseInt(value))}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label>Ano de origem</Label>
                  <Select 
                    value={duplicateYear.toString()} 
                    onValueChange={(value) => setDuplicateYear(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const yearOption = new Date().getFullYear() - 2 + i;
                        return (
                          <SelectItem key={yearOption} value={yearOption.toString()}>
                            {yearOption}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Criar Folha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
