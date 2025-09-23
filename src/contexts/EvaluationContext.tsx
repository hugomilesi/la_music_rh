
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Evaluation, NewEvaluationData } from '@/types/evaluation';
import { evaluationService } from '@/services/evaluationService';
import { useToast } from '@/hooks/use-toast';

interface EvaluationContextType {
  evaluations: Evaluation[];
  isLoading: boolean;
  error: string | null;
  addEvaluation: (evaluation: NewEvaluationData) => Promise<void>;
  updateEvaluation: (id: string, updates: Partial<Evaluation>) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;
  getEvaluationsByType: (type: string) => Evaluation[];
  getEvaluationsByEmployee: (employeeId: string) => Evaluation[];
  getCoffeeConnectionSchedule: () => any[];
  refreshEvaluations: () => Promise<void>;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadEvaluations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Log desabilitado: Loading evaluations
      const data = await evaluationService.getEvaluations();
      // Log desabilitado: Evaluations loaded
      setEvaluations(data);
    } catch (error) {
      // Log desabilitado: Error loading evaluations
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar avaliações: " + errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, []);

  const addEvaluation = async (evaluationData: NewEvaluationData) => {
    try {
      console.log('🔄 EvaluationContext: Adicionando avaliação:', evaluationData);
      
      const newEvaluation = await evaluationService.createEvaluation(evaluationData);
      
      console.log('✅ EvaluationContext: Avaliação criada com sucesso:', newEvaluation);
      
      setEvaluations(prev => [...prev, newEvaluation]);
      
      toast({
        title: 'Sucesso',
        description: 'Avaliação criada com sucesso!',
      });
    } catch (error) {
      console.error('❌ EvaluationContext: Erro ao adicionar avaliação:', error);
      
      toast({
        title: 'Erro',
        description: 'Erro ao criar avaliação. Tente novamente.',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const updateEvaluation = async (id: string, updates: Partial<Evaluation>) => {
    try {
      // Log desabilitado: Updating evaluation
      const updatedEvaluation = await evaluationService.updateEvaluation(id, updates);
      // Log desabilitado: Evaluation updated
      setEvaluations(prev => prev.map(evaluation => evaluation.id === id ? updatedEvaluation : evaluation));
      toast({
        title: "Sucesso",
        description: "Avaliação atualizada com sucesso",
      });
    } catch (error) {
      // Log desabilitado: Error updating evaluation
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao atualizar avaliação: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvaluation = async (id: string) => {
    try {
      // Log desabilitado: Deleting evaluation
      await evaluationService.deleteEvaluation(id);
      // Log desabilitado: Evaluation deleted
      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== id));
      toast({
        title: "Sucesso",
        description: "Avaliação removida com sucesso",
      });
    } catch (error) {
      // Log desabilitado: Error deleting evaluation
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao remover avaliação: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getEvaluationsByType = (type: string) => {
    try {
      return evaluations.filter(evaluation => evaluation.type === type);
    } catch (error) {
      // Log desabilitado: Error filtering evaluations by type
      return [];
    }
  };

  const getEvaluationsByEmployee = (employeeId: string) => {
    try {
      return evaluations.filter(evaluation => evaluation.employeeId === employeeId);
    } catch (error) {
      // Log desabilitado: Error filtering evaluations by employee
      return [];
    }
  };

  const getCoffeeConnectionSchedule = () => {
    try {
      // Return coffee connection evaluations with schedule data
      return evaluations
        .filter(evaluation => evaluation.type === 'Coffee Connection')
        .map(evaluation => ({
          id: evaluation.id,
          title: `Coffee Connection - ${evaluation.employee}`,
          date: evaluation.meetingDate,
          time: evaluation.meetingTime,
          location: evaluation.location,
          employee: evaluation.employee
        }));
    } catch (error) {
      // Log desabilitado: Error getting coffee connection schedule
      return [];
    }
  };

  const refreshEvaluations = async () => {
    await loadEvaluations();
  };

  return (
    <EvaluationContext.Provider value={{
      evaluations,
      isLoading,
      error,
      addEvaluation,
      updateEvaluation,
      deleteEvaluation,
      getEvaluationsByType,
      getEvaluationsByEmployee,
      getCoffeeConnectionSchedule,
      refreshEvaluations
    }}>
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluations = () => {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error('useEvaluations must be used within an EvaluationProvider');
  }
  return context;
};
