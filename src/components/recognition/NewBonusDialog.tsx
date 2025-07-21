
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Gift, DollarSign, Star } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';

interface NewBonusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBonus?: (bonus: any) => void;
}

export const NewBonusDialog: React.FC<NewBonusDialogProps> = ({
  open,
  onOpenChange,
  onCreateBonus
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [bonusType, setBonusType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [program, setProgram] = useState('');

  const { employees } = useEmployees();

  const bonusTypes = [
    { value: 'performance', label: 'Bônus por Performance', icon: Star },
    { value: 'sales', label: 'Comissão de Vendas', icon: DollarSign },
    { value: 'special', label: 'Bonificação Especial', icon: Gift }
  ];

  const programs = [
    { value: 'fideliza', label: 'Fideliza+' },
    { value: 'matriculador', label: 'Matriculador+ LA' },
    { value: 'professor', label: 'Professor+ LA' }
  ];

  const handleCreateBonus = () => {
    const bonus = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: employees.find(e => e.id === selectedEmployee)?.name || '',
      type: bonusType,
      amount: parseFloat(amount),
      description,
      program,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    console.log('Nova bonificação criada:', bonus);
    
    if (onCreateBonus) {
      onCreateBonus(bonus);
    }
    
    // Reset form
    setSelectedEmployee('');
    setBonusType('');
    setAmount('');
    setDescription('');
    setProgram('');
    
    onOpenChange(false);
  };

  const selectedBonusType = bonusTypes.find(type => type.value === bonusType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Bonificação
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
                      {employees && employees.length > 0 ? (
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{employee.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {employee.units?.[0] || 'Sem unidade'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-employees" disabled>
                          Nenhum colaborador disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bonus Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipo de Bonificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <Select value={bonusType} onValueChange={setBonusType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo de bonificação" />
                    </SelectTrigger>
                    <SelectContent>
                      {bonusTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBonusType && (
                  <Card className="bg-blue-50 border border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <selectedBonusType.icon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {selectedBonusType.label}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Program Association */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Programa de Reconhecimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Programa (Opcional)</Label>
                  <Select value={program} onValueChange={setProgram}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Associar a um programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((prog) => (
                        <SelectItem key={prog.value} value={prog.value}>
                          {prog.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Amount and Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes da Bonificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Valor (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <Textarea
                    placeholder="Descreva o motivo da bonificação..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateBonus}
            disabled={!selectedEmployee || !bonusType || !amount || !description}
          >
            Criar Bonificação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
