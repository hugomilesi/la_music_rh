
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { payrollService } from '@/services/payrollService';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  FileText, 
  Save, 
  Download, 
  Upload, 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign,
  Building2,
  PieChart,
  BarChart3,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Music,
  MapPin,
  GraduationCap,
  UserCheck,
  Copy,
  Check
} from 'lucide-react';
import { ResponsivePayrollTable } from '@/components/payroll/ResponsivePayrollTable';
import { PayrollTable } from '@/components/payroll/PayrollTable';
import { NewPayrollEntryDialog } from '@/components/payroll/NewPayrollEntryDialog';
import { formatCurrency } from '@/utils/formatters';
import '@/styles/card-animations.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart as RechartsPieChart, Pie, Cell, LabelList } from 'recharts';
import PayrollDetailsModal from '@/components/PayrollDetailsModal';
import UnitDetailsModal from '@/components/UnitDetailsModal';
import PayrollEntryModal from '@/components/PayrollEntryModal';
import { usePayrollCrud } from '@/hooks/usePayrollCrud';
import { PayrollEntry } from '@/types/payroll';
// Interface para funcionários da folha de pagamento
interface Employee {
  id: string | number;
  name: string;
  unit: string;
  units: string[];
  position: string;
  classification: string;
  salary: number;
  transport: number;
  bonus: number;
  commission: number;
  reimbursement: number;
  thirteenth: number;
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
  // Campos adicionais para professores multi-unidade
  salaryRecreio?: number;
  salaryCampoGrande?: number;
  salaryBarra?: number;
  lalita?: number;
  passagens?: number;
}

// Interface para resumo de unidades
interface UnitSummary {
  name: string;
  total: number;
  employees: number;
  averagePerEmployee: number;
  color: string;
}

// Interface para dados de gráficos
interface ChartData {
  distributionByUnit: { name: string; value: number; color: string }[];
  costByClassification: { name: string; value: number; color: string }[];
  evolutionLast6Months: { month: string; value: number }[];
  costComposition: { name: string; value: number; color: string }[];
}

