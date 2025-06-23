
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Evaluation, NewEvaluationData } from '@/types/evaluation';
import { evaluationService } from '@/services/evaluationService';
import { useToast } from '@/hooks/use-toast';

interface EvaluationContextType {
  evaluations: Evaluation[];
  isLoading: boolean;
  addEvaluation: (evaluation: NewEvaluationData) => Promise<void>;
  updateEvaluation: (id: string, updates: Partial<Evaluation>) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;
  getEvaluationsByType: (type: string) => Evaluation[];
  getEvaluationsByEmployee: (employeeId: string) => Evaluation[];
  refreshEvaluations: () => Promise<void>;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadEvaluations = async () => {
    try {
      setIsLoading(true);
      const data = await evaluationService.getEvaluations();
      setEvaluations(data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar avaliações",
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
      const newEvaluation = await evaluationService.createEvaluation(evaluationData);
      setEvaluations(prev => [...prev, newEvaluation]);
      toast({
        title: "Sucesso",
        description: "Avaliação criada com sucesso",
      });
    } catch (error) {
      console.error('Error adding evaluation:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar avaliação",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvaluation = async (id: string, updates: Partial<Evaluation>) => {
    try {
      const updatedEvaluation = await evaluationService.updateEvaluation(id, updates);
      setEvaluations(prev => prev.map(eval => eval.id === id ? updatedEvaluation : eval));
      toast({
        title: "Sucesso",
        description: "Avaliação atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error updating evaluation:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar avaliação",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvaluation = async (id: string) => {
    try {
      await evaluationService.deleteEvaluation(id);
      setEvaluations(prev => prev.filter(eval => eval.id !== id));
      toast({
        title: "Sucesso",
        description: "Avaliação removida com sucesso",
      });
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover avaliação",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getEvaluationsByType = (type: string) => {
    return evaluations.filter(evaluation => evaluation.type === type);
  };

  const getEvaluationsByEmployee = (employeeId: string) => {
    return evaluations.filter(evaluation => evaluation.employeeId === employeeId);
  };

  const refreshEvaluations = async () => {
    await loadEvaluations();
  };

  return (
    <EvaluationContext.Provider value={{
      evaluations,
      isLoading,
      addEvaluation,
      updateEvaluation,
      deleteEvaluation,
      getEvaluationsByType,
      getEvaluationsByEmployee,
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
