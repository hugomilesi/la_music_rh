import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Users, Lock } from 'lucide-react';
import { useBenefits } from '@/contexts/BenefitsContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Benefit, Dependent } from '@/types/benefits';

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit: Benefit;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  open,
  onOpenChange,
  benefit
}) => {
  const { enrollEmployee } = useBenefits();
  const { employees } = useEmployees();
  const { checkPermission } = usePermissions();
  const canManageEmployees = checkPermission('canManageEmployees', false);
  const [employeeId, setEmployeeId] = useState('');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [newDependent, setNewDependent] = useState({
    name: '',
    relationship: '',
    birthDate: '',
    documentNumber: ''
  });

  const addDependent = () => {
    if (newDependent.name && newDependent.relationship && newDependent.birthDate) {
      const dependent: Dependent = {
        id: Date.now().toString(),
        name: newDependent.name,
        relationship: newDependent.relationship as 'spouse' | 'child' | 'parent' | 'other',
        birthDate: newDependent.birthDate,
        documentNumber: newDependent.documentNumber,
        isActive: true
      };
      setDependents([...dependents, dependent]);
      setNewDependent({
        name: '',
        relationship: '',
        birthDate: '',
        documentNumber: ''
      });
    }
  };

  const removeDependent = (id: string) => {
    setDependents(dependents.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId) {
      alert('Por favor, selecione um funcionário');
      return;
    }



    enrollEmployee(employeeId, benefit.id, dependents);
    
    // Reset form
    setEmployeeId('');
    setDependents([]);
    onOpenChange(false);
  };

  if (!canManageEmployees) {
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
              Você não tem permissão para inscrever funcionários em benefícios. Esta ação é restrita a administradores.
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Inscrever Funcionário - {benefit.name}
          </DialogTitle>
          <DialogDescription>
            Selecione um funcionário e adicione dependentes para inscrever no benefício {benefit.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Benefício */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Benefício</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Valor:</span>
                  <span className="ml-2 font-medium">R$ {benefit.value.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fornecedor:</span>
                  <span className="ml-2 font-medium">{benefit.provider}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Funcionário */}
          <div className="space-y-2">
            <Label htmlFor="employee">Funcionário *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dependentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Dependentes
                <span className="text-sm text-gray-600">
                  {dependents.length} dependente(s) adicionado(s)
                </span>
              </CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de Dependentes */}
                {dependents.map((dependent) => (
                  <div key={dependent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{dependent.name}</p>
                      <p className="text-sm text-gray-600">
                        {dependent.relationship} - {new Date(dependent.birthDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDependent(dependent.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Adicionar Novo Dependente */}
                <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Adicionar Dependente</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Nome do dependente"
                        value={newDependent.name}
                        onChange={(e) => setNewDependent({ ...newDependent, name: e.target.value })}
                      />
                      <Select
                        value={newDependent.relationship}
                        onValueChange={(value) => setNewDependent({ ...newDependent, relationship: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Parentesco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Cônjuge</SelectItem>
                          <SelectItem value="child">Filho(a)</SelectItem>
                          <SelectItem value="parent">Pai/Mãe</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        placeholder="Data de nascimento"
                        value={newDependent.birthDate}
                        onChange={(e) => setNewDependent({ ...newDependent, birthDate: e.target.value })}
                      />
                      <Input
                        placeholder="CPF (opcional)"
                        value={newDependent.documentNumber}
                        onChange={(e) => setNewDependent({ ...newDependent, documentNumber: e.target.value })}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addDependent}
                      className="mt-3"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Dependente
                    </Button>
                </div>
              </CardContent>
            </Card>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Inscrever no Benefício
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
