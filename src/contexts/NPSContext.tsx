
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NPSResponse, NPSSurvey, NPSStats, NPSEvolution } from '@/types/nps';

interface NPSContextType {
  responses: NPSResponse[];
  surveys: NPSSurvey[];
  stats: NPSStats;
  evolution: NPSEvolution[];
  addResponse: (response: NPSResponse) => void;
  createSurvey: (survey: Omit<NPSSurvey, 'id'>) => void;
  updateSurvey: (id: string, survey: Partial<NPSSurvey>) => void;
  deleteSurvey: (id: string) => void;
  sendSurveyToWhatsApp: (surveyId: string, phones: string[]) => Promise<void>;
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
  // Mock data inicial
  const [responses] = useState<NPSResponse[]>([
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'Maria Silva',
      score: 9,
      comment: 'Ambiente muito positivo, me sinto valorizada na equipe.',
      date: '2024-03-15',
      surveyId: 'survey1',
      category: 'promotor'
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'João Santos',
      score: 7,
      comment: 'Gostaria de mais oportunidades de crescimento profissional.',
      date: '2024-03-14',
      surveyId: 'survey1',
      category: 'neutro'
    },
    {
      id: '3',
      employeeId: 'emp3',
      employeeName: 'Ana Costa',
      score: 10,
      comment: 'Excelente liderança e comunicação clara dos objetivos.',
      date: '2024-03-13',
      surveyId: 'survey1',
      category: 'promotor'
    }
  ]);

  const [surveys, setSurveys] = useState<NPSSurvey[]>([
    {
      id: 'survey1',
      title: 'Pesquisa de Clima Organizacional - Março 2024',
      description: 'Avaliação mensal do ambiente de trabalho',
      questions: [
        {
          id: 'q1',
          type: 'nps',
          question: 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?',
          required: true
        },
        {
          id: 'q2',
          type: 'text',
          question: 'O que podemos melhorar para tornar seu ambiente de trabalho ainda melhor?',
          required: false
        }
      ],
      status: 'active',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      responses: [],
      targetEmployees: ['emp1', 'emp2', 'emp3', 'emp4', 'emp5']
    }
  ]);

  const stats: NPSStats = {
    currentScore: 65,
    previousScore: 58,
    promoters: 78,
    neutrals: 13,
    detractors: 9,
    totalResponses: 23,
    responseRate: 85
  };

  const evolution: NPSEvolution[] = [
    { date: '2024-01', score: 45, responses: 18 },
    { date: '2024-02', score: 58, responses: 22 },
    { date: '2024-03', score: 65, responses: 23 }
  ];

  const addResponse = (response: NPSResponse) => {
    console.log('Nova resposta NPS adicionada:', response);
  };

  const createSurvey = (survey: Omit<NPSSurvey, 'id'>) => {
    const newSurvey: NPSSurvey = {
      ...survey,
      id: Date.now().toString()
    };
    setSurveys(prev => [...prev, newSurvey]);
    console.log('Nova pesquisa criada:', newSurvey);
  };

  const updateSurvey = (id: string, updatedSurvey: Partial<NPSSurvey>) => {
    setSurveys(prev => prev.map(survey => 
      survey.id === id ? { ...survey, ...updatedSurvey } : survey
    ));
    console.log('Pesquisa atualizada:', id, updatedSurvey);
  };

  const deleteSurvey = (id: string) => {
    setSurveys(prev => prev.filter(survey => survey.id !== id));
    console.log('Pesquisa deletada:', id);
  };

  const sendSurveyToWhatsApp = async (surveyId: string, phones: string[]) => {
    console.log('Enviando pesquisa via WhatsApp:', { surveyId, phones });
    // Aqui seria implementada a integração real com WhatsApp
    return Promise.resolve();
  };

  return (
    <NPSContext.Provider value={{
      responses,
      surveys,
      stats,
      evolution,
      addResponse,
      createSurvey,
      updateSurvey,
      deleteSurvey,
      sendSurveyToWhatsApp
    }}>
      {children}
    </NPSContext.Provider>
  );
};
