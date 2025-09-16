import { useState, useCallback } from 'react';
import { payrollService } from '../services/payrollService';
import { PayrollEntry } from '../types/payroll';

export interface PayrollEntryInput {
  id?: string;
  colaborador_id?: string;
  mes: number;
  ano: number;
  classificacao: string;
  funcao: string;
  salario_base: number;
  bonus?: number;
  comissao?: number;
  passagem?: number;
  reembolso?: number;
  inss?: number;
  lojinha?: number;
  bistro?: number;
  adiantamento?: number;
  outros_descontos?: number;
  observacoes?: string;
  payroll_id?: string;
  nome_colaborador?: string;
  cpf_colaborador?: string;
  unidade?: string;
}

export interface PayrollEntryUpdate {
  base_salary?: number;
  bonus?: number;
  commission?: number;
  transport?: number;
  reimbursement?: number;
  inss?: number;
  store_discount?: number;
  bistro_discount?: number;
  advance?: number;
  other_discounts?: number;
  notes?: string;
  classification?: string;
  role?: string;
}

export const usePayrollCrud = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create a new payroll entry
  const createEntry = useCallback(async (entry: PayrollEntryInput): Promise<PayrollEntry | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await payrollService.createPayrollEntry(entry);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar entrada da folha de pagamento';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Read/Get a single payroll entry
  const getEntry = useCallback(async (id: string): Promise<PayrollEntry | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await payrollService.getPayrollEntry(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar entrada da folha de pagamento';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing payroll entry
  const updateEntry = useCallback(async (id: string, updates: PayrollEntryUpdate): Promise<PayrollEntry | null> => {
    setLoading(true);
    setError(null);
    try {
      await payrollService.updatePayrollEntry(id, updates);
      const result = await payrollService.getPayrollEntry(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar entrada da folha de pagamento';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a payroll entry
  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await payrollService.deletePayrollEntry(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar entrada da folha de pagamento';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upsert (create or update) a payroll entry
  const upsertEntry = useCallback(async (entry: PayrollEntryInput): Promise<PayrollEntry | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await payrollService.upsertPayrollEntry(entry);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar entrada da folha de pagamento';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Batch operations
  const createMultipleEntries = useCallback(async (entries: PayrollEntryInput[]): Promise<PayrollEntry[]> => {
    setLoading(true);
    setError(null);
    const results: PayrollEntry[] = [];
    const errors: string[] = [];

    try {
      for (const entry of entries) {
        try {
          const result = await payrollService.createPayrollEntry(entry);
          results.push(result);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
          errors.push(`Colaborador ${entry.colaborador_id}: ${errorMessage}`);
        }
      }

      if (errors.length > 0) {
        setError(`Alguns registros falharam:\n${errors.join('\n')}`);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar múltiplas entradas';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMultipleEntries = useCallback(async (ids: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const errors: string[] = [];

    try {
      for (const id of ids) {
        try {
          await payrollService.deletePayrollEntry(id);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
          errors.push(`ID ${id}: ${errorMessage}`);
        }
      }

      if (errors.length > 0) {
        setError(`Alguns registros falharam ao deletar:\n${errors.join('\n')}`);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar múltiplas entradas';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Actions
    createEntry,
    getEntry,
    updateEntry,
    deleteEntry,
    upsertEntry,
    
    // Batch operations
    createMultipleEntries,
    deleteMultipleEntries,
    
    // Utilities
    clearError
  };
};

export default usePayrollCrud;