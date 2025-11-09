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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { colaboradorService } from '@/services/colaboradorService';
import { unidadeService } from '@/services/unidadeService';
import { supabase } from '@/lib/supabase';
import { 
  NovoColaborador,
  UnidadeColaborador,
  TipoContratacao,
  TipoConta,
  StatusColaborador,
  Unidade,
  UNIDADES_OPTIONS,
  TIPOS_CONTRATACAO_OPTIONS,
  TIPOS_CONTA_OPTIONS,
  formatCPF,
  isValidCPF,
  isValidEmail
} from '@/types/colaborador';

interface NovoColaboradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onColaboradorCriado: () => void;
}

interface Cargo {
  name: string;
  description: string;
}

interface Departamento {
  id: string;
  name: string;
}

export const NovoColaboradorDialog: React.FC<NovoColaboradorDialogProps> = ({
  open,
  onOpenChange,
  onColaboradorCriado
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState<NovoColaborador>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    cargo: '',
    departamento: '',
    dataAdmissao: '',
    unidade_ids: [],
    tipo_contratacao: TipoContratacao.CLT,
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: TipoConta.CORRENTE,
    status: StatusColaborador.ATIVO
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Campos obrigatórios
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }
    
    if (!formData.departamento.trim()) {
      newErrors.departamento = 'Departamento é obrigatório';
    }
    
    if (!formData.unidade_ids || formData.unidade_ids.length === 0) {
      newErrors.unidade_ids = 'Pelo menos uma unidade deve ser selecionada';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Verificar duplicatas
  const checkDuplicates = async (): Promise<boolean> => {
    try {
      const [emailExists, cpfExists] = await Promise.all([
        colaboradorService.emailJaExiste(formData.email),
        colaboradorService.cpfJaExiste(formData.cpf)
      ]);
      
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
      
      // Criar colaborador
      await colaboradorService.criarColaborador(formData);
      
      toast({
        title: "Sucesso",
        description: `Colaborador ${formData.nome} criado com sucesso.`,
      });
      
      // Resetar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        cargo: '',
        departamento: '',
        dataAdmissao: '',
        unidade_ids: [],
        tipo_contratacao: TipoContratacao.CLT,
        banco: '',
        agencia: '',
        conta: '',
        tipo_conta: TipoConta.CORRENTE,
        status: StatusColaborador.ATIVO
      });
      setErrors({});
      
      // Notificar parent component
      onColaboradorCriado();
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar colaborador. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Atualizar campo do formulário
  const updateField = (field: keyof NovoColaborador, value: any) => {
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
  
  // Carregar cargos, departamentos e unidades do banco
  useEffect(() => {
    if (open) {
      loadDadosFormulario();
    }
  }, [open]);

  const loadDadosFormulario = async () => {
    setLoadingData(true);
    try {
      // Carregar dados em paralelo
      const [cargosData, departamentosData, unidadesData] = await Promise.all([
        supabase
          .from('roles')
          .select('name, description')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('departments')
          .select('id, name')
          .order('name'),
        unidadeService.getUnidadesAtivas()
      ]);

      // Processar cargos
      if (cargosData.error) {
        console.error('Erro ao carregar cargos:', cargosData.error);
      } else {
        setCargos(cargosData.data || []);
      }

      // Processar departamentos
      if (departamentosData.error) {
        console.error('Erro ao carregar departamentos:', departamentosData.error);
      } else {
        setDepartamentos(departamentosData.data || []);
      }

      // Processar unidades
      setUnidades(unidadesData);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do formulário.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Colaborador</DialogTitle>
          <DialogDescription>
            Cadastre um novo colaborador no sistema. Campos marcados com * são obrigatórios.
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
                  value={formData.nome}
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
                  value={formData.email}
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
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  className={errors.cpf ? 'border-red-500' : ''}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone || ''}
                  onChange={(e) => updateField('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>
          
          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Profissionais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                <Select
                  value={formData.cargo}
                  onValueChange={(value) => updateField('cargo', value)}
                  disabled={loadingData}
                >
                  <SelectTrigger className={errors.cargo ? 'border-red-500' : ''}>
                    <SelectValue placeholder={loadingData ? "Carregando cargos..." : "Selecione um cargo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.name} value={cargo.name}>
                        <div className="flex flex-col">
                          <span className="font-medium">{cargo.name}</span>
                          {cargo.description && (
                            <span className="text-xs text-gray-500">{cargo.description}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cargo && (
                  <p className="text-sm text-red-500 mt-1">{errors.cargo}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="departamento">Departamento *</Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(value) => updateField('departamento', value)}
                  disabled={loadingData}
                >
                  <SelectTrigger className={errors.departamento ? 'border-red-500' : ''}>
                    <SelectValue placeholder={loadingData ? "Carregando departamentos..." : "Selecione um departamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((departamento) => (
                      <SelectItem key={departamento.id} value={departamento.name}>
                        {departamento.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departamento && (
                  <p className="text-sm text-red-500 mt-1">{errors.departamento}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <Label>Unidades *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  {unidades.map((unidade) => (
                    <div key={unidade.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`unidade-${unidade.id}`}
                        checked={formData.unidade_ids.includes(unidade.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newUnidadeIds = isChecked
                            ? [...formData.unidade_ids, unidade.id]
                            : formData.unidade_ids.filter(id => id !== unidade.id);
                          updateField('unidade_ids', newUnidadeIds);
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`unidade-${unidade.id}`} className="text-sm font-normal">
                        {unidade.nome}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.unidade_ids && (
                  <p className="text-sm text-red-500 mt-1">{errors.unidade_ids}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="tipo_contratacao">Tipo de Contratação *</Label>
                <Select
                  value={formData.tipo_contratacao}
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
                  value={formData.tipo_conta || ''}
                  onValueChange={(value) => updateField('tipo_conta', value as TipoConta)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
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
              {loading ? 'Criando...' : 'Criar Colaborador'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};