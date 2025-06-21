
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Evaluation, NewEvaluationData } from '@/types/evaluation';

interface EvaluationContextType {
  evaluations: Evaluation[];
  isLoading: boolean;
  addEvaluation: (data: NewEvaluationData) => void;
  updateEvaluation: (id: string, data: Partial<Evaluation>) => void;
  deleteEvaluation: (id: string) => void;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

// Mock data for demonstration
const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    employeeId: '1',
    employee: 'Ana Silva',
    role: 'Professora de Piano',
    unit: 'Centro',
    type: 'Avaliação 360°',
    period: '2024-T1',
    score: 4.5,
    status: 'Concluída',
    date: '2024-03-15'
  },
  {
    id: '2',
    employeeId: '2',
    employee: 'Carlos Santos',
    role: 'Coordenador',
    unit: 'Zona Sul',
    type: 'Auto Avaliação',
    period: '2024-T1',
    score: 4.2,
    status: 'Pendente',
    date: '2024-03-10'
  },
  {
    id: '3',
    employeeId: '3',
    employee: 'Maria Oliveira',
    role: 'Professora de Violão',
    unit: 'Norte',
    type: 'Avaliação do Gestor',
    period: '2024-T1',
    score: 4.8,
    status: 'Concluída',
    date: '2024-03-12'
  }
];

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);
  const [isLoading, setIsLoading] = useState(false);

  const addEvaluation = useCallback((data: NewEvaluationData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newEvaluation: Evaluation = {
        ...data,
        id: Date.now().toString(),
        employee: 'Colaborador', // This would come from employee lookup
        role: 'Cargo', // This would come from employee lookup
        unit: 'Unidade', // This would come from employee lookup
        score: 0,
        status: 'Pendente',
        date: new Date().toISOString().split('T')[0]
      };
      
      setEvaluations(prev => [...prev, newEvaluation]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateEvaluation = useCallback((id: string, data: Partial<Evaluation>) => {
    setEvaluations(prev => prev.map(evaluation => evaluation.id === id ? { ...evaluation, ...data } : evaluation));
  }, []);

  const deleteEvaluation = useCallback((id: string) => {
    setEvaluations(prev => prev.filter(evaluation => evaluation.id !== id));
  }, []);

  return (
    <EvaluationContext.Provider value={{
      evaluations,
      isLoading,
      addEvaluation,
      updateEvaluation,
      deleteEvaluation
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
