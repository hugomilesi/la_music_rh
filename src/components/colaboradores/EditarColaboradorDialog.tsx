import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { colaboradorService } from '@/services/colaboradorService';
import { fetchRoles, fetchDepartments, Role, Department } from '@/services/rolesService';
import { 
  Colaborador,
  AtualizarColaborador,
  UnidadeColaborador,
  TipoContratacao,
  TipoConta,
  StatusColaborador,
  UNIDADES_OPTIONS,
  TIPOS_CONTRATACAO_OPTIONS,
  TIPOS_CONTA_OPTIONS,
  STATUS_OPTIONS,
  formatCPF,
  isValidCPF,
  isValidEmail
} from '@/types/colaborador';

interface EditarColaboradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaborador: Colaborador;
  onColaboradorAtualizado: () => void;
}

export const EditarColaboradorDialog: React.FC<EditarColaboradorDialogProps> = ({
  open,
  onOpenChange,
  colaborador,
  onColaboradorAtualizado
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AtualizarColaborador>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Carregar dados de cargos e departamentos
  const loadRolesAndDepartments = async () => {
    try {
      setLoadingData(true);
      const [rolesData, departmentsData] = await Promise.all([
        fetchRoles(),
        fetchDepartments()
      ]);
      setRoles(rolesData.filter(role => role.is_active !== false));
      setDepartments(departmentsData.filter(dept => dept.is_active !== false));
    } catch (error) {
      console.error('Erro ao carregar cargos e departamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de cargos e departamentos.',
        variant: 'destructive'
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    if (open) {
      loadRolesAndDepartments();
    }
  }, [open]);

  // Inicializar formulário com dados do colaborador
  useEffect(() => {
    if (colaborador && open) {
      setFormData({
        nome: colaborador.nome || '',
        email: colaborador.email || '',
        telefone: colaborador.telefone || '',
        cpf: colaborador.cpf || '',
        cargo: colaborador.cargo || '',
        departamento: colaborador.departamento || '',
        unidade: colaborador.unidade || 'campo_grande',
        tipo_contratacao: colaborador.tipo_contratacao || 'clt',
        status: colaborador.status || 'ativo',
        data_admissao: colaborador.data_admissao || '',
        data_nascimento: colaborador.data_nascimento || '',
        endereco: colaborador.endereco || '',
        banco: colaborador.banco || '',
        agencia: colaborador.agencia || '',
        conta: colaborador.conta || '',
        tipo_conta: colaborador.tipo_conta
      });
      setErrors({});
    }
  }, [colaborador, open]);
  
  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Campos obrigatórios
    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.cpf?.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!formData.cargo?.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }
    
    if (!formData.departamento?.trim()) {
      newErrors.departamento = 'Departamento é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Verificar duplicatas (excluindo o colaborador atual)
  const checkDuplicates = async (): Promise<boolean> => {
    try {
      const promises = [];
      
      // Verificar email apenas se foi alterado
      if (formData.email && formData.email !== colaborador.email) {
        promises.push(colaboradorService.emailJaExiste(formData.email, colaborador.id));
      } else {
        promises.push(Promise.resolve(false));
      }
      
      // Verificar CPF apenas se foi alterado
      if (formData.cpf && formData.cpf !== colaborador.cpf) {
        promises.push(colaboradorService.cpfJaExiste(formData.cpf, colaborador.id));
      } else {
        promises.push(Promise.resolve(false));
      }
      
      const [emailExists, cpfExists] = await Promise.all(promises);
      
      const newErrors: Record<string, string> = {};
      
      if (emailExists) {
        newErrors.email = 'Este email já está cadastrado';
      }
      
      if (cpfExists) {
        newErrors.cpf = 'Este CPF já está cadastrado';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...newErrors }));
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      toast({
        title: "Erro",
        description: "Erro ao validar dados. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Verificar duplicatas
      const noDuplicates = await checkDuplicates();
      if (!noDuplicates) {
        setLoading(false);
        return;
      }
      
      // Atualizar colaborador
      await colaboradorService.atualizarColaborador(colaborador.id, formData);
      
      toast({
        title: "Sucesso",
        description: `Colaborador ${formData.nome} atualizado com sucesso.`,
      });
      
      // Notificar parent component
      onColaboradorAtualizado();
      
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar colaborador. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Atualizar campo do formulário
  const updateField = (field: keyof AtualizarColaborador, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Formatar CPF enquanto digita
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedCPF = formatCPF(value);
    updateField('cpf', formattedCPF);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Colaborador</DialogTitle>
          <DialogDescription>
            Edite as informações do colaborador {colaborador.nome}. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome || ''}
                  onChange={(e) => updateField('nome', e.target.value)}
                  className={errors.nome ? 'border-red-500' : ''}
                  placeholder="Digite o nome completo"
                />
                {errors.nome && (
                  <p className="text-sm text-red-500 mt-1">{errors.nome}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf || ''}
                  onChange={handleCPFChange}
                  className={errors.cpf ? 'border-red-500' : ''}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Profissionais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                {loadingData ? (
                  <div className="h-10 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-sm text-gray-500">Carregando cargos...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.cargo || ''}
                    onValueChange={(value) => updateField('cargo', value)}
                  >
                    <SelectTrigger className={errors.cargo ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.cargo && (
                  <p className="text-sm text-red-500 mt-1">{errors.cargo}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="departamento">Departamento *</Label>
                {loadingData ? (
                  <div className="h-10 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-sm text-gray-500">Carregando departamentos...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.departamento || ''}
                    onValueChange={(value) => updateField('departamento', value)}
                  >
                    <SelectTrigger className={errors.departamento ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.departamento && (
                  <p className="text-sm text-red-500 mt-1">{errors.departamento}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="unidade">Unidade *</Label>
                <Select
                  value={formData.unidade || ''}
                  onValueChange={(value) => updateField('unidade', value as UnidadeColaborador)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tipo_contratacao">Tipo de Contratação *</Label>
                <Select
                  value={formData.tipo_contratacao || ''}
                  onValueChange={(value) => updateField('tipo_contratacao', value as TipoContratacao)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CONTRATACAO_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(value) => updateField('status', value as StatusColaborador)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Informações Bancárias */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Bancárias (Opcional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  value={formData.banco || ''}
                  onChange={(e) => updateField('banco', e.target.value)}
                  placeholder="Ex: Banco do Brasil, Itaú, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  value={formData.agencia || ''}
                  onChange={(e) => updateField('agencia', e.target.value)}
                  placeholder="Ex: 1234-5"
                />
              </div>
              
              <div>
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  value={formData.conta || ''}
                  onChange={(e) => updateField('conta', e.target.value)}
                  placeholder="Ex: 12345-6"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_conta">Tipo de Conta</Label>
                <Select
                  value={formData.tipo_conta || 'nao_informado'}
                  onValueChange={(value) => updateField('tipo_conta', value === 'nao_informado' ? undefined : value as TipoConta)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao_informado">Não informado</SelectItem>
                    {TIPOS_CONTA_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};