export default function PayrollPage() {
  // Estados para o AlertDialog de confirmação de remoção
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{id: string, name: string} | null>(null);

  // Função para converter Employee para PayrollEmployee
  const convertToPayrollEmployee = (employee: Employee) => ({
    id: employee.id.toString(),
    name: employee.name,
    role: employee.position,
    classification: employee.classification as 'CLT' | 'PJ' | 'Horista' | 'Estagiario',
    salary: employee.salary,
    transport: employee.transport,
    bonus: employee.bonus,
    commission: employee.commission,
    reimbursement: employee.reimbursement,
    thirteenth_vacation: employee.thirteenth,
    inss: employee.inss || calculateINSS(employee.salary),
    store: employee.store,
    bistro: employee.bistro,
    advance: employee.advance,
    discount: employee.discount,
    total: employee.total || calculateEmployeeTotal(employee),
    bank: employee.bank,
    agency: employee.agency,
    account: employee.account,
    cpf: employee.cpf,
    pix: employee.pix,
    unit: employee.unit
  });

  // Função para editar funcionário
  const handleEditEmployee = (employee: any) => {
    
    // Converter os dados do funcionário para o formato PayrollEntry
    const payrollEntry = {
      id: employee.id,
      colaborador_id: employee.id,
      mes: parseInt(selectedMonth.split('-')[1]),
      ano: parseInt(selectedMonth.split('-')[0]),
      classificacao: employee.classification,
      funcao: employee.position,
      salario_base: employee.salary || 0,
      bonus: employee.bonus || 0,
      comissao: employee.commission || 0,
      passagem: employee.transport || 0,
      reembolso: employee.reimbursement || 0,
      inss: employee.inss || 0,
      lojinha: employee.store || 0,
      bistro: employee.bistro || 0,
      adiantamento: employee.advance || 0,
      outros_descontos: employee.discount || 0,
      observacoes: '',
      nome_colaborador: employee.name,
      cpf_colaborador: employee.cpf,
      unidade: employee.unit
    };
    
    // Abrir modal de edição
    setSelectedEntry(payrollEntry);
    setIsEntryModalOpen(true);
    clearError();
  };

  // Função para deletar funcionário
  const handleDeleteEmployee = async (employeeId: string) => {
    console.log('Tentando deletar funcionário com ID:', employeeId);
    
    // Verificar se o ID existe
    if (!employeeId) {
      console.error('ID do funcionário não encontrado:', employeeId);
      setPayrollError('Erro: ID do funcionário não encontrado');
      return;
    }
    
    // Encontrar o funcionário na lista para obter o nome para confirmação
    const employee = payrollEntries.find(entry => entry.id === employeeId);
    const employeeName = employee ? employee.nome_colaborador || 'Funcionário' : 'Funcionário';
    
    // Configurar dados para o AlertDialog
    setEmployeeToDelete({ id: employeeId, name: employeeName });
    setDeleteDialogOpen(true);
  };

  // Função para confirmar a exclusão
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      console.log('Chamando payrollService.deletePayrollEntry com ID:', employeeToDelete.id);
      
      // Deletar entrada da folha de pagamento
      await payrollService.deletePayrollEntry(employeeToDelete.id);
      
      console.log('Entrada deletada com sucesso');
      
      // Recarregar dados após exclusão
      const [year, month] = selectedMonth.split('-').map(Number);
      const entries = await payrollService.getPayrollEntries(month, year);
      setPayrollEntries(entries);
      
      // Fechar dialog e limpar estado
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);

    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      setPayrollError('Erro ao excluir funcionário: ' + error.message);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // Função para atualizar funcionário
  const handleEmployeeUpdate = async (id: string, updates: Partial<any>) => {
    try {

      
      // Atualizar no banco de dados
      await payrollService.updatePayrollEntry(String(id), {
        base_salary: updates.salary,
        bonus: updates.bonus,
        commission: updates.commission,
        transport_voucher: updates.transport,
        reimbursement: updates.reimbursement,
        inss: updates.inss,
        store_expenses: updates.store,
        bistro_expenses: updates.bistro,
        salary_advance: updates.advance,
        other_discounts: updates.discount,
        classification: updates.classification,
        role: updates.role,
      });
      
      // Recarregar dados após edição
      const [year, month] = selectedMonth.split('-').map(Number);
      const entries = await payrollService.getPayrollEntries(month, year);
      setPayrollEntries(entries);
      

    } catch (error) {

      setPayrollError('Erro ao atualizar funcionário: ' + error.message);
    }
  };
  const { profile } = useAuth();
  
  // Verificar permissões de acesso
  const { canViewModule, getPermissionLevel } = usePermissionsV2();
  const canViewEmployees = canViewModule('usuarios');
  const canViewReports = canViewModule('folha_pagamento');
  const canAccessSettings = canViewModule('configuracoes');
  const userPermissionLevel = getPermissionLevel();
  
  // Determinar nível de acesso do usuário
  const getUserAccessLevel = () => {
    if (!profile) return 'user';
    
    if (canViewEmployees && canAccessSettings) return 'admin';
    if (canViewEmployees) return 'collaborator';
    if (canViewReports) return 'professor';
    return 'user';
  };
  
  const userAccessLevel = getUserAccessLevel();
  
  const [activeTab, setActiveTab] = useState('recreio');
  const [selectedMonth, setSelectedMonth] = useState('2025-09');
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('Todos');
  
  // Filtros independentes para gráficos
  const [graphClassificationFilter, setGraphClassificationFilter] = useState('Todos');
  // Filtro de mês removido - será implementado com dados históricos

  // Controlar visibilidade de dados sensíveis baseado no perfil
  const [showSensitiveData, setShowSensitiveData] = useState(() => {
    // Apenas admins e colaboradores podem ver dados sensíveis por padrão
    return userAccessLevel === 'admin' || userAccessLevel === 'collaborator';
  });
  
  // Verificar se o usuário pode alternar a visibilidade de dados sensíveis
  const canToggleSensitiveData = userAccessLevel === 'admin' || userAccessLevel === 'collaborator';
  
  // Função para limpar filtros dos gráficos
  const clearGraphFilters = () => {
    setGraphClassificationFilter('Todos');
  };

  // Estados para integração com Supabase
  const { employees: allEmployeesFromDB, loading: employeesLoading, error: employeesError } = useEmployees();
  const [payrollEntries, setPayrollEntries] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(true);
  const [payrollError, setPayrollError] = useState(null);
  
  // Estado para controlar o modal de detalhes
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Estado para controlar o modal da unidade
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [selectedUnitForModal, setSelectedUnitForModal] = useState<string>('');
  
  // Estados para CRUD de entradas da folha
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | undefined>(undefined);
  const { deleteEntry, loading: crudLoading, error: crudError, clearError } = usePayrollCrud();



  // Função para abrir modal de detalhes
  const handleOpenDetailsModal = () => {
    setIsDetailsModalOpen(true);
  };

  // Função para fechar o modal de detalhes
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  // Função para abrir o modal da unidade
  const handleOpenUnitModal = (unitName: string) => {
    setSelectedUnitForModal(unitName);
    setIsUnitModalOpen(true);
  };

  // Função para fechar o modal da unidade
  const handleCloseUnitModal = () => {
    setIsUnitModalOpen(false);
    setSelectedUnitForModal('');
  };

  // Funções para CRUD de entradas da folha
  const handleCreateEntry = () => {
    setSelectedEntry(undefined);
    setIsEntryModalOpen(true);
    clearError();
  };

  const handleEditEntry = (entry: PayrollEntry) => {
    setSelectedEntry(entry);
    setIsEntryModalOpen(true);
    clearError();
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada da folha de pagamento?')) {
      return;
    }

    const success = await deleteEntry(entryId);
    if (success) {
      // Recarregar dados após exclusão
      await handlePayrollEntrySuccess();
    }
  };

  const handleCloseEntryModal = () => {
    setIsEntryModalOpen(false);
    setSelectedEntry(undefined);
    clearError();
  };

  const handleSaveEntry = async (entry: PayrollEntry) => {
    // Recarregar dados após salvar
    await handlePayrollEntrySuccess();
  };

  // Função para duplicar folha do mês anterior
  const handleDuplicatePreviousMonth = async () => {
    try {
      setPayrollLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      
      // Obter mês anterior
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
      }
      
      await payrollService.duplicatePayrollEntries(prevMonth, prevYear, month, year);
      
      // Recarregar dados
      const entries = await payrollService.getPayrollEntries(month, year);
      setPayrollEntries(entries);
      
      // Log desabilitado - Folha duplicada com sucesso do mês anterior
    } catch (error) {
      // Log desabilitado - Erro ao duplicar folha
      setPayrollError('Erro ao duplicar folha do mês anterior: ' + error.message);
    } finally {
      setPayrollLoading(false);
    }
  };

  // Função para aprovar folha de pagamento
  const handleApprovePayroll = async () => {
    try {
      setPayrollLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      
      const payrolls = await payrollService.getPayrolls(month, year);
      if (payrolls.length > 0) {
        await payrollService.updatePayrollStatus(payrolls[0].id, 'APPROVED');
        // Log desabilitado - Folha aprovada com sucesso
      }
    } catch (error) {
      // Log desabilitado - Erro ao aprovar folha
      setPayrollError('Erro ao aprovar folha: ' + error.message);
    } finally {
      setPayrollLoading(false);
    }
  };

  // Função para exportar dados
  const handleExportData = async (format: 'excel' | 'pdf') => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const entries = await payrollService.getPayrollEntries(month, year);
      
      if (format === 'excel') {
        await payrollService.exportToExcel(entries, month, year);
      } else {
        await payrollService.exportToPDF(entries, month, year);
      }
      
      // Log desabilitado - Dados exportados com sucesso
    } catch (error) {
      // Log desabilitado - Erro ao exportar
      setPayrollError('Erro ao exportar dados: ' + error.message);
    }
  };

  // Função para recarregar dados após inserir nova entrada
  const handlePayrollEntrySuccess = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const entries = await payrollService.getPayrollEntries(month, year);
      setPayrollEntries(entries);
    } catch (error) {
      // Log desabilitado - Erro ao recarregar dados
      setPayrollError('Erro ao recarregar dados: ' + error.message);
    }
  };

  // Função para buscar dados de evolução dos últimos 6 meses
  const fetchEvolutionData = async () => {
    try {
      // Usar o payrollService para buscar dados de evolução
      const response = await payrollService.getEvolutionData();
      
      if (response && response.length > 0) {
        // Mapear os dados para o formato do gráfico
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return response.reverse().map((item: any) => ({
          month: monthNames[item.mes - 1],
          value: parseFloat(item.total_custos) || 0
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar dados de evolução:', error);
      return [];
    }
  };



  // Carregar dados da folha de pagamento do Supabase
  useEffect(() => {
    const loadPayrollData = async () => {
      setPayrollLoading(true);
      try {
        // Buscar TODOS os dados da folha de pagamento
        const entries = await payrollService.getAllPayrollEntries();
        
        // Definir as entradas da folha de pagamento
        setPayrollEntries(entries);
        
      } catch (error) {
        console.error('Erro ao carregar dados da folha de pagamento:', error);
        setPayrollError('Erro ao carregar dados: ' + error.message);
      } finally {
        setPayrollLoading(false);
      }
    };

    loadPayrollData();
  }, []); // Remover dependência do selectedMonth

  // Mapear dados do Supabase para o formato esperado pela interface
  const mapPayrollEntryToEmployee = (entry: any): Employee => {
    
    // Garantir que units seja sempre um array de strings
    const units = Array.isArray(entry.users?.units) ? entry.users.units.filter(u => typeof u === 'string') : 
                  Array.isArray(entry.units) ? entry.units.filter(u => typeof u === 'string') : [];
    
    // Garantir que unit seja sempre uma string
    let unit = 'Unidade não informada';
    
    // Priorizar dados de colaborador não cadastrado
    if (entry.unidade && typeof entry.unidade === 'string') {
      unit = entry.unidade;
    } else if (units.length > 0) {
      unit = String(units[0]);
    } else if (entry.users?.unit && typeof entry.users.unit === 'string') {
      unit = entry.users.unit;
    }
    

    
    // Mapear corretamente os campos da base de dados
    const mappedEmployee = {
      id: entry.id, // ID da entrada da folha de pagamento (necessário para operações CRUD)
      name: entry.nome_colaborador || entry.collaborator_name || entry.users?.username || 'Nome não informado',
      unit: unit,
      units: units,
      position: entry.funcao || entry.role || entry.position || 'Cargo não informado',
      classification: entry.classificacao || entry.classification || 'Não informado',
      salary: parseFloat(entry.salario_base) || parseFloat(entry.base_salary) || 0,
      transport: parseFloat(entry.passagem) || parseFloat(entry.transport) || parseFloat(entry.transport_voucher) || 0,
      bonus: parseFloat(entry.bonus) || 0,
      commission: parseFloat(entry.comissao) || parseFloat(entry.commission) || 0,
      reimbursement: parseFloat(entry.reembolso) || parseFloat(entry.reimbursement) || 0,
      thirteenth: 0, // Campo não mapeado ainda
      inss: parseFloat(entry.inss) || 0,
      store: parseFloat(entry.lojinha) || parseFloat(entry.store_discount) || parseFloat(entry.store_expenses) || 0,
      bistro: parseFloat(entry.bistro) || parseFloat(entry.bistro_discount) || parseFloat(entry.bistro_expenses) || 0,
      advance: parseFloat(entry.adiantamento) || parseFloat(entry.advance) || parseFloat(entry.salary_advance) || 0,
      discount: parseFloat(entry.outros_descontos) || parseFloat(entry.other_discounts) || 0,
      total: 0, // Será calculado abaixo
      bank: entry.banco || entry.bank || entry.users?.bank || 'Não informado',
      agency: entry.agencia || entry.agency || entry.users?.agency || 'Não informado',
      account: entry.conta || entry.account || entry.users?.account || 'Não informado',
      cpf: entry.cpf_colaborador || entry.cpf || entry.users?.cpf || 'Não informado',
      pix: entry.pix || entry.users?.pix || 'Não informado',
      notes: entry.observacoes || entry.observations || '',
      date: selectedMonth
    };
    
    // Calcular o total corretamente
    mappedEmployee.total = mappedEmployee.salary + mappedEmployee.bonus + mappedEmployee.commission + mappedEmployee.reimbursement - mappedEmployee.inss - mappedEmployee.transport - mappedEmployee.store - mappedEmployee.bistro - mappedEmployee.advance - mappedEmployee.discount;
    

    
    return mappedEmployee;
  };

  // Organizar dados por unidade e classificação
  const organizeDataByUnit = (entries: any[]) => {
    // Verificação de segurança para evitar erro de map em undefined
    if (!entries || !Array.isArray(entries)) {
      return {
        recreio: [],
        'cg-emla': [],
        'cg-lamk': [],
        barra: [],
        'staff-rateado': [],
        'professores-multi-unidade': []
      };
    }
    
    const mappedEmployees = entries.map(entry => mapPayrollEntryToEmployee(entry));
    
    return {
      recreio: mappedEmployees.filter(emp => {
        const units = emp.units || [];
        const unit = typeof emp.unit === 'string' ? emp.unit.toLowerCase() : '';
        const role = typeof emp.role === 'string' ? emp.role.toLowerCase() : '';
        
        return unit.includes('recreio');
      }),
      'cg-emla': mappedEmployees.filter(emp => {
        const units = emp.units || [];
        const unit = typeof emp.unit === 'string' ? emp.unit.toLowerCase() : '';
        const role = typeof emp.role === 'string' ? emp.role.toLowerCase() : '';
        
        return unit.includes('cg emla') || unit.includes('emla');
      }),
      'cg-lamk': mappedEmployees.filter(emp => {
        const units = emp.units || [];
        const unit = typeof emp.unit === 'string' ? emp.unit.toLowerCase() : '';
        const role = typeof emp.role === 'string' ? emp.role.toLowerCase() : '';
        
        return unit.includes('cg lamk') || unit.includes('lamk');
      }),
      barra: mappedEmployees.filter(emp => {
        const units = emp.units || [];
        const unit = typeof emp.unit === 'string' ? emp.unit.toLowerCase() : '';
        const role = typeof emp.role === 'string' ? emp.role.toLowerCase() : '';
        
        return unit.includes('barra');
      }),
      'staff-rateado': mappedEmployees.filter(emp => {
        const units = emp.units || [];
        const unit = typeof emp.unit === 'string' ? emp.unit.toLowerCase() : '';
        const classification = typeof emp.classification === 'string' ? emp.classification.toLowerCase() : '';
        const role = typeof emp.role === 'string' ? emp.role.toLowerCase() : '';
        
        return unit.includes('staff') || classification.includes('staff');
      }),
      'professores-multi-unidade': mappedEmployees.filter(emp => {
        const units = emp.units || [];
        const unit = typeof emp.unit === 'string' ? emp.unit.toLowerCase() : '';
        const classification = typeof emp.classification === 'string' ? emp.classification.toLowerCase() : '';
        const role = typeof emp.role === 'string' ? emp.role.toLowerCase() : '';
        
        return unit.includes('professores') || unit.includes('multi') || classification.includes('professor');
      })
    };
  };

  // Organizar dados por unidade usando dados reais do Supabase
  const allEmployees = organizeDataByUnit(payrollEntries);

  
  // Log desabilitado - Dados organizados por unidade

  // Funcionários da aba ativa
  const currentEmployees = allEmployees[activeTab as keyof typeof allEmployees] || [];

  // Todos os funcionários para cálculos gerais
  const allEmployeesList = Object.values(allEmployees).flat();

  // Estado de loading combinado
  const isLoading = employeesLoading || payrollLoading;
  const hasError = employeesError || payrollError;

  // Filtros aplicados
  const filteredEmployees = useMemo(() => {
    return currentEmployees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClassification = classificationFilter === 'Todos' || employee.classification === classificationFilter;
      
      return matchesSearch && matchesClassification;
    });
  }, [currentEmployees, searchTerm, classificationFilter]);

  // Função para calcular INSS
  const calculateINSS = (salary: number): number => {
    if (salary <= 1412) return salary * 0.075;
    if (salary <= 2666.68) return salary * 0.09;
    if (salary <= 4000.03) return salary * 0.12;
    return salary * 0.14;
  };

  // Função para calcular total de um funcionário
  const calculateEmployeeTotal = (employee: Employee): number => {
    const baseSalary = employee.salary || 0;
    const multiUnitSalary = (employee.salaryRecreio || 0) + (employee.salaryCampoGrande || 0) + (employee.salaryBarra || 0);
    const totalSalary = baseSalary + multiUnitSalary;
    
    return totalSalary + 
           (employee.transport || 0) + 
           (employee.bonus || 0) + 
           (employee.commission || 0) + 
           (employee.reimbursement || 0) + 
           (employee.thirteenth || 0) + 
           (employee.store || 0) + 
           (employee.bistro || 0) + 
           (employee.lalita || 0) + 
           (employee.passagens || 0) - 
           (employee.advance || 0) - 
           (employee.discount || 0) - 
           (employee.inss || 0);
  };

  // Cálculo do resumo geral
  const calculateSummary = (): UnitSummary[] => {
    const units = ['recreio', 'cg-emla', 'cg-lamk', 'barra', 'staff-rateado', 'professores-multi-unidade'] as const;
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    const unitSummary = units.map((unitKey, index) => {
      const unitEmployees = allEmployees[unitKey] || [];
      const total = unitEmployees.reduce((sum, emp) => sum + calculateEmployeeTotal(emp), 0);
      const employees = unitEmployees.length;
      
      return {
        name: unitKey === 'recreio' ? 'Recreio' : 
              unitKey === 'cg-emla' ? 'CG EMLA' :
              unitKey === 'cg-lamk' ? 'CG LAMK' :
              unitKey === 'barra' ? 'Barra' : 
              unitKey === 'staff-rateado' ? 'Staff Rateado' :
              'Professores Multi-Unidade',
        total,
        employees,
        averagePerEmployee: employees > 0 ? total / employees : 0,
        color: colors[index]
      };
    });
    
    // Remover o card de rateador conforme solicitado
    
    return unitSummary;
  };

  // Cálculo do total geral
  const calculateTotalGeneral = (): number => {
    return allEmployeesList.reduce((sum, emp) => sum + calculateEmployeeTotal(emp), 0);
  };

  // Função para filtrar funcionários baseado nos filtros ativos
  const getFilteredEmployees = () => {
    let employees = [];
    
    // Se uma aba específica está ativa, usar apenas os funcionários dessa aba
    if (activeTab !== 'recreio' || searchTerm || classificationFilter !== 'Todos') {
      const tabEmployees = allEmployees[activeTab] || [];
      employees = tabEmployees.filter(employee => {
        const matchesSearch = !searchTerm || 
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.cpf.includes(searchTerm);
        const matchesClassification = classificationFilter === 'Todos' || 
          employee.classification === classificationFilter;
        return matchesSearch && matchesClassification;
      });
    } else {
      // Se nenhum filtro está ativo, usar todos os funcionários
      employees = allEmployeesList;
    }
    
    return employees;
  };



  const summaryData = calculateSummary();
  const totalGeneral = calculateTotalGeneral();
  
  // Estado para dados de evolução
  const [evolutionData, setEvolutionData] = useState<{ month: string; value: number }[]>([]);

  // Buscar dados de evolução quando necessário
  useEffect(() => {
    const loadEvolutionData = async () => {
      try {
        const data = await fetchEvolutionData();
        setEvolutionData(data);
      } catch (error) {
        console.error('Erro ao carregar dados de evolução:', error);
        setEvolutionData([]);
      }
    };

    if (!isLoading && payrollEntries.length > 0) {
      loadEvolutionData();
    }
  }, [isLoading, payrollEntries.length, selectedMonth]);

  // Usar useMemo para otimizar o cálculo dos gráficos baseado nos filtros
  const chartData = useMemo(() => {
    if (isLoading || !payrollEntries.length) {
      return {
        distributionByUnit: [],
        costByClassification: [],
        evolutionLast6Months: [],
        costComposition: []
      };
    }

    const filteredEmployees = getFilteredEmployees();
    const summary = calculateSummary();
    
    // Filtrar dados baseado nos filtros dos gráficos (independentes)
    const applyGraphFilters = (employees: any[]) => {
      return employees.filter(emp => {
        const matchesClassification = graphClassificationFilter === 'Todos' || 
          emp.classification === graphClassificationFilter;
        return matchesClassification;
      });
    };
    
    return {
      distributionByUnit: summary.map(unit => ({
        name: unit.name,
        value: unit.total,
        color: unit.color
      })),
      costByClassification: [
        { name: 'CLT', value: filteredEmployees.filter(e => e.classification === 'CLT').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-1))' },
        { name: 'PJ', value: filteredEmployees.filter(e => e.classification === 'PJ').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-2))' },
        { name: 'Horista', value: filteredEmployees.filter(e => e.classification === 'Horista').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-3))' },
        { name: 'Estagiário', value: filteredEmployees.filter(e => e.classification === 'Estagiário').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-4))' },
        { name: 'Staff', value: filteredEmployees.filter(e => e.classification === 'Staff').reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-5))' }
      ],
      evolutionLast6Months: evolutionData,
      costComposition: [
        { name: 'Recreio', value: applyGraphFilters(allEmployees.recreio || []).reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-1))' },
        { name: 'CG EMLA', value: applyGraphFilters(allEmployees['cg-emla'] || []).reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-2))' },
        { name: 'CG LAMK', value: applyGraphFilters(allEmployees['cg-lamk'] || []).reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-3))' },
        { name: 'Barra', value: applyGraphFilters(allEmployees.barra || []).reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-4))' },
        { name: 'Staff', value: applyGraphFilters(allEmployees['staff-rateado'] || []).reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-5))' },
        { name: 'Professores Multi-Unidade', value: applyGraphFilters(allEmployees['professores-multi-unidade'] || []).reduce((sum, e) => sum + calculateEmployeeTotal(e), 0), color: 'hsl(var(--chart-6))' }
      ].sort((a, b) => b.value - a.value)
    };
  }, [payrollEntries, activeTab, graphClassificationFilter, isLoading, evolutionData]);



  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-musical-bounce"></div>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Folha de Pagamento</h1>
              <p className="text-gray-600 mt-1">Gestão completa da folha de pagamento por unidade</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleExportData('excel')}
              >
                <Download className="w-4 h-4" />
                Excel
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => handleExportData('pdf')}
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>


            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
            {/* Total Geral */}
            <div 
              className="bg-white rounded-lg shadow-sm border border-blue-200 p-2 group relative overflow-hidden payroll-card cursor-pointer hover:shadow-blue-500/20"
              onClick={() => handleOpenDetailsModal()}
            >
              {/* Subtle background gradient on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-blue-50"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors truncate">Total Geral</p>
                  <p className="text-lg font-bold text-gray-900 mb-1 payroll-value origin-left truncate">{formatCurrency(totalGeneral)}</p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors truncate">{getFilteredEmployees().length} func.</p>
                </div>
                
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md payroll-icon ml-1">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Musical note decoration */}
              <div className="absolute top-1 right-1 text-sm opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                ♪
              </div>
            </div>

            {/* Cards das Unidades - Filtrar para remover o card de rateador */}
            {summaryData.filter(unit => unit.name !== 'Rateador').map((unit, index) => {
              const unitKeyMap = {
                'Recreio': 'recreio',
                'Campo Grande EMLA': 'cg-emla',
                'Campo Grande LAMK': 'cg-lamk',
                'Barra': 'barra',
                'Staff Rateado': 'staff-rateado',
                'Professores Multi-Unidade': 'professores-multi-unidade'
              };
              const unitKey = unitKeyMap[unit.name] || 'recreio';
              const unitEmployees = allEmployees[unitKey] || [];
              const colorMap = {
                'Recreio': 'green',
                'Campo Grande EMLA': 'purple', 
                'Campo Grande LAMK': 'orange',
                'Barra': 'red',
                'Staff Rateado': 'indigo'
              };
              const cardColor = colorMap[unit.name] || 'blue';
              const colorStyles = {
                blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', shadow: 'hover:shadow-blue-500/20' },
                green: { gradient: 'from-green-500 to-green-600', bg: 'bg-green-50', border: 'border-green-200', shadow: 'hover:shadow-green-500/20' },
                purple: { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', shadow: 'hover:shadow-purple-500/20' },
                orange: { gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', shadow: 'hover:shadow-orange-500/20' },
                red: { gradient: 'from-red-500 to-red-600', bg: 'bg-red-50', border: 'border-red-200', shadow: 'hover:shadow-red-500/20' },
                indigo: { gradient: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50', border: 'border-indigo-200', shadow: 'hover:shadow-indigo-500/20' }
              };
              const colorStyle = colorStyles[cardColor];
              
              return (
                <div 
                  key={unit.name}
                  className={`bg-white rounded-lg shadow-sm border p-2 group relative overflow-hidden payroll-card ${colorStyle.border} ${colorStyle.shadow} cursor-pointer`}
                  onClick={() => {
                    setActiveTab(unitKey);
                    handleOpenUnitModal(unit.name);
                  }}
                >
                  {/* Subtle background gradient on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${colorStyle.bg}`}></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors truncate">{unit.name.replace('Campo Grande ', 'CG ')}</p>
                      <p className="text-lg font-bold text-gray-900 mb-1 payroll-value origin-left truncate">{formatCurrency(unit.total)}</p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors truncate">{unit.employees} func.</p>
                    </div>
                    
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colorStyle.gradient} flex items-center justify-center shadow-md payroll-icon ml-1`}>
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Musical note decoration */}
                  <div className="absolute top-1 right-1 text-sm opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    ♪
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles de Filtros para Gráficos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Filtros dos Gráficos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={graphClassificationFilter} onValueChange={setGraphClassificationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Horista">Horista</SelectItem>
                    <SelectItem value="Estagiário">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
                {/* Filtro de mês será implementado quando tivermos dados históricos */}
                <div className="text-sm text-gray-500 italic">
                  Filtros de período serão disponibilizados com dados históricos
                </div>
                <Button 
                  variant="outline" 
                  onClick={clearGraphFilters}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Distribuição por Unidade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribuição por Unidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Pie
                      data={chartData?.distributionByUnit?.filter(item => item.name !== 'Rateador') || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={30}
                      fill="hsl(var(--chart-1))"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {(chartData?.distributionByUnit?.filter(item => item.name !== 'Rateador') || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Custo por Classificação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Custo por Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={chartData?.costByClassification || []}
                    margin={{
                      top: 20,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <Tooltip 
                      cursor={false}
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" radius={8}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      {(chartData?.costByClassification || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolução Últimos 6 Meses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Evolução Últimos 6 Meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart 
                    data={chartData?.evolutionLast6Months || []}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <pattern id="dotGridDark" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="15" r="1.5" fill="hsl(var(--chart-2))" fillOpacity="0.1" />
                      </pattern>
                    </defs>

                    <rect
                      x="10px"
                      y="-30px"
                      width="100%"
                      height="100%"
                      fill="url(#dotGridDark)"
                      style={{ pointerEvents: 'none' }}
                    />

                    <CartesianGrid vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, strokeWidth: 0.5, stroke: 'hsl(var(--foreground))', opacity: 0.6 }}
                      tickMargin={20}
                      interval="preserveStartEnd"
                    />
                    <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                    
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border border-border bg-background p-3 shadow-md min-w-[120px]">
                              <div className="text-xs font-medium text-muted-foreground tracking-wide mb-2">{label}</div>
                              <div className="text-sm font-semibold text-foreground">{formatCurrency(payload[0].value)}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ strokeDasharray: '2 2', stroke: 'hsl(var(--chart-2))', strokeOpacity: 0.6 }}
                    />

                    {/* Main line with glow effect */}
                    <Line
                      type="linear"
                      dataKey="value"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: 'hsl(var(--chart-2))',
                        stroke: 'hsl(var(--chart-2))',
                        strokeWidth: 2,
                        filter: 'drop-shadow(0 0 6px hsl(var(--chart-2)))',
                      }}
                      activeDot={{
                        r: 6,
                        stroke: 'hsl(var(--chart-2))',
                        strokeWidth: 3,
                        fill: 'hsl(var(--chart-2))',
                        filter: 'drop-shadow(0 0 8px hsl(var(--chart-2)))',
                      }}
                    />

                    {/* Endpoint dot with enhanced glow */}
                    <Line
                      type="linear"
                      dataKey="value"
                      stroke="transparent"
                      strokeWidth={0}
                      dot={false}
                      activeDot={{
                        r: 7,
                        stroke: 'hsl(var(--chart-2))',
                        strokeWidth: 4,
                        fill: 'hsl(var(--chart-2))',
                        filter: 'drop-shadow(0 0 10px hsl(var(--chart-2)))',
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Composição de Custos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Composição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData?.costComposition || []}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 120,
                      bottom: 20,
                      left: 20,
                    }}
                  >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                      hide
                    />
                    <XAxis dataKey="value" type="number" hide />
                    <Tooltip
                      cursor={false}
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar
                      dataKey="value"
                      layout="vertical"
                      radius={4}
                    >
                      <LabelList
                        dataKey="name"
                        position="insideLeft"
                        offset={8}
                        className="fill-background"
                        fontSize={12}
                      />
                      <LabelList
                        dataKey="value"
                        position="right"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      {(chartData?.costComposition || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Controles de Visualização */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {(userAccessLevel === 'admin' || userAccessLevel === 'collaborator') && (
                <Button
                  variant={showSensitiveData ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                  className="flex items-center gap-2"
                >
                  {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showSensitiveData ? 'Ocultar Dados' : 'Mostrar Dados'}
                </Button>
              )}
              {userAccessLevel === 'viewer' && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Dados sensíveis ocultos (acesso limitado)
                </div>
              )}
            </div>
          </div>

          {/* Abas para diferentes categorias */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="recreio" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Recreio
              </TabsTrigger>
              <TabsTrigger value="cg-emla" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                CG EMLA
              </TabsTrigger>
              <TabsTrigger value="cg-lamk" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                CG LAMK
              </TabsTrigger>
              <TabsTrigger value="barra" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Barra
              </TabsTrigger>
              <TabsTrigger value="staff-rateado" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Staff Rateado
              </TabsTrigger>
              <TabsTrigger value="professores-multi-unidade" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <UserCheck className="w-4 h-4" />
                Professores Multi-Unidade
              </TabsTrigger>
            </TabsList>

            {/* Recreio */}
            <TabsContent value="recreio" className="space-y-4">
              {/* Filtros para Recreio */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar funcionário ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Horista">Horista</SelectItem>
                    <SelectItem value="Estagiário">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
                {canViewEmployees && (
                  <NewPayrollEntryDialog 
                    onSuccess={handlePayrollEntrySuccess}
                    defaultMonth={selectedMonth.split('-')[1]}
                    defaultYear={selectedMonth.split('-')[0]}
                    defaultUnit="recreio"
                  />
                )}
              </div>

              {/* Tabela */}
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <Building2 className="w-5 h-5 text-blue-600" />
                       Unidade Recreio - Edição Inline
                     </div>
                     {/* Botão removido conforme solicitação do usuário */}
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <PayrollTable 
                     employees={allEmployees.recreio.map(convertToPayrollEmployee)}
                     selectedUnit="recreio"
                     onEdit={handleEditEmployee}
                     onDelete={handleDeleteEmployee}
                   />
                 </CardContent>
               </Card>
             </TabsContent>

             {/* CG EMLA */}
             <TabsContent value="cg-emla" className="space-y-4">
               {/* Filtros para Campo Grande */}
               <div className="flex flex-col sm:flex-row gap-4 mb-4">
                 <div className="flex-1">
                   <Input
                     placeholder="Buscar funcionário ou CPF..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full"
                   />
                 </div>
                 <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                   <SelectTrigger className="w-full sm:w-48">
                     <SelectValue placeholder="Classificação" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Todos">Todos</SelectItem>
                     <SelectItem value="CLT">CLT</SelectItem>
                     <SelectItem value="PJ">PJ</SelectItem>
                     <SelectItem value="Horista">Horista</SelectItem>
                     <SelectItem value="Estagiário">Estagiário</SelectItem>
                   </SelectContent>
                 </Select>
                 {canViewEmployees && (
                   <NewPayrollEntryDialog 
                     onSuccess={handlePayrollEntrySuccess}
                     defaultMonth={selectedMonth.split('-')[1]}
                     defaultYear={selectedMonth.split('-')[0]}
                     defaultUnit="cg-emla"
                   />
                 )}
               </div>

               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <Building2 className="w-5 h-5 text-amber-600" />
                       Unidade CG EMLA - Edição Inline
                     </div>
                     {/* Botão removido conforme solicitação do usuário */}
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <PayrollTable 
                     employees={(allEmployees['cg-emla'] || []).map(convertToPayrollEmployee)}
                     selectedUnit="cg-emla"
                     onEdit={handleEditEmployee}
                     onDelete={handleDeleteEmployee}
                   />
                 </CardContent>
               </Card>
            </TabsContent>

            {/* CG LAMK */}
            <TabsContent value="cg-lamk" className="space-y-4">
              {/* Filtros para CG LAMK */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar funcionário ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Horista">Horista</SelectItem>
                    <SelectItem value="Estagiário">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
                {canViewEmployees && (
                  <NewPayrollEntryDialog 
                    onSuccess={handlePayrollEntrySuccess}
                    defaultMonth={selectedMonth.split('-')[1]}
                    defaultYear={selectedMonth.split('-')[0]}
                    defaultUnit="cg-lamk"
                  />
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-green-600" />
                      Unidade CG LAMK - Edição Inline
                    </div>
                    {/* Botão removido conforme solicitação do usuário */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PayrollTable 
                    employees={(allEmployees['cg-lamk'] || []).map(convertToPayrollEmployee)}
                    selectedUnit="cg-lamk"
                    onEdit={handleEditEmployee}
                    onDelete={handleDeleteEmployee}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Barra */}
            <TabsContent value="barra" className="space-y-4">
              {/* Filtros para Barra */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar funcionário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Horista">Horista</SelectItem>
                    <SelectItem value="Estagiario">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
                {canViewEmployees && (
                  <NewPayrollEntryDialog 
                    onSuccess={handlePayrollEntrySuccess}
                    defaultMonth={selectedMonth.split('-')[1]}
                    defaultYear={selectedMonth.split('-')[0]}
                    defaultUnit="barra"
                  />
                )}
              </div>

              {/* Tabela */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-red-600" />
                      Unidade Barra - Edição Inline
                    </div>
                    {/* Botão removido conforme solicitação do usuário */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PayrollTable 
                    employees={(allEmployees['barra'] || []).map(convertToPayrollEmployee)}
                    selectedUnit="barra"
                    onEdit={handleEditEmployee}
                    onDelete={handleDeleteEmployee}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff-rateado" className="space-y-4">
              {/* Filtros para Staff Rateado */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar funcionário ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Horista">Horista</SelectItem>
                    <SelectItem value="Estagiário">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
                {canViewEmployees && (
                  <NewPayrollEntryDialog 
                    onSuccess={handlePayrollEntrySuccess}
                    defaultMonth={selectedMonth.split('-')[1]}
                    defaultYear={selectedMonth.split('-')[0]}
                    defaultUnit="staff-rateado"
                  />
                )}
              </div>

              {/* Tabela */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Staff Rateado - Edição Inline
                    </div>
                    {/* Botão removido conforme solicitação do usuário */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PayrollTable 
                    employees={(allEmployees['staff-rateado'] || []).map(convertToPayrollEmployee)}
                    selectedUnit="staff-rateado"
                    onEdit={handleEditEmployee}
                    onDelete={handleDeleteEmployee}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professores Multi-Unidade */}
            <TabsContent value="professores-multi-unidade" className="space-y-4">
              {/* Filtros para Professores Multi-Unidade */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar funcionário ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Horista">Horista</SelectItem>
                    <SelectItem value="Estagiário">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
                {canViewEmployees && (
                  <NewPayrollEntryDialog 
                    onSuccess={handlePayrollEntrySuccess}
                    defaultMonth={selectedMonth.split('-')[1]}
                    defaultYear={selectedMonth.split('-')[0]}
                    defaultUnit="professores-multi-unidade"
                  />
                )}
              </div>

              {/* Tabela */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Professores Multi-Unidade - Edição Inline
                    </div>
                    {/* Botão removido conforme solicitação do usuário */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PayrollTable
                    employees={allEmployees['professores-multi-unidade'].map(convertToPayrollEmployee)}
                    selectedUnit="professores-multi-unidade"
                    onEdit={handleEditEmployee}
                    onDelete={handleDeleteEmployee}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Multi-Unidade */}
            <TabsContent value="multi-unidade" className="space-y-4">
              {/* Filtros para Multi-Unidade */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar funcionário ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Horista">Horista</SelectItem>
                    <SelectItem value="Estagiário">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
                {canViewEmployees && (
                  <NewPayrollEntryDialog 
                    onSuccess={handlePayrollEntrySuccess}
                    defaultMonth={selectedMonth.split('-')[1]}
                    defaultYear={selectedMonth.split('-')[0]}
                    defaultUnit="multi-unidade"
                  />
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Multi-Unidade - Edição Inline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PayrollTable 
                    employees={Object.entries(allEmployees).flatMap(([unit, employees]) => 
                      employees.map((employee) => convertToPayrollEmployee({...employee, unit}))
                    )}
                    selectedUnit="multi-unidade"
                    onEdit={handleEditEmployee}
                    onDelete={handleDeleteEmployee}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>


        </div>
      </div>
      
      {/* Modal de Detalhes */}
        <PayrollDetailsModal
          open={isDetailsModalOpen}
          onOpenChange={handleCloseDetailsModal}
          totalGeneral={calculateTotalGeneral()}
          allEmployees={allEmployeesList}
          unitSummaries={calculateSummary()}
          formatCurrency={formatCurrency}
        />

      {/* Modal da Unidade */}
      {selectedUnitForModal && (
        <UnitDetailsModal
          isOpen={isUnitModalOpen}
          onClose={handleCloseUnitModal}
          unitName={selectedUnitForModal}
          employees={(() => {
            const unitKey = selectedUnitForModal === 'Recreio' ? 'recreio' :
                           selectedUnitForModal === 'Campo Grande EMLA' ? 'cg-emla' :
                           selectedUnitForModal === 'Campo Grande LAMK' ? 'cg-lamk' :
                           selectedUnitForModal === 'Barra' ? 'barra' :
                           selectedUnitForModal === 'Professores Multi-Unidade' ? 'professores-multi-unidade' :
                           selectedUnitForModal === 'Staff Rateado' ? 'staff-rateado' : 'recreio';
            return allEmployees[unitKey] || [];
          })()}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Modal de Entrada da Folha */}
      <PayrollEntryModal
        isOpen={isEntryModalOpen}
        onClose={handleCloseEntryModal}
        onSave={handleSaveEntry}
        entry={selectedEntry}
        loading={crudLoading}
      />

      {/* AlertDialog para confirmação de remoção */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a entrada de folha de pagamento de <strong>{employeeToDelete?.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setEmployeeToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
