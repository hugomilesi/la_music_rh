import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Building2,
  CreditCard,
  User,
  DollarSign,
  Calculator
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  classification: string;
  salary: number;
  transport: number;
  bonus: number;
  commission: number;
  reimbursement: number;
  thirteenth: number;
  store: number;
  bistro: number;
  advance: number;
  discount: number;
  bank: string;
  agency: string;
  account: string;
  cpf: string;
  pix: string;
  inss: number;
  total: number;
  unit: string;
}

interface ResponsivePayrollTableProps {
  employees: Employee[];
  onEmployeeUpdate?: (employee: Employee) => void;
  onEmployeeDelete?: (id: string) => void;
  onEditEmployee?: (employee: Employee) => void;
  showPrivateData?: boolean;
}

export function ResponsivePayrollTable({ 
  employees, 
  onEmployeeUpdate, 
  onEmployeeDelete, 
  onEditEmployee,
  showPrivateData = false
}: ResponsivePayrollTableProps) {
  // Verificação de segurança para employees
  const safeEmployees = employees || [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const handleEdit = (employee: Employee) => {
    if (onEditEmployee) {
      onEditEmployee(employee);
    } else {
      setEditingId(employee.id);
      setEditingEmployee({ ...employee });
    }
  };

  const handleSave = () => {
    if (editingEmployee) {
      // Recalcular INSS e total
      const updatedEmployee = {
        ...editingEmployee,
        inss: calculateINSS(editingEmployee.salary),
        total: calculateTotal(editingEmployee)
      };
      onEmployeeUpdate(updatedEmployee);
      setEditingId(null);
      setEditingEmployee(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingEmployee(null);
  };

  const calculateINSS = (salary: number): number => {
    if (salary <= 1412) return salary * 0.075;
    if (salary <= 2666.68) return salary * 0.09;
    if (salary <= 4000.03) return salary * 0.12;
    return salary * 0.14;
  };

  const calculateTotal = (employee: Employee): number => {
    return (employee.salary || 0) + 
           (employee.transport || 0) + 
           (employee.bonus || 0) + 
           (employee.commission || 0) + 
           (employee.reimbursement || 0) + 
           (employee.thirteenth || 0) + 
           (employee.store || 0) + 
           (employee.bistro || 0) - 
           (employee.advance || 0) - 
           (employee.discount || 0);
  };

  const formatCurrency = (value: number | undefined | null) => {
    // Verificação mais robusta para evitar erros
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    try {
      return safeValue.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2 
      });
    } catch (error) {
      console.warn('Error formatting currency:', error, 'value:', value);
      return 'R$ 0,00';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'CLT': return 'bg-green-100 text-green-800';
      case 'PJ': return 'bg-blue-100 text-blue-800';
      case 'Horista': return 'bg-yellow-100 text-yellow-800';
      case 'Estagiario': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnitColor = (unit: string) => {
    switch (unit) {
      case 'recreio': return 'bg-green-500';
      case 'campo-grande': return 'bg-yellow-500';
      case 'barra': return 'bg-orange-500';
      case 'rateados': return 'bg-purple-500';
      case 'professores': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  // Mobile Card View
  const MobileCard = ({ employee }: { employee: Employee }) => (
    <Card className="glass-subtle shadow-hr-soft hover-lift transition-all duration-300 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getUnitColor(employee.unit)}`}></div>
            <div>
              <CardTitle className="text-lg">{employee.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getClassificationColor(employee.classification)}>
                  {employee.classification}
                </Badge>
                <span className="text-sm text-gray-500">{employee.unit}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(employee)}
              className="p-2"
            >
              <Edit className="w-4 h-4" />
            </Button>
            {onEmployeeDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEmployeeDelete(employee.id)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Valores Principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Salário Base</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(employee.salary || 0)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(employee.total || 0)}
            </p>
          </div>
        </div>

        {/* Benefícios e Descontos */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-2">Benefícios</p>
            <div className="space-y-1">
              {(employee.transport || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Transporte:</span>
                  <span className="text-green-600">{formatCurrency(employee.transport || 0)}</span>
                </div>
              )}
              {(employee.bonus || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Bônus:</span>
                  <span className="text-green-600">{formatCurrency(employee.bonus || 0)}</span>
                </div>
              )}
              {(employee.commission || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Comissão:</span>
                  <span className="text-green-600">{formatCurrency(employee.commission || 0)}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-2">Descontos</p>
            <div className="space-y-1">
              {(employee.inss || 0) > 0 && (
                <div className="flex justify-between">
                  <span>INSS:</span>
                  <span className="text-red-600">{formatCurrency(employee.inss || 0)}</span>
                </div>
              )}
              {(employee.advance || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Adiantamento:</span>
                  <span className="text-red-600">{formatCurrency(employee.advance || 0)}</span>
                </div>
              )}
              {(employee.discount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Outros:</span>
                  <span className="text-red-600">{formatCurrency(employee.discount || 0)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dados Bancários (se visível) */}
        {showSensitiveData && showPrivateData && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Dados Bancários</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Banco:</span>
                <span>{employee.bank}</span>
              </div>
              <div className="flex justify-between">
                <span>Agência:</span>
                <span>{employee.agency}</span>
              </div>
              <div className="flex justify-between">
                <span>Conta:</span>
                <span>{employee.account}</span>
              </div>
              <div className="flex justify-between">
                <span>PIX:</span>
                <span>{employee.pix}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Exibindo {employees.length} funcionários</span>
        </div>
        {showPrivateData && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center gap-2"
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSensitiveData ? 'Ocultar' : 'Mostrar'} Dados Bancários
          </Button>
        )}
      </div>

      {/* Mobile View (< md) */}
      <div className="block md:hidden">
        {safeEmployees.map(employee => (
          <MobileCard key={employee.id} employee={employee} />
        ))}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block">
        <div className="glass-subtle rounded-lg border border-white/20 overflow-hidden">
          <div>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gradient-hr-primary/10">
                  <TableHead className="min-w-[200px] font-semibold">Nome</TableHead>
                  <TableHead className="min-w-[120px] font-semibold">Função</TableHead>
                  <TableHead className="min-w-[120px] font-semibold">Classificação</TableHead>
                  <TableHead className="min-w-[120px] font-semibold text-right">Salário</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">Vale Transporte</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">Bônus</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">Comissão</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">Reembolso</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">13º/Férias</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">INSS</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">Lojinha</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">Bistrô</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">Adiantamento</TableHead>
                  <TableHead className="min-w-[100px] font-semibold text-right">Desconto</TableHead>
                  <TableHead className="min-w-[120px] font-semibold text-right">Total</TableHead>
                  {showSensitiveData && showPrivateData && (
                    <>
                      <TableHead className="min-w-[150px] font-semibold">Banco</TableHead>
                      <TableHead className="min-w-[100px] font-semibold">Agência</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">Conta</TableHead>
                      <TableHead className="min-w-[120px] font-semibold">CPF</TableHead>
                      <TableHead className="min-w-[150px] font-semibold">PIX</TableHead>
                    </>
                  )}
                  <TableHead className="min-w-[100px] font-semibold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeEmployees.map(employee => (
                  <TableRow key={employee.id} className="hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getUnitColor(employee.unit)}`}></div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{employee.unit}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{employee.role || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getClassificationColor(employee.classification)}>
                        {employee.classification}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {editingId === employee.id ? (
                        <Input
                          type="number"
                          value={editingEmployee?.salary || 0}
                          onChange={(e) => setEditingEmployee(prev => prev ? {
                            ...prev,
                            salary: parseFloat(e.target.value) || 0
                          } : null)}
                          className="w-24 text-right"
                        />
                      ) : (
                        formatCurrency(employee.salary || 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === employee.id ? (
                        <Input
                          type="number"
                          value={editingEmployee?.transport || 0}
                          onChange={(e) => setEditingEmployee(prev => prev ? {
                            ...prev,
                            transport: parseFloat(e.target.value) || 0
                          } : null)}
                          className="w-20 text-right"
                        />
                      ) : (
                        formatCurrency(employee.transport || 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === employee.id ? (
                        <Input
                          type="number"
                          value={editingEmployee?.bonus || 0}
                          onChange={(e) => setEditingEmployee(prev => prev ? {
                            ...prev,
                            bonus: parseFloat(e.target.value) || 0
                          } : null)}
                          className="w-20 text-right"
                        />
                      ) : (
                        formatCurrency(employee.bonus || 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === employee.id ? (
                        <Input
                          type="number"
                          value={editingEmployee?.commission || 0}
                          onChange={(e) => setEditingEmployee(prev => prev ? {
                            ...prev,
                            commission: parseFloat(e.target.value) || 0
                          } : null)}
                          className="w-20 text-right"
                        />
                      ) : (
                        formatCurrency(employee.commission || 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.reimbursement || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.thirteenth || 0)}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      {formatCurrency(employee.inss || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.store || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.bistro || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.advance || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.discount || 0)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      {formatCurrency(employee.total || 0)}
                    </TableCell>
                    {showSensitiveData && showPrivateData && (
                      <>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="truncate max-w-[120px] block">{employee.bank}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{employee.bank}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{employee.agency}</TableCell>
                        <TableCell>{employee.account}</TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="truncate max-w-[120px] block">{employee.cpf}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{employee.cpf}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="truncate max-w-[120px] block">{employee.pix}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{employee.pix}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {editingId === employee.id ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSave}
                              className="p-2 text-green-600 hover:text-green-700"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(employee)}
                              className="p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {onEmployeeDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEmployeeDelete(employee.id)}
                                className="p-2 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum funcionário encontrado</p>
        </div>
      )}
    </div>
  );
}