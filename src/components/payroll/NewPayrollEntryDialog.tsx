import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface NewPayrollEntryDialogProps {
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
  defaultMonth?: string;
  defaultYear?: string;
  defaultUnit?: string;
}

const UNITS = [
  'recreio',
  'cg-emla',
  'cg-lamk',
  'barra',
  'staff-rateado',
  'professores-multi-unidade'
];

const DEPARTMENTS = [
  'Coordenação',
  'Gestão',
  'Professores',
  'Administrativo',
  'Limpeza',
  'Segurança',
  'Recepção'
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome_funcionario: '',
    cpf_funcionario: '',
    unidade: defaultUnit || '',
    departamento: '',
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_funcionario || !formData.cpf_funcionario || !formData.unidade || !formData.classificacao || !formData.funcao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setLoading(true);
    
    try {
      // Usar o ID do usuário logado como colaborador_id
      const payrollData = {
        colaborador_id: user.id,
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
        observacoes: formData.observacoes
      };
      
      await payrollService.createPayrollEntry(payrollData);
      toast.success('Registro de folha de pagamento salvo com sucesso!');
      setOpen(false);
      setFormData({
        nome_funcionario: '',
        cpf_funcionario: '',
        unidade: '',
        departamento: '',
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        classificacao: '',
        funcao: '',
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
        banco: '',
        agencia: '',
        conta: '',
        pix: '',
        observacoes: ''
      });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar registro:', error);
      toast.error('Erro ao criar registro de folha de pagamento');
    } finally {
      setLoading(false);
    }
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_funcionario">Nome Completo *</Label>
                <Input
                  id="nome_funcionario"
                  value={formData.nome_funcionario}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_funcionario: e.target.value }))}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf_funcionario">CPF *</Label>
                <Input
                  id="cpf_funcionario"
                  value={formData.cpf_funcionario}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>
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
                  <SelectTrigger>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select value={formData.departamento} onValueChange={(value) => setFormData(prev => ({ ...prev, departamento: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classificacao">Classificação *</Label>
                <Select value={formData.classificacao} onValueChange={(value) => setFormData(prev => ({ ...prev, classificacao: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSIFICATIONS.map(classification => (
                      <SelectItem key={classification} value={classification}>{classification}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="funcao">Função *</Label>
                <Input
                  id="funcao"
                  value={formData.funcao}
                  onChange={(e) => setFormData(prev => ({ ...prev, funcao: e.target.value }))}
                  placeholder="Digite a função"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <Select value={formData.mes.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, mes: parseInt(value) }))}>
                  <SelectTrigger>
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
                />
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
                  value={formData.salario_base}
                  onChange={(e) => setFormData(prev => ({ ...prev, salario_base: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bonus">Bônus</Label>
                <Input
                  id="bonus"
                  type="number"
                  step="0.01"
                  value={formData.bonus}
                  onChange={(e) => setFormData(prev => ({ ...prev, bonus: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comissao">Comissão</Label>
                <Input
                  id="comissao"
                  type="number"
                  step="0.01"
                  value={formData.comissao}
                  onChange={(e) => setFormData(prev => ({ ...prev, comissao: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passagem">Passagem</Label>
                <Input
                  id="passagem"
                  type="number"
                  step="0.01"
                  value={formData.passagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, passagem: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reembolso">Reembolso</Label>
                <Input
                  id="reembolso"
                  type="number"
                  step="0.01"
                  value={formData.reembolso}
                  onChange={(e) => setFormData(prev => ({ ...prev, reembolso: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transport_voucher">Vale Transporte</Label>
                <Input
                  id="transport_voucher"
                  type="number"
                  step="0.01"
                  value={formData.transport_voucher}
                  onChange={(e) => setFormData(prev => ({ ...prev, transport_voucher: parseFloat(e.target.value) || 0 }))}
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
                  value={formData.inss}
                  onChange={(e) => setFormData(prev => ({ ...prev, inss: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lojinha">Lojinha</Label>
                <Input
                  id="lojinha"
                  type="number"
                  step="0.01"
                  value={formData.lojinha}
                  onChange={(e) => setFormData(prev => ({ ...prev, lojinha: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bistro">Bistrô</Label>
                <Input
                  id="bistro"
                  type="number"
                  step="0.01"
                  value={formData.bistro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bistro: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adiantamento">Adiantamento</Label>
                <Input
                  id="adiantamento"
                  type="number"
                  step="0.01"
                  value={formData.adiantamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, adiantamento: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary_advance">Adiantamento Salarial</Label>
                <Input
                  id="salary_advance"
                  type="number"
                  step="0.01"
                  value={formData.salary_advance}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary_advance: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="outros_descontos">Outros Descontos</Label>
                <Input
                  id="outros_descontos"
                  type="number"
                  step="0.01"
                  value={formData.outros_descontos}
                  onChange={(e) => setFormData(prev => ({ ...prev, outros_descontos: parseFloat(e.target.value) || 0 }))}
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