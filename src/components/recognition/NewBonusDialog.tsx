
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Gift, Star, User, MapPin, Lock } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { Unit } from '@/types/employee';

interface NewBonusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveBonus?: (bonus: any) => void;
}

export const NewBonusDialog: React.FC<NewBonusDialogProps> = ({
  open,
  onOpenChange,
  onSaveBonus
}) => {
  const { employees } = useEmployees();
  const { canCreateInModule } = usePermissionsV2();
  const canManagePayroll = useMemo(() => canCreateInModule('folha_pagamento'), [canCreateInModule]);
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [bonusType, setBonusType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState('');

  const getUnitDisplayName = (unit: Unit) => {
    const unitNames = {
      [Unit.CAMPO_GRANDE]: 'Campo Grande',
      [Unit.BARRA]: 'Barra',
      [Unit.RECREIO]: 'Recreio'
    };
    return unitNames[unit] || unit;
  };

  const handleSave = () => {
    const bonus = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: employees.find(e => e.id === selectedEmployee)?.name || '',
      type: bonusType,
      amount: parseFloat(amount),
      description,
      month,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Novo bônus criado
    
    if (onSaveBonus) {
      onSaveBonus(bonus);
    }
    
    // Reset form
    setSelectedEmployee('');
    setBonusType('');
    setAmount('');
    setDescription('');
    setMonth('');
    
    onOpenChange(false);
  };

  const selectedEmployeeData = employees.find(e => e.id === selectedEmployee);

  if (!canManagePayroll) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Você não tem permissão para gerenciar bônus e folha de pagamento.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            Novo Bônus
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Employee Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Colaborador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Selecionar Colaborador</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{employee.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {employee.position}
                                </Badge>
                                {employee.units && employee.units.length > 0 && (
                                  <Badge className="text-xs bg-blue-100 text-blue-800">
                                    {getUnitDisplayName(employee.units[0])}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEmployeeData && (
                  <Card className="bg-blue-50 border border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">{selectedEmployeeData.name}</p>
                          <p className="text-sm text-blue-700">
                            {selectedEmployeeData.position} • {selectedEmployeeData.department}
                          </p>
                          {selectedEmployeeData.units && selectedEmployeeData.units.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {selectedEmployeeData.units.map(unit => (
                                <Badge key={unit} variant="secondary" className="text-xs">
                                  <MapPin className="w-2 h-2 mr-1" />
                                  {getUnitDisplayName(unit)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <User className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Bonus Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes do Bônus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tipo de Bônus</Label>
                    <Select value={bonusType} onValueChange={setBonusType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Bônus de Performance</SelectItem>
                        <SelectItem value="meta">Bônus por Meta</SelectItem>
                        <SelectItem value="recognition">Bônus de Reconhecimento</SelectItem>
                        <SelectItem value="retention">Bônus de Retenção</SelectItem>
                        <SelectItem value="special">Bônus Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Mês de Referência</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="janeiro">Janeiro 2024</SelectItem>
                      <SelectItem value="fevereiro">Fevereiro 2024</SelectItem>
                      <SelectItem value="marco">Março 2024</SelectItem>
                      <SelectItem value="abril">Abril 2024</SelectItem>
                      <SelectItem value="maio">Maio 2024</SelectItem>
                      <SelectItem value="junho">Junho 2024</SelectItem>
                      <SelectItem value="julho">Julho 2024</SelectItem>
                      <SelectItem value="agosto">Agosto 2024</SelectItem>
                      <SelectItem value="setembro">Setembro 2024</SelectItem>
                      <SelectItem value="outubro">Outubro 2024</SelectItem>
                      <SelectItem value="novembro">Novembro 2024</SelectItem>
                      <SelectItem value="dezembro">Dezembro 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Descrição/Justificativa</Label>
                  <Textarea
                    placeholder="Descreva o motivo do bônus..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            {selectedEmployee && bonusType && amount && (
              <Card className="bg-green-50 border border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900">Resumo do Bônus</h4>
                      <p className="text-sm text-green-700">
                        {selectedEmployeeData?.name} • {bonusType}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {parseFloat(amount || '0').toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600">
                        {month}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!selectedEmployee || !bonusType || !amount || !month}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Criar Bônus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
