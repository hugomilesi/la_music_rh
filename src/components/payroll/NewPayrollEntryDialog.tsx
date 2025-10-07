import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, User, Building, DollarSign, CreditCard } from 'lucide-react';
import { payrollService } from '@/services/payrollService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useColaboradores } from '@/contexts/ColaboradorContext';
import { fetchDepartments, type Department } from '@/services/rolesService';

interface NewPayrollEntryDialogProps {
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
  defaultMonth?: string;
  defaultYear?: string;
  defaultUnit?: string;
}

const UNITS = [
  'Barra',
  'CG EMLA',
  'CG LAMK',
  'Professores Multi-Unidade',
  'Recreio',
  'Staff Rateado'
];

const CLASSIFICATIONS = [
  'CLT',
  'PJ',
  'Estagiário',
  'Terceirizado',
  'Freelancer'
];

export function NewPayrollEntryDialog({ onSuccess, triggerButton, defaultMonth, defaultYear, defaultUnit }: NewPayrollEntryDialogProps) {
  const { user } = useAuth();
  const { colaboradoresAtivos, loading: loadingColaboradores } = useColaboradores();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Array<{
    id: string,
    nome: string,
    cpf: string,
    cargo: string,
    departamento: string,
    unidade: string,
    tipo_contratacao: string,
    banco?: string,
    agencia?: string,
    conta?: string,
    tipo_conta?: string,
    telefone?: string,
    email?: string,
    data_admissao?: string,
    status?: string,
    created_at?: string,
    updated_at?: string
  }>>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isRegisteredEmployee, setIsRegisteredEmployee] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  console.log('NewPayrollEntryDialog - defaultUnit recebido:', defaultUnit);
  
  const [formData, setFormData] = useState({
    // Dados pessoais
    colaborador_id: '',
    nome_funcionario: '',
    cpf_funcionario: '',
    unidade: defaultUnit || '',
    departamento: '',
    
    // Dados para colaborador não cadastrado
    nome_colaborador: '',
    cpf_colaborador: '',
    
    // Dados do período
    mes: defaultMonth ? parseInt(defaultMonth) : new Date().getMonth() + 1,
    ano: defaultYear ? parseInt(defaultYear) : new Date().getFullYear(),
    
    // Dados profissionais
    classificacao: '',
    funcao: '',
    
    // Valores financeiros
    salario_base: 0,
    bonus: 0,
    comissao: 0,
    passagem: 0,
    reembolso: 0,
    inss: 0,
    lojinha: 0,
    bistro: 0,
    adiantamento: 0,
    outros_descontos: 0,
    transport_voucher: 0,
    salary_advance: 0,
    
    // Dados bancários
    banco: '',
    agencia: '',
    conta: '',
    pix: '',
    
    // Observações
    observacoes: ''
  });

  // Carregar funcionários e departamentos quando o diálogo abrir
  useEffect(() => {
    if (open) {
      loadEmployees();
      loadDepartments();
    }
  }, [open]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      // Buscar dados diretamente da tabela colaboradores - incluindo todas as colunas disponíveis
      const { data: colaboradoresData, error: colaboradoresError } = await supabase
        .from('colaboradores')
        .select('id, nome, cpf, cargo, departamento, unidade, tipo_contratacao, banco, agencia, conta, tipo_conta, telefone, email, data_admissao, status, created_at, updated_at')
        .eq('status', 'ativo')
        .order('nome');
      
      if (colaboradoresError) throw colaboradoresError;

      // Usar diretamente os dados dos colaboradores
      const employeesData = (colaboradoresData || []).map(colaborador => ({
        id: colaborador.id,
        nome: colaborador.nome,
        cpf: colaborador.cpf,
        cargo: colaborador.cargo,
        departamento: colaborador.departamento,
        unidade: colaborador.unidade,
        tipo_contratacao: colaborador.tipo_contratacao,
        banco: colaborador.banco,
        agencia: colaborador.agencia,
        conta: colaborador.conta,
        tipo_conta: colaborador.tipo_conta,
        telefone: colaborador.telefone,
        email: colaborador.email,
        data_admissao: colaborador.data_admissao,
        status: colaborador.status,
        created_at: colaborador.created_at,
        updated_at: colaborador.updated_at
      }));

      console.log('Colaboradores carregados com todas as colunas:', employeesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar lista de funcionários');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const departmentsData = await fetchDepartments();
      setDepartments(departmentsData);
    } catch (error) {

      toast.error('Erro ao carregar lista de departamentos');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    if (selectedEmployee) {
      setFormData(prev => ({
        ...prev,
        colaborador_id: employeeId,
        nome_funcionario: selectedEmployee.nome,
        cpf_funcionario: selectedEmployee.cpf || '',
        unidade: defaultUnit || '',
        departamento: selectedEmployee.departamento || '',
        
        // Preencher automaticamente com dados do colaborador
        classificacao: selectedEmployee.tipo_contratacao || '',
        funcao: selectedEmployee.cargo || '',
        
        // Dados bancários
        banco: selectedEmployee.banco || '',
        agencia: selectedEmployee.agencia || '',
        conta: selectedEmployee.conta || '',
        
        // Limpar campos que devem ser preenchidos manualmente
        salario_base: 0,
        bonus: 0,
        comissao: 0,
        passagem: 0,
        reembolso: 0,
        inss: 0,
        lojinha: 0,
        bistro: 0,
        adiantamento: 0,
        outros_descontos: 0,
        transport_voucher: 0,
        salary_advance: 0,
        observacoes: ''
      }));
      
      // Mostrar toast informativo
      toast.success(`Dados de ${selectedEmployee.nome} carregados automaticamente`);
    } else {
      // Funcionário não encontrado
      toast.error('Colaborador não encontrado');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar erros anteriores
    setFieldErrors({});
    
    const errors: Record<string, string> = {};
    
    // Validação de campos obrigatórios básicos
    if (!formData.mes || !formData.ano) {

      if (!formData.mes) errors.mes = 'Selecione o mês';
      if (!formData.ano) errors.ano = 'Selecione o ano';
      toast.error('Selecione o mês e ano da folha de pagamento');
    }

    // Validação baseada no tipo de colaborador
    if (isRegisteredEmployee) {
      if (!formData.colaborador_id) {

        errors.colaborador_id = 'Selecione um funcionário';
        toast.error('Por favor, selecione um funcionário da lista para continuar');
      }
      if (!formData.nome_funcionario) {

        errors.nome_funcionario = 'Nome do funcionário não encontrado';
        toast.error('Não foi possível obter os dados do funcionário selecionado. Tente selecionar novamente');
      }
    } else {
      if (!formData.nome_colaborador?.trim()) {

        errors.nome_colaborador = 'Nome é obrigatório';
        toast.error('Informe o nome completo do colaborador');
      }
      if (!formData.cpf_colaborador?.trim()) {

        errors.cpf_colaborador = 'CPF é obrigatório';
        toast.error('Informe o CPF do colaborador');
      } else {
        // Validação básica de CPF (apenas formato)
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
        if (!cpfRegex.test(formData.cpf_colaborador)) {

          errors.cpf_colaborador = 'CPF deve ter 11 dígitos ou formato 000.000.000-00';
          toast.error('CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos');
        }
      }
      if (!formData.unidade) {

        errors.unidade = 'Selecione uma unidade';
        toast.error('Selecione a unidade do colaborador');
      }
    }

    if (!formData.classificacao) {

      errors.classificacao = 'Selecione uma classificação';
      toast.error('Selecione a classificação do colaborador (CLT, PJ, etc.)');
    }

    if (!formData.funcao?.trim()) {

      errors.funcao = 'Função é obrigatória';
      toast.error('Informe a função/cargo do colaborador');
    }

    if (!user?.id) {

      toast.error('Sua sessão expirou. Faça login novamente para continuar');
      return;
    }

    // Validação de valores financeiros
    if (formData.salario_base < 0) {

      errors.salario_base = 'Valor não pode ser negativo';
      toast.error('O salário base não pode ser negativo');
    }

    // Validação adicional de valores negativos
    const financialFields = [
      { field: 'bonus', name: 'Bônus' },
      { field: 'comissao', name: 'Comissão' },
      { field: 'passagem', name: 'Passagem' },
      { field: 'reembolso', name: 'Reembolso' },
      { field: 'transport_voucher', name: 'Vale Transporte' }
    ];

    for (const { field, name } of financialFields) {
      if (formData[field as keyof typeof formData] < 0) {

        errors[field] = 'Valor não pode ser negativo';
        toast.error(`O valor de ${name} não pode ser negativo`);
      }
    }

    // Se há erros, definir no estado e parar
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }


    setLoading(true);
    
    try {
      console.log('NewPayrollEntryDialog - formData.unidade antes de enviar:', formData.unidade);
      console.log('NewPayrollEntryDialog - defaultUnit no momento do envio:', defaultUnit);

      const payrollData = {
        // Para colaborador cadastrado
        ...(isRegisteredEmployee && { 
          colaborador_id: formData.colaborador_id,
          unidade: formData.unidade
        }),
        
        // Para colaborador não cadastrado
        ...(!isRegisteredEmployee && {
          nome_colaborador: formData.nome_colaborador,
          cpf_colaborador: formData.cpf_colaborador,
          unidade: formData.unidade
        }),
        
        mes: formData.mes,
        ano: formData.ano,
        classificacao: formData.classificacao,
        funcao: formData.funcao,
        salario_base: formData.salario_base,
        bonus: formData.bonus,
        comissao: formData.comissao,
        passagem: formData.passagem,
        reembolso: formData.reembolso,
        inss: formData.inss,
        lojinha: formData.lojinha,
        bistro: formData.bistro,
        adiantamento: formData.adiantamento,
        outros_descontos: formData.outros_descontos,
        transport_voucher: formData.transport_voucher,
        salary_advance: formData.salary_advance,
        banco: formData.banco,
        agencia: formData.agencia,
        conta: formData.conta,
        pix: formData.pix,
        observacoes: formData.observacoes
      };
      
      console.log('NewPayrollEntryDialog - payrollData completo:', payrollData);
      
      await payrollService.createPayrollEntry(payrollData);
      

      toast.success('Folha de pagamento criada com sucesso!');
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Tratamento de erros específicos de forma genérica
      let errorMessage = 'Não foi possível criar a folha de pagamento';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
          errorMessage = 'Já existe uma folha de pagamento para este colaborador no período selecionado';
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente';
        } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized')) {
          errorMessage = 'Você não tem permissão para realizar esta operação';
        } else if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
          errorMessage = 'Alguns dados informados são inválidos. Verifique e tente novamente';
        } else if (errorMsg.includes('timeout')) {
          errorMessage = 'A operação demorou muito para ser concluída. Tente novamente';
        }
      }
      
      toast.error(errorMessage);
    } finally {

      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsRegisteredEmployee(true);
    setFieldErrors({}); // Limpar erros ao resetar o formulário
    setFormData({
      // Dados pessoais
      colaborador_id: '',
      nome_funcionario: '',
      cpf_funcionario: '',
      unidade: defaultUnit || '',
      departamento: '',
      
      // Dados para colaborador não cadastrado
      nome_colaborador: '',
      cpf_colaborador: '',
      
      // Dados do período
      mes: defaultMonth ? parseInt(defaultMonth) : new Date().getMonth() + 1,
      ano: defaultYear ? parseInt(defaultYear) : new Date().getFullYear(),
      
      // Dados profissionais
      classificacao: '',
      funcao: '',
      
      // Valores financeiros
      salario_base: 0,
      bonus: 0,
      comissao: 0,
      passagem: 0,
      reembolso: 0,
      inss: 0,
      lojinha: 0,
      bistro: 0,
      adiantamento: 0,
      outros_descontos: 0,
      transport_voucher: 0,
      salary_advance: 0,
      
      // Dados bancários
      banco: '',
      agencia: '',
      conta: '',
      pix: '',
      
      // Observações
      observacoes: ''
    });
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf_funcionario: formatted }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg gap-2">
            <Plus className="h-4 w-4 text-black" />
            Nova Folha
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Folha de Pagamento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova folha de pagamento
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção do tipo de colaborador */}
              <div className="space-y-2">
                <Label>Tipo de Colaborador *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="employeeType"
                      checked={isRegisteredEmployee}
                      onChange={() => {
                        setIsRegisteredEmployee(true);
                        setFormData(prev => ({
                          ...prev,
                          colaborador_id: '',
                          nome_funcionario: '',
                          cpf_funcionario: '',
                          nome_colaborador: '',
                          cpf_colaborador: ''
                        }));
                      }}
                      className="text-blue-600"
                    />
                    <span>Colaborador Cadastrado</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="employeeType"
                      checked={!isRegisteredEmployee}
                      onChange={() => {
                        setIsRegisteredEmployee(false);
                        setFormData(prev => ({
                          ...prev,
                          colaborador_id: '',
                          nome_funcionario: '',
                          cpf_funcionario: ''
                        }));
                      }}
                      className="text-blue-600"
                    />
                    <span>Colaborador Não Cadastrado</span>
                  </label>
                </div>
              </div>

              {/* Campos para colaborador cadastrado */}
              {isRegisteredEmployee && (
                <>
                  <div>
                    <Label htmlFor="colaborador_id">Colaborador *</Label>
                    <Select
                      value={formData.colaborador_id}
                      onValueChange={handleEmployeeSelect}
                      disabled={loadingEmployees}
                    >
                      <SelectTrigger className={fieldErrors.colaborador_id ? "border-red-500" : ""}>
                        <SelectValue placeholder={loadingEmployees ? "Carregando funcionários..." : "Selecione um funcionário"} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex flex-col">
                              <span>{employee.nome}</span>
                              <span className="text-xs text-gray-500">
                                {employee.cargo} - {employee.unidade}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.colaborador_id && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.colaborador_id}</p>
                    )}
                  </div>
                  {formData.colaborador_id && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input
                          value={formData.nome_funcionario}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input
                          value={formData.cpf_funcionario}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Campos para colaborador não cadastrado */}
              {!isRegisteredEmployee && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_colaborador">Nome Completo *</Label>
                    <Input
                      id="nome_colaborador"
                      value={formData.nome_colaborador}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome_colaborador: e.target.value }))}
                      placeholder="Digite o nome completo"
                      className={fieldErrors.nome_colaborador ? "border-red-500" : ""}
                    />
                    {fieldErrors.nome_colaborador && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.nome_colaborador}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf_colaborador">CPF *</Label>
                    <Input
                      id="cpf_colaborador"
                      value={formData.cpf_colaborador}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpf_colaborador: e.target.value }))}
                      placeholder="000.000.000-00"
                      className={fieldErrors.cpf_colaborador ? "border-red-500" : ""}
                    />
                    {fieldErrors.cpf_colaborador && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.cpf_colaborador}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados Organizacionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                Dados Organizacionais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade *</Label>
                <Select value={formData.unidade} onValueChange={(value) => setFormData(prev => ({ ...prev, unidade: value }))}>
                  <SelectTrigger className={fieldErrors.unidade ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.unidade && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.unidade}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select 
                  value={formData.departamento} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, departamento: value }))}
                  disabled={loadingDepartments}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDepartments ? "Carregando departamentos..." : "Selecione o departamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classificacao">Classificação *</Label>
                <Select value={formData.classificacao} onValueChange={(value) => setFormData(prev => ({ ...prev, classificacao: value }))}>
                  <SelectTrigger className={fieldErrors.classificacao ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSIFICATIONS.map(classification => (
                      <SelectItem key={classification} value={classification}>{classification}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.classificacao && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.classificacao}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="funcao">Função *</Label>
                <Input
                  id="funcao"
                  value={formData.funcao}
                  onChange={(e) => setFormData(prev => ({ ...prev, funcao: e.target.value }))}
                  placeholder="Digite a função"
                  required
                  className={fieldErrors.funcao ? "border-red-500" : ""}
                />
                {fieldErrors.funcao && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.funcao}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <Select value={formData.mes.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, mes: parseInt(value) }))}>
                  <SelectTrigger className={fieldErrors.mes ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.mes && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.mes}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  value={formData.ano}
                  onChange={(e) => setFormData(prev => ({ ...prev, ano: parseInt(e.target.value) || new Date().getFullYear() }))}
                  min={2020}
                  max={2030}
                  className={fieldErrors.ano ? "border-red-500" : ""}
                />
                {fieldErrors.ano && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.ano}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Valores Financeiros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Valores Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salario_base">Salário Base</Label>
                <Input
                  id="salario_base"
                  type="number"
                  step="0.01"
                  value={formData.salario_base === 0 ? '' : formData.salario_base}
                  onChange={(e) => setFormData(prev => ({ ...prev, salario_base: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                  className={fieldErrors.salario_base ? "border-red-500" : ""}
                />
                {fieldErrors.salario_base && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.salario_base}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonus">Bônus</Label>
                <Input
                  id="bonus"
                  type="number"
                  step="0.01"
                  value={formData.bonus === 0 ? '' : formData.bonus}
                  onChange={(e) => setFormData(prev => ({ ...prev, bonus: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comissao">Comissão</Label>
                <Input
                  id="comissao"
                  type="number"
                  step="0.01"
                  value={formData.comissao === 0 ? '' : formData.comissao}
                  onChange={(e) => setFormData(prev => ({ ...prev, comissao: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passagem">Passagem</Label>
                <Input
                  id="passagem"
                  type="number"
                  step="0.01"
                  value={formData.passagem === 0 ? '' : formData.passagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, passagem: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reembolso">Reembolso</Label>
                <Input
                  id="reembolso"
                  type="number"
                  step="0.01"
                  value={formData.reembolso === 0 ? '' : formData.reembolso}
                  onChange={(e) => setFormData(prev => ({ ...prev, reembolso: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transport_voucher">Vale Transporte</Label>
                <Input
                  id="transport_voucher"
                  type="number"
                  step="0.01"
                  value={formData.transport_voucher === 0 ? '' : formData.transport_voucher}
                  onChange={(e) => setFormData(prev => ({ ...prev, transport_voucher: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Descontos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Descontos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inss">INSS</Label>
                <Input
                  id="inss"
                  type="number"
                  step="0.01"
                  value={formData.inss === 0 ? '' : formData.inss}
                  onChange={(e) => setFormData(prev => ({ ...prev, inss: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lojinha">Lojinha</Label>
                <Input
                  id="lojinha"
                  type="number"
                  step="0.01"
                  value={formData.lojinha === 0 ? '' : formData.lojinha}
                  onChange={(e) => setFormData(prev => ({ ...prev, lojinha: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bistro">Bistrô</Label>
                <Input
                  id="bistro"
                  type="number"
                  step="0.01"
                  value={formData.bistro === 0 ? '' : formData.bistro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bistro: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adiantamento">Adiantamento</Label>
                <Input
                  id="adiantamento"
                  type="number"
                  step="0.01"
                  value={formData.adiantamento === 0 ? '' : formData.adiantamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, adiantamento: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary_advance">Adiantamento Salarial</Label>
                <Input
                  id="salary_advance"
                  type="number"
                  step="0.01"
                  value={formData.salary_advance === 0 ? '' : formData.salary_advance}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary_advance: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="outros_descontos">Outros Descontos</Label>
                <Input
                  id="outros_descontos"
                  type="number"
                  step="0.01"
                  value={formData.outros_descontos === 0 ? '' : formData.outros_descontos}
                  onChange={(e) => setFormData(prev => ({ ...prev, outros_descontos: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados Bancários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Dados Bancários
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  value={formData.banco}
                  onChange={(e) => setFormData(prev => ({ ...prev, banco: e.target.value }))}
                  placeholder="Nome do banco"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  value={formData.agencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, agencia: e.target.value }))}
                  placeholder="0000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  value={formData.conta}
                  onChange={(e) => setFormData(prev => ({ ...prev, conta: e.target.value }))}
                  placeholder="00000-0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pix">PIX</Label>
                <Input
                  id="pix"
                  value={formData.pix}
                  onChange={(e) => setFormData(prev => ({ ...prev, pix: e.target.value }))}
                  placeholder="Chave PIX"
                />
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </CardContent>
          </Card>

          <Separator />
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Folha de Pagamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}