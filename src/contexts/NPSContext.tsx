
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NPSResponse, NPSSurvey, NPSStats, NPSEvolution, Department } from '@/types/nps';

interface NPSContextType {
  responses: NPSResponse[];
  surveys: NPSSurvey[];
  stats: NPSStats;
  evolution: NPSEvolution[];
  departments: Department[];
  addResponse: (response: NPSResponse) => void;
  createSurvey: (survey: Omit<NPSSurvey, 'id'>) => void;
  updateSurvey: (id: string, survey: Partial<NPSSurvey>) => void;
  deleteSurvey: (id: string) => void;
  sendSurveyToWhatsApp: (surveyId: string, phones: string[]) => Promise<void>;
  categorizeResponse: (score: number, surveyType: 'nps' | 'satisfaction') => string;
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
  // Mock departments data
  const [departments] = useState<Department[]>([
    { id: 'rh', name: 'Recursos Humanos', employeeCount: 8 },
    { id: 'vendas', name: 'Vendas', employeeCount: 15 },
    { id: 'marketing', name: 'Marketing', employeeCount: 6 },
    { id: 'ti', name: 'Tecnologia da Informação', employeeCount: 12 },
    { id: 'financeiro', name: 'Financeiro', employeeCount: 5 },
    { id: 'producao', name: 'Produção', employeeCount: 25 }
  ]);

  // Mock data inicial expandido
  const [responses] = useState<NPSResponse[]>([
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'Maria Silva',
      score: 9,
      comment: 'Ambiente muito positivo, me sinto valorizada na equipe.',
      date: '2024-03-15',
      surveyId: 'survey1',
      category: 'promotor',
      department: 'rh'
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'João Santos',
      score: 7,
      comment: 'Gostaria de mais oportunidades de crescimento profissional.',
      date: '2024-03-14',
      surveyId: 'survey1',
      category: 'neutro',
      department: 'vendas'
    },
    {
      id: '3',
      employeeId: 'emp3',
      employeeName: 'Ana Costa',
      score: 10,
      comment: 'Excelente liderança e comunicação clara dos objetivos.',
      date: '2024-03-13',
      surveyId: 'survey1',
      category: 'promotor',
      department: 'marketing'
    },
    {
      id: '4',
      employeeId: 'emp4',
      employeeName: 'Carlos Oliveira',
      score: 4,
      comment: 'Muito satisfeito com o ambiente de trabalho e benefícios.',
      date: '2024-03-12',
      surveyId: 'survey2',
      category: 'satisfeito',
      department: 'ti'
    },
    {
      id: '5',
      employeeId: 'emp5',
      employeeName: 'Fernanda Lima',
      score: 2,
      comment: 'Precisa melhorar a comunicação entre as equipes.',
      date: '2024-03-11',
      surveyId: 'survey2',
      category: 'insatisfeito',
      department: 'financeiro'
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
      targetEmployees: ['emp1', 'emp2', 'emp3'],
      targetDepartments: ['rh', 'vendas', 'marketing'],
      surveyType: 'nps'
    },
    {
      id: 'survey2',
      title: 'Pesquisa de Satisfação - Março 2024',
      description: 'Avaliação de satisfação geral dos colaboradores',
      questions: [
        {
          id: 'q1',
          type: 'satisfaction',
          question: 'Em uma escala de 0 a 5, qual seu nível de satisfação com a empresa?',
          required: true
        }
      ],
      status: 'active',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      responses: [],
      targetEmployees: ['emp4', 'emp5'],
      targetDepartments: ['ti', 'financeiro'],
      surveyType: 'satisfaction'
    }
  ]);

  const stats: NPSStats = {
    currentScore: 65,
    previousScore: 58,
    promoters: 78,
    neutrals: 13,
    detractors: 9,
    totalResponses: 23,
    responseRate: 85,
    // Estatísticas para pesquisas de satisfação
    satisfied: 80,
    neutralSatisfaction: 15,
    dissatisfied: 5
  };

  const evolution: NPSEvolution[] = [
    { date: '2024-01', score: 45, responses: 18 },
    { date: '2024-02', score: 58, responses: 22 },
    { date: '2024-03', score: 65, responses: 23 }
  ];

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

  const addResponse = (response: NPSResponse) => {
    console.log('Nova resposta adicionada:', response);
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
    return Promise.resolve();
  };

  return (
    <NPSContext.Provider value={{
      responses,
      surveys,
      stats,
      evolution,
      departments,
      addResponse,
      createSurvey,
      updateSurvey,
      deleteSurvey,
      sendSurveyToWhatsApp,
      categorizeResponse
    }}>
      {children}
    </NPSContext.Provider>
  );
};
