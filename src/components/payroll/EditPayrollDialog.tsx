
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Building, DollarSign, CreditCard, Edit } from 'lucide-react';
import type { Payroll } from '@/types/payroll';

interface EditPayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: Payroll | null;
  onUpdatePayroll: (updates: Partial<Payroll>) => void;
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

export function EditPayrollDialog({
  open,
  onOpenChange,
  payroll,
  onUpdatePayroll
}: EditPayrollDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome_funcionario: '',
    cpf_funcionario: '',
    unidade: '',
    departamento: '',
    
    // Dados do período
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    
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
    observacoes: '',
    status: 'draft' as 'draft' | 'approved' | 'paid'
  });

  useEffect(() => {
    if (payroll) {
      setFormData({
        nome_funcionario: payroll.employee?.name || '',
        cpf_funcionario: payroll.employee?.cpf || '',
        unidade: payroll.unit || '',
        departamento: payroll.department || '',
        mes: payroll.month,
        ano: payroll.year,
        classificacao: payroll.classification || '',
        funcao: payroll.position || '',
        salario_base: payroll.base_salary || 0,
        bonus: payroll.bonus || 0,
        comissao: payroll.commission || 0,
        passagem: payroll.transport || 0,
        reembolso: payroll.reimbursement || 0,
        inss: payroll.inss || 0,
        lojinha: payroll.store_discount || 0,
        bistro: payroll.bistro_discount || 0,
        adiantamento: payroll.advance || 0,
        outros_descontos: payroll.other_discounts || 0,
        transport_voucher: payroll.transport_voucher || 0,
        salary_advance: payroll.salary_advance || 0,
        banco: payroll.bank || '',
        agencia: payroll.agency || '',
        conta: payroll.account || '',
        pix: payroll.pix || '',
        observacoes: payroll.notes || '',
        status: payroll.status
      });
    }
  }, [payroll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payroll) return;

    setLoading(true);
    
    try {
      const updates = {
        id: payroll.id,
        employee: {
          ...payroll.employee,
          name: formData.nome_funcionario,
          cpf: formData.cpf_funcionario
        },
        unit: formData.unidade,
        department: formData.departamento,
        month: formData.mes,
        year: formData.ano,
        classification: formData.classificacao,
        position: formData.funcao,
        base_salary: formData.salario_base,
        bonus: formData.bonus,
        commission: formData.comissao,
        transport: formData.passagem,
        reimbursement: formData.reembolso,
        inss: formData.inss,
        store_discount: formData.lojinha,
        bistro_discount: formData.bistro,
        advance: formData.adiantamento,
        other_discounts: formData.outros_descontos,
        transport_voucher: formData.transport_voucher,
        salary_advance: formData.salary_advance,
        bank: formData.banco,
        agency: formData.agencia,
        account: formData.conta,
        pix: formData.pix,
        notes: formData.observacoes,
        status: formData.status
      };
      
      onUpdatePayroll(updates);
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent component
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

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  if (!payroll) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Folha de Pagamento - {getMonthName(payroll.month)}/{payroll.year}
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

          {/* Status e Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status e Observações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'approved' | 'paid') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
}
