import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Search, Calendar, DollarSign, User } from 'lucide-react';
import { useBenefits } from '@/contexts/BenefitsContext';
import { useEmployees } from '@/hooks/useEmployees';
import { EmployeeBenefit } from '@/types/benefits';
import { Employee } from '@/types/employee';

interface EmployeeBenefitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmployeeWithBenefits extends Employee {
  benefits: EmployeeBenefit[];
  totalBenefitsCost: number;
}

export const EmployeeBenefitsModal: React.FC<EmployeeBenefitsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { employeeBenefits, benefits } = useBenefits();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [employeesWithBenefits, setEmployeesWithBenefits] = useState<EmployeeWithBenefits[]>([]);

  useEffect(() => {
    if (employees.length > 0 && employeeBenefits.length > 0) {
      const employeesData = employees.map(employee => {
        const employeeBenefitsList = employeeBenefits.filter(
          eb => eb.employeeId === employee.id
        );
        
        const totalCost = employeeBenefitsList.reduce((sum, eb) => {
          const benefit = benefits.find(b => b.id === eb.benefitId);
          return sum + (benefit?.value || 0);
        }, 0);

        return {
          ...employee,
          benefits: employeeBenefitsList,
          totalBenefitsCost: totalCost
        };
      });
      
      setEmployeesWithBenefits(employeesData);
    }
  }, [employees, employeeBenefits, benefits]);

  const filteredEmployees = employeesWithBenefits.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.benefits.some(eb => eb.benefitName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getBenefitStatusColor = (benefit: EmployeeBenefit) => {
    if (!benefit.nextRenewalDate) return 'bg-green-100 text-green-800';
    
    const renewalDate = new Date(benefit.nextRenewalDate);
    const today = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal < 0) return 'bg-red-100 text-red-800';
    if (daysUntilRenewal <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getBenefitStatusText = (benefit: EmployeeBenefit) => {
    if (!benefit.nextRenewalDate) return 'Ativo';
    
    const renewalDate = new Date(benefit.nextRenewalDate);
    const today = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal < 0) return 'Vencido';
    if (daysUntilRenewal <= 30) return `Vence em ${daysUntilRenewal} dias`;
    return 'Ativo';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Funcionários e Benefícios
          </DialogTitle>
          <DialogDescription>
            Visualize quais funcionários estão inscritos em quais benefícios e seus status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por funcionário, cargo ou benefício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Funcionários</p>
                    <p className="text-2xl font-bold text-blue-600">{employeesWithBenefits.length}</p>
                  </div>
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Com Benefícios</p>
                    <p className="text-2xl font-bold text-green-600">
                      {employeesWithBenefits.filter(emp => emp.benefits.length > 0).length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Custo Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(employeesWithBenefits.reduce((sum, emp) => sum + emp.totalBenefitsCost, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employees List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum funcionário encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{employee.name}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {employee.position} • {employee.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Custo Total</p>
                          <p className="text-lg font-bold text-purple-600">
                            {formatCurrency(employee.totalBenefitsCost)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {employee.benefits.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">Nenhum benefício ativo</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {employee.benefits.map((benefit) => {
                            const benefitDetails = benefits.find(b => b.id === benefit.benefitId);
                            return (
                              <div
                                key={benefit.id}
                                className="border rounded-lg p-3 bg-gray-50"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-sm">{benefit.benefitName}</h4>
                                  <Badge className={getBenefitStatusColor(benefit)}>
                                    {getBenefitStatusText(benefit)}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span>{formatCurrency(benefitDetails?.value || 0)}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>Desde {formatDate(benefit.enrollmentDate)}</span>
                                  </div>
                                  
                                  {benefit.nextRenewalDate && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>Renovação: {formatDate(benefit.nextRenewalDate)}</span>
                                    </div>
                                  )}
                                  
                                  {benefit.dependents && benefit.dependents.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <span>{benefit.dependents.length} dependente(s)</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};