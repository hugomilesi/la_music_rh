
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NPSResponse, NPSSurvey, NPSStats, NPSEvolution, Department } from '@/types/nps';
import { NPSService } from '@/services/npsService';

interface NPSContextType {
  responses: NPSResponse[];
  surveys: NPSSurvey[];
  stats: NPSStats;
  evolution: NPSEvolution[];
  departments: Department[];
  loading: boolean;
  addResponse: (response: Omit<NPSResponse, 'id'>) => Promise<void>;
  createSurvey: (survey: Omit<NPSSurvey, 'id'>) => Promise<void>;
  updateSurvey: (id: string, survey: Partial<NPSSurvey>) => Promise<void>;
  deleteSurvey: (id: string) => Promise<void>;
  sendSurveyToWhatsApp: (surveyId: string, phones: string[]) => Promise<void>;
  categorizeResponse: (score: number, surveyType: 'nps' | 'satisfaction') => string;
  refreshData: () => Promise<void>;
}

const NPSContext = createContext<NPSContextType | undefined>(undefined);

export const useNPS = () => {
  const context = useContext(NPSContext);
  if (!context) {
    throw new Error('useNPS must be used within an NPSProvider');
  }
  return context;
};

interface NPSProviderProps {
  children: ReactNode;
}

export const NPSProvider: React.FC<NPSProviderProps> = ({ children }) => {
  const [responses, setResponses] = useState<NPSResponse[]>([]);
  const [surveys, setSurveys] = useState<NPSSurvey[]>([]);
  const [stats, setStats] = useState<NPSStats>({
    currentScore: 0,
    previousScore: 0,
    promoters: 0,
    neutrals: 0,
    detractors: 0,
    totalResponses: 0,
    responseRate: 0,
    satisfied: 0,
    neutralSatisfaction: 0,
    dissatisfied: 0
  });
  const [evolution, setEvolution] = useState<NPSEvolution[]>([]);
  const [loading, setLoading] = useState(true);

  // Departments baseados nos dados reais do banco
  const [departments] = useState<Department[]>([
    { id: 'RH', name: 'Recursos Humanos', employeeCount: 1 },
    { id: 'Vendas', name: 'Vendas', employeeCount: 2 },
    { id: 'Marketing', name: 'Marketing', employeeCount: 1 },
    { id: 'TI', name: 'Tecnologia da Informação', employeeCount: 2 },
    { id: 'Financeiro', name: 'Financeiro', employeeCount: 1 },
    { id: 'Estrategico', name: 'Estratégico', employeeCount: 1 }
  ]);

  // Carregar dados do Supabase na inicialização
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [surveysData, responsesData, statsData, evolutionData] = await Promise.all([
        NPSService.getSurveys(),
        NPSService.getResponses(),
        NPSService.calculateNPSStats(),
        NPSService.getNPSEvolution()
      ]);

      setSurveys(surveysData);
      setResponses(responsesData);
      setStats(statsData);
      setEvolution(evolutionData);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };





  const categorizeResponse = (score: number, surveyType: 'nps' | 'satisfaction'): string => {
    if (surveyType === 'nps') {
      if (score >= 9) return 'promotor';
      if (score >= 7) return 'neutro';
      return 'detrator';
    } else {
      // Satisfação (0-5)
      if (score >= 4) return 'satisfeito';
      if (score >= 3) return 'neutro_satisfacao';
      return 'insatisfeito';
    }
  };

  const addResponse = async (response: Omit<NPSResponse, 'id'>) => {
    try {
      const newResponse = await NPSService.addResponse(response);
      if (newResponse) {
        setResponses(prev => [newResponse, ...prev]);
        // Recalcular estatísticas
        const newStats = await NPSService.calculateNPSStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error('Erro ao adicionar resposta:', error);
      throw error;
    }
  };

  const createSurvey = async (survey: Omit<NPSSurvey, 'id'>) => {
    try {
      const newSurvey = await NPSService.createSurvey(survey);
      if (newSurvey) {
        setSurveys(prev => [newSurvey, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao criar pesquisa:', error);
      throw error;
    }
  };

  const updateSurvey = async (id: string, updatedSurvey: Partial<NPSSurvey>) => {
    try {
      const updated = await NPSService.updateSurvey(id, updatedSurvey);
      if (updated) {
        setSurveys(prev => prev.map(survey => 
          survey.id === id ? updated : survey
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar pesquisa:', error);
      throw error;
    }
  };

  const deleteSurvey = async (id: string) => {
    try {
      const success = await NPSService.deleteSurvey(id);
      if (success) {
        setSurveys(prev => prev.filter(survey => survey.id !== id));
        // Remover respostas relacionadas
        setResponses(prev => prev.filter(response => response.surveyId !== id));
        // Recalcular estatísticas
        const newStats = await NPSService.calculateNPSStats();
        setStats(newStats);
      }
    } catch (error) {
      console.error('Erro ao deletar pesquisa:', error);
      throw error;
    }
  };

  const sendSurveyToWhatsApp = async (surveyId: string, phones: string[]) => {
    try {
      // TODO: Implementar integração real com WhatsApp
      console.log('Enviando pesquisa via WhatsApp:', { surveyId, phones });
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao enviar pesquisa via WhatsApp:', error);
      throw error;
    }
  };

  return (
    <NPSContext.Provider value={{
      responses,
      surveys,
      stats,
      evolution,
      departments,
      loading,
      addResponse,
      createSurvey,
      updateSurvey,
      deleteSurvey,
      sendSurveyToWhatsApp,
      categorizeResponse,
      refreshData
    }}>
      {children}
    </NPSContext.Provider>
  );
};
