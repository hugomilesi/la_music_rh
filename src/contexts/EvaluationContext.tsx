
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
      console.log('Loading evaluations...');
      const data = await evaluationService.getEvaluations();
      console.log('Evaluations loaded:', data.length);
      setEvaluations(data);
    } catch (error) {
      console.error('Error loading evaluations:', error);
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
      console.log('Adding evaluation:', evaluationData);
      const newEvaluation = await evaluationService.createEvaluation(evaluationData);
      console.log('Evaluation added:', newEvaluation);
      setEvaluations(prev => [...prev, newEvaluation]);
      toast({
        title: "Sucesso",
        description: "Avaliação criada com sucesso",
      });
    } catch (error) {
      console.error('Error adding evaluation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao criar avaliação: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvaluation = async (id: string, updates: Partial<Evaluation>) => {
    try {
      console.log('Updating evaluation:', id, updates);
      const updatedEvaluation = await evaluationService.updateEvaluation(id, updates);
      console.log('Evaluation updated:', updatedEvaluation);
      setEvaluations(prev => prev.map(evaluation => evaluation.id === id ? updatedEvaluation : evaluation));
      toast({
        title: "Sucesso",
        description: "Avaliação atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error updating evaluation:', error);
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
      console.log('Deleting evaluation:', id);
      await evaluationService.deleteEvaluation(id);
      console.log('Evaluation deleted:', id);
      setEvaluations(prev => prev.filter(evaluation => evaluation.id !== id));
      toast({
        title: "Sucesso",
        description: "Avaliação removida com sucesso",
      });
    } catch (error) {
      console.error('Error deleting evaluation:', error);
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
      console.error('Error filtering evaluations by type:', error);
      return [];
    }
  };

  const getEvaluationsByEmployee = (employeeId: string) => {
    try {
      return evaluations.filter(evaluation => evaluation.employeeId === employeeId);
    } catch (error) {
      console.error('Error filtering evaluations by employee:', error);
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
      console.error('Error getting coffee connection schedule:', error);
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
