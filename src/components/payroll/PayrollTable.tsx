import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Save, X, Plus, Check } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { payrollService } from '@/services/payrollService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PayrollEmployee {
  id: string;
  name: string;
  role: string;
  classification: 'CLT' | 'PJ' | 'Horista' | 'Estagiario';
  salary: number;
  transport: number;
  bonus: number;
  commission: number;
  reimbursement: number;
  thirteenth_vacation: number;
  inss: number;
  store: number;
  bistro: number;
  advance: number;
  discount: number;
  total: number;
  bank: string;
  agency: string;
  account: string;
  cpf: string;
  pix: string;
  unit?: string;
}

interface PayrollTableProps {
  employees: PayrollEmployee[];
  selectedUnit: string;
  onEmployeeUpdate: (id: string, updates: Partial<PayrollEmployee>) => void;
  onEmployeeAdd?: (employee: PayrollEmployee) => void;
  defaultMonth?: string;
  defaultYear?: string;
}

export function PayrollTable({ employees, selectedUnit, onEmployeeUpdate, onEmployeeAdd, defaultMonth, defaultYear }: PayrollTableProps) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PayrollEmployee>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmployeeData, setNewEmployeeData] = useState<Partial<PayrollEmployee>>({});
  const [isLoading, setIsLoading] = useState(false);

  const calculateINSS = (salary: number, classification: string): number => {
    if (classification === 'PJ') {
      return salary * 0.11; // 11% for PJ
    }
    
    // CLT INSS calculation (2024 rates)
    if (salary <= 1412.00) {
      return salary * 0.075;
    } else if (salary <= 2666.68) {
      return salary * 0.09;
    } else if (salary <= 4000.03) {
      return salary * 0.12;
    } else if (salary <= 7786.02) {
      return salary * 0.14;
    } else {
      return 7786.02 * 0.14; // Maximum INSS
    }
  };

  const calculateTotal = (employee: Partial<PayrollEmployee>): number => {
    const salary = employee.salary || 0;
    const transport = employee.transport || 0;
    const bonus = employee.bonus || 0;
    const commission = employee.commission || 0;
    const reimbursement = employee.reimbursement || 0;
    const thirteenth_vacation = employee.thirteenth_vacation || 0;
    const store = employee.store || 0;
    const bistro = employee.bistro || 0;
    const advance = employee.advance || 0;
    const discount = employee.discount || 0;
    const inss = employee.inss || 0;

    return salary + transport + bonus + commission + reimbursement + thirteenth_vacation - inss - store - bistro - advance - discount;
  };

  const handleEdit = (employee: PayrollEmployee) => {
    setEditingId(employee.id);
    setEditData(employee);
  };

  const handleSave = () => {
    if (editingId && editData) {
      // Recalculate INSS and total
      const updatedData = {
        ...editData,
        inss: calculateINSS(editData.salary || 0, editData.classification || 'CLT'),
      };
      updatedData.total = calculateTotal(updatedData);
      
      onEmployeeUpdate(editingId, updatedData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleInputChange = (field: keyof PayrollEmployee, value: any) => {
    const updatedData = { ...editData, [field]: value };
    
    // Auto-calculate INSS when salary or classification changes
    if (field === 'salary' || field === 'classification') {
      updatedData.inss = calculateINSS(
        field === 'salary' ? value : updatedData.salary || 0,
        field === 'classification' ? value : updatedData.classification || 'CLT'
      );
    }
    
    setEditData(updatedData);
  };

  const handleCellEdit = (employee: PayrollEmployee, field: keyof PayrollEmployee, value: any) => {
    const updatedData = { ...employee, [field]: value };
    
    // Auto-calculate INSS when salary or classification changes
    if (field === 'salary' || field === 'classification') {
      updatedData.inss = calculateINSS(
        field === 'salary' ? value : employee.salary,
        field === 'classification' ? value : employee.classification
      );
    }
    
    updatedData.total = calculateTotal(updatedData);
    onEmployeeUpdate(employee.id, updatedData);
  };

  const handleNewEmployeeChange = (field: keyof PayrollEmployee, value: any) => {
    const updatedData = { ...newEmployeeData, [field]: value };
    
    // Auto-calculate INSS when salary or classification changes
    if (field === 'salary' || field === 'classification') {
      updatedData.inss = calculateINSS(
        field === 'salary' ? value : updatedData.salary || 0,
        field === 'classification' ? value : updatedData.classification || 'CLT'
      );
    }
    
    updatedData.total = calculateTotal(updatedData);
    setNewEmployeeData(updatedData);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewEmployeeData({
      name: '',
      role: '',
      classification: 'CLT',
      salary: 0,
      transport: 0,
      bonus: 0,
      commission: 0,
      reimbursement: 0,
      thirteenth_vacation: 0,
      inss: 0,
      store: 0,
      bistro: 0,
      advance: 0,
      discount: 0,
      total: 0,
      bank: '',
      agency: '',
      account: '',
      cpf: '',
      pix: '',
      unit: selectedUnit
    });
  };

  const handleSaveNew = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!newEmployeeData.name || !newEmployeeData.cpf) {
      toast.error('Nome e CPF são obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const month = defaultMonth ? parseInt(defaultMonth) : new Date().getMonth() + 1;
      const year = defaultYear ? parseInt(defaultYear) : new Date().getFullYear();

      // Create payroll entry
      const payrollEntry = await payrollService.createPayrollEntry({
        colaborador_id: user.id, // This should be the actual employee ID
        mes: month,
        ano: year,
        classificacao: newEmployeeData.classification || 'CLT',
        funcao: newEmployeeData.role || '',
        salario_base: newEmployeeData.salary || 0,
        bonus: newEmployeeData.bonus || 0,
        comissao: newEmployeeData.commission || 0,
        passagem: newEmployeeData.transport || 0,
        reembolso: newEmployeeData.reimbursement || 0,
        inss: newEmployeeData.inss || 0,
        lojinha: newEmployeeData.store || 0,
        bistro: newEmployeeData.bistro || 0,
        adiantamento: newEmployeeData.advance || 0,
        outros_descontos: newEmployeeData.discount || 0
      });

      // Create the employee object for the table
      const newEmployee: PayrollEmployee = {
        id: payrollEntry.id,
        name: newEmployeeData.name || '',
        role: newEmployeeData.role || '',
        classification: newEmployeeData.classification as 'CLT' | 'PJ' | 'Horista' | 'Estagiario',
        salary: newEmployeeData.salary || 0,
        transport: newEmployeeData.transport || 0,
        bonus: newEmployeeData.bonus || 0,
        commission: newEmployeeData.commission || 0,
        reimbursement: newEmployeeData.reimbursement || 0,
        thirteenth_vacation: newEmployeeData.thirteenth_vacation || 0,
        inss: newEmployeeData.inss || 0,
        store: newEmployeeData.store || 0,
        bistro: newEmployeeData.bistro || 0,
        advance: newEmployeeData.advance || 0,
        discount: newEmployeeData.discount || 0,
        total: newEmployeeData.total || 0,
        bank: newEmployeeData.bank || '',
        agency: newEmployeeData.agency || '',
        account: newEmployeeData.account || '',
        cpf: newEmployeeData.cpf || '',
        pix: newEmployeeData.pix || '',
        unit: selectedUnit
      };

      if (onEmployeeAdd) {
        onEmployeeAdd(newEmployee);
      }

      toast.success('Funcionário adicionado com sucesso!');
      setIsAddingNew(false);
      setNewEmployeeData({});
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      toast.error('Erro ao adicionar funcionário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewEmployeeData({});
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum funcionário encontrado para esta unidade</p>
      </div>
    );
  }

  return (
    <div>
        <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="font-semibold min-w-[150px]">Nome</TableHead>
            <TableHead className="font-semibold min-w-[120px]">Cargo</TableHead>
            <TableHead className="font-semibold min-w-[100px]">Classificação</TableHead>
            <TableHead className="font-semibold min-w-[100px] text-right">Salário</TableHead>
            <TableHead className="font-semibold min-w-[100px] text-right">V. Transporte</TableHead>
            <TableHead className="font-semibold min-w-[80px] text-right">Bônus</TableHead>
            <TableHead className="font-semibold min-w-[80px] text-right">Comissão</TableHead>
            <TableHead className="font-semibold min-w-[90px] text-right">Reembolso</TableHead>
            <TableHead className="font-semibold min-w-[90px] text-right">13º/Férias</TableHead>
            <TableHead className="font-semibold text-red-600 min-w-[80px] text-right">INSS</TableHead>
            <TableHead className="font-semibold text-red-600 min-w-[80px] text-right">Loja</TableHead>
            <TableHead className="font-semibold text-red-600 min-w-[80px] text-right">Bistrô</TableHead>
            <TableHead className="font-semibold text-red-600 min-w-[100px] text-right">Adiantamento</TableHead>
            <TableHead className="font-semibold text-red-600 min-w-[80px] text-right">Desconto</TableHead>
            <TableHead className="font-semibold text-green-600 min-w-[100px] text-right">Total</TableHead>
            <TableHead className="font-semibold min-w-[100px]">Banco</TableHead>
            <TableHead className="font-semibold min-w-[80px]">Agência</TableHead>
            <TableHead className="font-semibold min-w-[100px]">Conta</TableHead>
            <TableHead className="font-semibold min-w-[120px]">CPF</TableHead>
            <TableHead className="font-semibold min-w-[120px]">PIX</TableHead>
            <TableHead className="font-semibold min-w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const isEditing = editingId === employee.id;
            const currentData = isEditing ? editData : employee;

            return (
              <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-medium w-[180px] min-w-[180px]">
                  <Input
                    value={currentData.name || ''}
                    onChange={(e) => handleCellEdit(employee, 'name', e.target.value)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[140px] min-w-[140px]">
                  <Input
                    value={currentData.role || ''}
                    onChange={(e) => handleCellEdit(employee, 'role', e.target.value)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Select
                    value={currentData.classification || ''}
                    onValueChange={(value) => handleCellEdit(employee, 'classification', value)}
                  >
                    <SelectTrigger className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="Horista">Horista</SelectItem>
                      <SelectItem value="Estagiario">Estagiário</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.salary || 0}
                    onChange={(e) => handleCellEdit(employee, 'salary', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.transport || 0}
                    onChange={(e) => handleCellEdit(employee, 'transport', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.bonus || 0}
                    onChange={(e) => handleCellEdit(employee, 'bonus', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.commission || 0}
                    onChange={(e) => handleCellEdit(employee, 'commission', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.reimbursement || 0}
                    onChange={(e) => handleCellEdit(employee, 'reimbursement', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[110px] min-w-[110px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.thirteenth_vacation || 0}
                    onChange={(e) => handleCellEdit(employee, 'thirteenth_vacation', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="text-red-600 font-medium w-[100px] min-w-[100px] text-right">
                  {formatCurrency(currentData.inss || 0)}
                </TableCell>
                
                <TableCell className="w-[100px] min-w-[100px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.store || 0}
                    onChange={(e) => handleCellEdit(employee, 'store', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[100px] min-w-[100px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.bistro || 0}
                    onChange={(e) => handleCellEdit(employee, 'bistro', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.advance || 0}
                    onChange={(e) => handleCellEdit(employee, 'advance', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[100px] min-w-[100px]">
                  <Input
                    type="number"
                    step="0.01"
                    value={currentData.discount || 0}
                    onChange={(e) => handleCellEdit(employee, 'discount', parseFloat(e.target.value) || 0)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                  />
                </TableCell>
                
                <TableCell className="font-bold text-green-600 w-[120px] min-w-[120px] text-right">
                  {formatCurrency(currentData.total || 0)}
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Input
                    value={currentData.bank || ''}
                    onChange={(e) => handleCellEdit(employee, 'bank', e.target.value)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[100px] min-w-[100px]">
                  <Input
                    value={currentData.agency || ''}
                    onChange={(e) => handleCellEdit(employee, 'agency', e.target.value)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[120px] min-w-[120px]">
                  <Input
                    value={currentData.account || ''}
                    onChange={(e) => handleCellEdit(employee, 'account', e.target.value)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[140px] min-w-[140px]">
                  <Input
                    value={currentData.cpf || ''}
                    onChange={(e) => handleCellEdit(employee, 'cpf', e.target.value)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                  />
                </TableCell>
                
                <TableCell className="w-[140px] min-w-[140px]">
                  <Input
                    value={currentData.pix || ''}
                    onChange={(e) => handleCellEdit(employee, 'pix', e.target.value)}
                    className="border border-gray-200 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          
          {/* Add New Employee Row */}
          {isAddingNew ? (
            <TableRow className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
              <TableCell className="w-[180px] min-w-[180px]">
                <Input
                  placeholder="Nome do funcionário"
                  value={newEmployeeData.name || ''}
                  onChange={(e) => handleNewEmployeeChange('name', e.target.value)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[140px] min-w-[140px]">
                <Input
                  placeholder="Cargo"
                  value={newEmployeeData.role || ''}
                  onChange={(e) => handleNewEmployeeChange('role', e.target.value)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Select
                  value={newEmployeeData.classification || 'CLT'}
                  onValueChange={(value) => handleNewEmployeeChange('classification', value)}
                >
                  <SelectTrigger className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Horista">Horista</SelectItem>
                    <SelectItem value="Estagiario">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.salary || 0}
                  onChange={(e) => handleNewEmployeeChange('salary', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.transport || 0}
                  onChange={(e) => handleNewEmployeeChange('transport', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.bonus || 0}
                  onChange={(e) => handleNewEmployeeChange('bonus', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.commission || 0}
                  onChange={(e) => handleNewEmployeeChange('commission', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.reimbursement || 0}
                  onChange={(e) => handleNewEmployeeChange('reimbursement', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[110px] min-w-[110px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.thirteenth_vacation || 0}
                  onChange={(e) => handleNewEmployeeChange('thirteenth_vacation', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="text-red-600 font-medium w-[100px] min-w-[100px] text-right">
                {formatCurrency(newEmployeeData.inss || 0)}
              </TableCell>
              
              <TableCell className="w-[100px] min-w-[100px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.store || 0}
                  onChange={(e) => handleNewEmployeeChange('store', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[100px] min-w-[100px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.bistro || 0}
                  onChange={(e) => handleNewEmployeeChange('bistro', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.advance || 0}
                  onChange={(e) => handleNewEmployeeChange('advance', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[100px] min-w-[100px]">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newEmployeeData.discount || 0}
                  onChange={(e) => handleNewEmployeeChange('discount', parseFloat(e.target.value) || 0)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-right text-sm"
                />
              </TableCell>
              
              <TableCell className="font-bold text-green-600 w-[120px] min-w-[120px] text-right">
                {formatCurrency(newEmployeeData.total || 0)}
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Input
                  placeholder="Banco"
                  value={newEmployeeData.bank || ''}
                  onChange={(e) => handleNewEmployeeChange('bank', e.target.value)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[100px] min-w-[100px]">
                <Input
                  placeholder="Agência"
                  value={newEmployeeData.agency || ''}
                  onChange={(e) => handleNewEmployeeChange('agency', e.target.value)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[120px] min-w-[120px]">
                <Input
                  placeholder="Conta"
                  value={newEmployeeData.account || ''}
                  onChange={(e) => handleNewEmployeeChange('account', e.target.value)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[140px] min-w-[140px]">
                <Input
                  placeholder="CPF"
                  value={newEmployeeData.cpf || ''}
                  onChange={(e) => handleNewEmployeeChange('cpf', e.target.value)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                />
              </TableCell>
              
              <TableCell className="w-[140px] min-w-[140px]">
                <Input
                  placeholder="PIX"
                  value={newEmployeeData.pix || ''}
                  onChange={(e) => handleNewEmployeeChange('pix', e.target.value)}
                  className="border border-blue-300 bg-white dark:bg-gray-800 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full text-sm"
                />
              </TableCell>
              
              <TableCell>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    onClick={handleSaveNew}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancelNew}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
              <TableCell colSpan={21} className="text-center py-4">
                <Button 
                  onClick={handleAddNew}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Novo Funcionário
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Summary Row */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold">Total Funcionários: </span>
            <span className="text-blue-600">{employees.length}</span>
          </div>
          <div>
            <span className="font-semibold">Total Salários: </span>
            <span className="text-green-600">
              {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0))}
            </span>
          </div>
          <div>
            <span className="font-semibold">Total INSS: </span>
            <span className="text-red-600">
              {formatCurrency(employees.reduce((sum, emp) => sum + emp.inss, 0))}
            </span>
          </div>
          <div>
            <span className="font-semibold">Total Geral: </span>
            <span className="text-green-600 font-bold">
              {formatCurrency(employees.reduce((sum, emp) => sum + emp.total, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}