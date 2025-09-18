import React, { useState, useEffect } from 'react';
import { PayrollEntry } from '../types/payroll';
import { usePayrollCrud, PayrollEntryInput } from '../hooks/usePayrollCrud';
import { employeeService } from '../services/employeeService';

interface Employee {
  auth_user_id: string;
  username: string;
  cpf: string;
  units: string;
  department: string;
}

interface PayrollEntryFormProps {
  entry?: PayrollEntry;
  onSave: (entry: PayrollEntry) => void;
  onCancel: () => void;
  payrollId?: string;
  month?: number;
  year?: number;
}

const PayrollEntryForm: React.FC<PayrollEntryFormProps> = ({
  entry,
  onSave,
  onCancel,
  payrollId,
  month,
  year
}) => {
  const { createEntry, updateEntry, upsertEntry, loading, error, clearError } = usePayrollCrud();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  
  const [isRegisteredEmployee, setIsRegisteredEmployee] = useState(!!entry?.colaborador_id);
  const [formData, setFormData] = useState<PayrollEntryInput>({
    colaborador_id: entry?.colaborador_id || '',
    mes: entry?.mes || month || new Date().getMonth() + 1,
    ano: entry?.ano || year || new Date().getFullYear(),
    classificacao: entry?.classificacao || '',
    funcao: entry?.funcao || '',
    salario_base: entry?.salario_base || 0,
    bonus: entry?.bonus || 0,
    comissao: entry?.comissao || 0,
    passagem: entry?.passagem || 0,
    reembolso: entry?.reembolso || 0,
    inss: entry?.inss || 0,
    lojinha: entry?.lojinha || 0,
    bistro: entry?.bistro || 0,
    adiantamento: entry?.adiantamento || 0,
    outros_descontos: entry?.outros_descontos || 0,
    observacoes: entry?.observacoes || '',
    payroll_id: entry?.payroll_id || payrollId,
    nome_colaborador: entry?.nome_colaborador || '',
    cpf_colaborador: entry?.cpf_colaborador || '',
    unidade: entry?.unidade || ''
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeeData = await employeeService.getEmployees();
        setEmployees(employeeData);
      } catch (err) {
        // Log desabilitado: Erro ao carregar funcionários
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    if (entry) {
      setFormData({
        id: entry.id,
        colaborador_id: entry.colaborador_id || '',
        mes: entry.mes || month || new Date().getMonth() + 1,
        ano: entry.ano || year || new Date().getFullYear(),
        classificacao: entry.classificacao || '',
        funcao: entry.funcao || '',
        salario_base: entry.salario_base || 0,
        bonus: entry.bonus || 0,
        comissao: entry.comissao || 0,
        passagem: entry.passagem || 0,
        reembolso: entry.reembolso || 0,
        inss: entry.inss || 0,
        lojinha: entry.lojinha || 0,
        bistro: entry.bistro || 0,
        adiantamento: entry.adiantamento || 0,
        outros_descontos: entry.outros_descontos || 0,
        observacoes: entry.observacoes || '',
        payroll_id: entry.payroll_id || payrollId,
        nome_colaborador: entry.nome_colaborador || '',
        cpf_colaborador: entry.cpf_colaborador || '',
        unidade: entry.unidade || ''
      });
    }
  }, [entry, month, year, payrollId]);

  const handleInputChange = (field: keyof PayrollEntryInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on employee type
    if (isRegisteredEmployee && !formData.colaborador_id) {
      alert('Por favor, selecione um colaborador cadastrado');
      return;
    }
    
    if (!isRegisteredEmployee && (!formData.nome_colaborador || !formData.cpf_colaborador || !formData.unidade)) {
      alert('Por favor, preencha todos os dados do colaborador (nome, CPF e unidade)');
      return;
    }
    
    try {
      let result: PayrollEntry | null;
      
      if (entry?.id) {
        // Update existing entry
        result = await updateEntry(entry.id, {
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
          notes: formData.observacoes,
          classification: formData.classificacao,
          role: formData.funcao
        });
      } else {
        // Create new entry
        result = await createEntry(formData);
      }
      
      if (result) {
        onSave(result);
      }
    } catch (err) {
      // Log desabilitado: Erro ao salvar entrada
    }
  };

  const calculateTotal = () => {
    const earnings = formData.salario_base + (formData.bonus || 0) + (formData.comissao || 0) + (formData.passagem || 0) + (formData.reembolso || 0);
    const deductions = (formData.inss || 0) + (formData.lojinha || 0) + (formData.bistro || 0) + (formData.adiantamento || 0) + (formData.outros_descontos || 0);
    return earnings - deductions;
  };

  const selectedEmployee = employees.find(emp => emp.auth_user_id === formData.colaborador_id);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {entry ? 'Editar Entrada da Folha' : 'Nova Entrada da Folha'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Type Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Colaborador *
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employeeType"
                  checked={isRegisteredEmployee}
                  onChange={() => {
                    setIsRegisteredEmployee(true);
                    setFormData({ 
                      ...formData, 
                      colaborador_id: '',
                      nome_colaborador: '',
                      cpf_colaborador: '',
                      unidade: ''
                    });
                  }}
                  className="mr-2"
                  disabled={!!entry}
                />
                Colaborador Cadastrado
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="employeeType"
                  checked={!isRegisteredEmployee}
                  onChange={() => {
                    setIsRegisteredEmployee(false);
                    setFormData({ 
                      ...formData, 
                      colaborador_id: undefined
                    });
                  }}
                  className="mr-2"
                  disabled={!!entry}
                />
                Colaborador Não Cadastrado
              </label>
            </div>
          </div>

          {/* Employee Selection for Registered */}
          {isRegisteredEmployee && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funcionário *
              </label>
              <select
                value={formData.colaborador_id}
                onChange={(e) => handleInputChange('colaborador_id', e.target.value)}
                required
                disabled={loadingEmployees || !!entry}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Selecione um funcionário</option>
                {employees.map(employee => (
                  <option key={employee.auth_user_id} value={employee.auth_user_id}>
                    {employee.username} - {employee.units}
                  </option>
                ))}
              </select>
              {selectedEmployee && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedEmployee.department} | CPF: {selectedEmployee.cpf}
                </p>
              )}
            </div>
          )}

          {/* Manual Employee Data for Unregistered */}
          {!isRegisteredEmployee && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Colaborador *
                </label>
                <input
                  type="text"
                  value={formData.nome_colaborador || ''}
                  onChange={(e) => handleInputChange('nome_colaborador', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  value={formData.cpf_colaborador || ''}
                  onChange={(e) => handleInputChange('cpf_colaborador', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade *
                </label>
                <input
                  type="text"
                  value={formData.unidade || ''}
                  onChange={(e) => handleInputChange('unidade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Digite a unidade de trabalho"
                />
              </div>
            </>
          )}

          {/* Month and Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês *
              </label>
              <select
                value={formData.mes}
                onChange={(e) => handleInputChange('mes', parseInt(e.target.value))}
                required
                disabled={!!entry}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano *
              </label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => handleInputChange('ano', parseInt(e.target.value))}
                required
                disabled={!!entry}
                min="2020"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Classification and Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classificação *
            </label>
            <input
              type="text"
              value={formData.classificacao}
              onChange={(e) => handleInputChange('classificacao', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: CLT, PJ, Freelancer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Função *
            </label>
            <input
              type="text"
              value={formData.funcao}
              onChange={(e) => handleInputChange('funcao', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Músico, Técnico, Administrativo"
            />
          </div>
        </div>

        {/* Financial Fields */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-700">Proventos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salário Base * (R$)
              </label>
              <input
                type="number"
                value={formData.salario_base}
                onChange={(e) => handleInputChange('salario_base', parseFloat(e.target.value) || 0)}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bônus (R$)
              </label>
              <input
                type="number"
                value={formData.bonus || 0}
                onChange={(e) => handleInputChange('bonus', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comissão (R$)
              </label>
              <input
                type="number"
                value={formData.comissao || 0}
                onChange={(e) => handleInputChange('comissao', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passagem (R$)
              </label>
              <input
                type="number"
                value={formData.passagem || 0}
                onChange={(e) => handleInputChange('passagem', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reembolso (R$)
              </label>
              <input
                type="number"
                value={formData.reembolso || 0}
                onChange={(e) => handleInputChange('reembolso', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-700">Descontos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                INSS (R$)
              </label>
              <input
                type="number"
                value={formData.inss || 0}
                onChange={(e) => handleInputChange('inss', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lojinha (R$)
              </label>
              <input
                type="number"
                value={formData.lojinha || 0}
                onChange={(e) => handleInputChange('lojinha', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bistrô (R$)
              </label>
              <input
                type="number"
                value={formData.bistro || 0}
                onChange={(e) => handleInputChange('bistro', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adiantamento (R$)
              </label>
              <input
                type="number"
                value={formData.adiantamento || 0}
                onChange={(e) => handleInputChange('adiantamento', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outros Descontos (R$)
              </label>
              <input
                type="number"
                value={formData.outros_descontos || 0}
                onChange={(e) => handleInputChange('outros_descontos', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={formData.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Observações adicionais..."
          />
        </div>

        {/* Total */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-semibold">
            Total Líquido: <span className="text-blue-600">R$ {calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : (entry ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PayrollEntryForm;