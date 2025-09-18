import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/utils/formatters';
import { X, Maximize2, Settings, Edit, Trash2, FileText, Eye, Users, DollarSign, Gift, Minus, CreditCard } from 'lucide-react';

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
  notes?: string;
}

interface PayrollTableProps {
  employees: PayrollEmployee[];
  selectedUnit: string;
  onEdit?: (employee: PayrollEmployee) => void;
  onDelete?: (employeeId: string) => void;
}

interface ColumnConfig {
  key: keyof PayrollEmployee | 'actions';
  label: string;
  visible: boolean;
  type: 'text' | 'currency' | 'badge' | 'actions';
  className?: string;
  group: 'pessoais' | 'financeiro' | 'beneficios' | 'descontos' | 'bancarios' | 'acoes';
}

interface ColumnGroup {
  key: 'pessoais' | 'financeiro' | 'beneficios' | 'descontos' | 'bancarios' | 'acoes';
  label: string;
  icon: React.ReactNode;
  visible: boolean;
}

export function PayrollTable({ 
  employees, 
  selectedUnit, 
  onEdit, 
  onDelete 
}: PayrollTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollEmployee | null>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
  const [groupSelectorOpen, setGroupSelectorOpen] = useState(false);

  // Configuração dos grupos de colunas
  const [columnGroups, setColumnGroups] = useState<ColumnGroup[]>([
    { key: 'pessoais', label: 'Dados Pessoais', icon: <Users className="w-4 h-4" />, visible: true },
    { key: 'financeiro', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" />, visible: true },
    { key: 'beneficios', label: 'Benefícios', icon: <Gift className="w-4 h-4" />, visible: false },
    { key: 'descontos', label: 'Descontos', icon: <Minus className="w-4 h-4" />, visible: false },
    { key: 'bancarios', label: 'Dados Bancários', icon: <CreditCard className="w-4 h-4" />, visible: false },
    { key: 'acoes', label: 'Ações', icon: <Settings className="w-4 h-4" />, visible: true }
  ]);

  // Configuração das colunas com grupos
  const [columns, setColumns] = useState<ColumnConfig[]>([
    // Dados Pessoais
    { key: 'name', label: 'Nome', visible: true, type: 'text', group: 'pessoais' },
    { key: 'role', label: 'Cargo', visible: true, type: 'text', group: 'pessoais' },
    { key: 'classification', label: 'Classificação', visible: true, type: 'badge', group: 'pessoais' },
    { key: 'cpf', label: 'CPF', visible: false, type: 'text', group: 'pessoais' },
    
    // Financeiro
    { key: 'salary', label: 'Salário', visible: true, type: 'currency', className: 'text-right', group: 'financeiro' },
    { key: 'bonus', label: 'Bônus', visible: false, type: 'currency', className: 'text-right', group: 'financeiro' },
    { key: 'commission', label: 'Comissão', visible: false, type: 'currency', className: 'text-right', group: 'financeiro' },
    { key: 'total', label: 'Total', visible: true, type: 'currency', className: 'text-right font-bold text-blue-600', group: 'financeiro' },
    
    // Benefícios
    { key: 'transport', label: 'V. Transporte', visible: true, type: 'currency', className: 'text-right', group: 'beneficios' },
    { key: 'reimbursement', label: 'Reembolso', visible: false, type: 'currency', className: 'text-right', group: 'beneficios' },
    { key: 'thirteenth_vacation', label: '13º/Férias', visible: false, type: 'currency', className: 'text-right', group: 'beneficios' },
    
    // Descontos
    { key: 'inss', label: 'INSS', visible: false, type: 'currency', className: 'text-right text-gray-600', group: 'descontos' },
    { key: 'store', label: 'Loja', visible: false, type: 'currency', className: 'text-right text-gray-600', group: 'descontos' },
    { key: 'bistro', label: 'Bistrô', visible: false, type: 'currency', className: 'text-right text-gray-600', group: 'descontos' },
    { key: 'advance', label: 'Adiantamento', visible: false, type: 'currency', className: 'text-right text-gray-600', group: 'descontos' },
    { key: 'discount', label: 'Desconto', visible: false, type: 'currency', className: 'text-right text-gray-600', group: 'descontos' },
    
    // Dados Bancários
    { key: 'bank', label: 'Banco', visible: false, type: 'text', group: 'bancarios' },
    { key: 'agency', label: 'Agência', visible: false, type: 'text', group: 'bancarios' },
    { key: 'account', label: 'Conta', visible: false, type: 'text', group: 'bancarios' },
    { key: 'pix', label: 'PIX', visible: false, type: 'text', group: 'bancarios' },
    
    // Ações
    { key: 'actions', label: 'Ações', visible: true, type: 'actions', className: 'text-center', group: 'acoes' }
  ]);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const toggleGroupVisibility = (groupKey: string) => {
    setColumnGroups(prev => prev.map(group => 
      group.key === groupKey ? { ...group, visible: !group.visible } : group
    ));
    
    // Atualizar visibilidade das colunas do grupo
    setColumns(prev => prev.map(col => 
      col.group === groupKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const visibleColumns = columns.filter(col => {
    const group = columnGroups.find(g => g.key === col.group);
    return col.visible && group?.visible;
  });

  const handleViewNotes = (employee: PayrollEmployee) => {
    setSelectedEmployee(employee);
    setShowNotesDialog(true);
  };

  const renderCellContent = (employee: PayrollEmployee, column: ColumnConfig) => {
    if (column.key === 'actions') {
      return (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(employee)}
            className="h-8 w-8 p-0 hover:bg-blue-100"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedEmployee(employee);
              setShowNotesDialog(true);
            }}
            className="h-8 w-8 p-0 hover:bg-green-100"
          >
            <Eye className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(employee.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    const value = employee[column.key as keyof PayrollEmployee];
    
    switch (column.type) {
      case 'currency':
        return formatCurrency(Number(value) || 0);
      case 'badge':
        if (column.key === 'classification') {
          return (
            <Badge variant={value === 'CLT' ? 'default' : 'secondary'}>
              {String(value)}
            </Badge>
          );
        }
        return String(value);
      default:
        return String(value || '');
    }
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum funcionário encontrado para esta unidade</p>
      </div>
    );
  }

  return (
    <>
      {/* Normal Table View */}
      <div className={`w-full ${isExpanded ? 'hidden' : 'block'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Folha de Pagamento - {selectedUnit}</h3>
          <div className="flex items-center gap-2">
            {/* Group Selector */}
            <DropdownMenu open={groupSelectorOpen} onOpenChange={setGroupSelectorOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Grupos
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="flex items-center justify-between p-2">
                  <DropdownMenuLabel className="p-0">Selecionar Grupos de Colunas</DropdownMenuLabel>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGroupSelectorOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {columnGroups.map((group) => (
                  <div
                    key={group.key}
                    className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleGroupVisibility(group.key);
                    }}
                  >
                    <Checkbox
                      checked={group.visible}
                      onChange={() => toggleGroupVisibility(group.key)}
                      className="pointer-events-none"
                    />
                    <div className="flex items-center gap-2">
                      {group.icon}
                      <span className="text-sm">{group.label}</span>
                    </div>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column Selector */}
            <DropdownMenu open={columnSelectorOpen} onOpenChange={setColumnSelectorOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between p-2">
                  <DropdownMenuLabel className="p-0">Selecionar Colunas</DropdownMenuLabel>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setColumnSelectorOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {columnGroups.filter(group => group.visible).map((group) => (
                  <div key={group.key}>
                    <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500 uppercase tracking-wide font-medium">
                      {group.icon}
                      {group.label}
                    </div>
                    {columns
                      .filter(col => col.group === group.key && col.key !== 'actions')
                      .map((column) => (
                        <div
                          key={column.key}
                          className="flex items-center space-x-2 px-2 py-1.5 ml-6 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleColumnVisibility(column.key);
                          }}
                        >
                          <Checkbox
                            checked={column.visible}
                            onChange={() => toggleColumnVisibility(column.key)}
                            className="pointer-events-none"
                          />
                          <span className="text-sm">{column.label}</span>
                        </div>
                      ))}
                    <DropdownMenuSeparator />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <button
              onClick={toggleExpansion}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg rounded-lg transition-all duration-300 border-none"
            >
              <Maximize2 className="w-4 h-4" />
              Expandir Tabela
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                {visibleColumns.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className={`font-semibold ${column.className || ''}`}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={`${employee.id}-${column.key}`}
                      className={column.className || ''}
                    >
                      {renderCellContent(employee, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Row */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Total Funcionários: </span>
              <span className="text-blue-600">{employees.length}</span>
            </div>
            <div>
              <span className="font-semibold">Total Salários: </span>
              <span className="text-blue-600">
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0))}
              </span>
            </div>
            <div>
              <span className="font-semibold">Total INSS: </span>
              <span className="text-gray-600">
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.inss, 0))}
              </span>
            </div>
            <div>
              <span className="font-semibold">Total Geral: </span>
              <span className="text-blue-600 font-bold">
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.total, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Table View with Glassmorphism */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-[95vw] sm:w-[90vw] max-h-[90vh] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden relative">
            {/* Header with close button and column selector */}
            <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/50 dark:bg-gray-800/50">
              <h3 className="text-xl font-semibold">Folha de Pagamento - {selectedUnit}</h3>
              <div className="flex items-center gap-2">
                {/* Group Selector for expanded view */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Grupos
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Selecionar Grupos de Colunas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columnGroups.map((group) => (
                      <DropdownMenuCheckboxItem
                        key={group.key}
                        checked={group.visible}
                        onCheckedChange={() => toggleGroupVisibility(group.key)}
                        className="flex items-center gap-2"
                      >
                        {group.icon}
                        {group.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Column Selector for expanded view */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Colunas
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                    <DropdownMenuLabel>Selecionar Colunas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columnGroups.filter(group => group.visible).map((group) => (
                      <div key={group.key}>
                        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                          {group.icon}
                          {group.label}
                        </DropdownMenuLabel>
                        {columns
                          .filter(col => col.group === group.key && col.key !== 'actions')
                          .map((column) => (
                            <DropdownMenuCheckboxItem
                              key={column.key}
                              checked={column.visible}
                              onCheckedChange={() => toggleColumnVisibility(column.key)}
                              className="ml-6"
                            >
                              {column.label}
                            </DropdownMenuCheckboxItem>
                          ))}
                        <DropdownMenuSeparator />
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <button
                  onClick={toggleExpansion}
                  className="flex items-center gap-2 px-3 py-2 text-gray-800 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
                  style={{ background: 'linear-gradient(135deg, hsl(0, 0%, 98%) 0%, #FAFAFA 100%)' }}
                >
                  <X className="w-4 h-4" />
                  Fechar
                </button>
              </div>
            </div>
            
            {/* Scrollable table container */}
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              <Table className="w-full">
                <TableHeader className="sticky top-0 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <TableRow className="border-b border-white/20">
                    {visibleColumns.map((column) => (
                      <TableHead 
                        key={column.key} 
                        className={`font-semibold bg-white/90 dark:bg-gray-800/90 ${column.className || ''}`}
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-white/30 dark:hover:bg-gray-800/30 border-b border-white/10">
                      {visibleColumns.map((column) => (
                        <TableCell 
                          key={`${employee.id}-${column.key}`}
                          className={column.className || ''}
                        >
                          {renderCellContent(employee, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Summary Row in expanded view */}
            <div className="p-4 border-t border-white/20 bg-white/50 dark:bg-gray-800/50">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Total Funcionários: </span>
                  <span className="text-blue-600">{employees.length}</span>
                </div>
                <div>
                  <span className="font-semibold">Total Salários: </span>
                  <span className="text-blue-600">
                    {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0))}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Total INSS: </span>
                  <span className="text-gray-600">
                    {formatCurrency(employees.reduce((sum, emp) => sum + emp.inss, 0))}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Total Geral: </span>
                  <span className="text-blue-600 font-bold">
                    {formatCurrency(employees.reduce((sum, emp) => sum + emp.total, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notas - {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedEmployee?.notes ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedEmployee.notes}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nenhuma nota disponível para este funcionário.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}