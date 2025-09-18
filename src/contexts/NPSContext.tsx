
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NPSResponse, NPSSurvey, NPSStats, NPSEvolution, Department } from '@/types/nps';
import { NPSService } from '@/services/npsService';
import { WhatsAppService } from '@/services/whatsappService';
import { supabase } from '@/integrations/supabase/client';

interface NPSContextType {
  responses: NPSResponse[];
  surveys: NPSSurvey[];
  stats: NPSStats;
  evolution: NPSEvolution[];
  departments: Department[];
  loading: boolean;
  whatsappLoading: boolean;
  addResponse: (response: Omit<NPSResponse, 'id'>) => Promise<void>;
  createSurvey: (survey: Omit<NPSSurvey, 'id'>) => Promise<void>;
  updateSurvey: (id: string, survey: Partial<NPSSurvey>) => Promise<void>;
  deleteSurvey: (id: string) => Promise<void>;
  sendSurveyToWhatsApp: (surveyId: string, phones: string[]) => Promise<{ success: boolean; sent: number; failed: number; errors?: string[] }>;
  createWhatsAppSchedule: (scheduleData: any) => Promise<void>;
  getWhatsAppSchedules: () => Promise<any[]>;
  getWhatsAppSendStats: (scheduleId: string) => Promise<any>;
  testWhatsAppConnection: () => Promise<boolean>;
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
  const [whatsappLoading, setWhatsappLoading] = useState(false);

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
      // Log desabilitado: Erro ao carregar dados iniciais
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
      // Log desabilitado: Erro ao atualizar dados
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
      // Usar o novo método simplificado
      const result = await NPSService.submitNPSResponse({
        survey_id: response.surveyId,
        employee_id: response.employeeId,
        score: response.score,
        comment: response.comment || '',
        user_name: response.employeeName,
        department: response.department
      });
      
      if (result.success) {
        // Recarregar dados para refletir a nova resposta
        await refreshData();
      } else {
        throw new Error(result.error || 'Erro ao enviar resposta');
      }
    } catch (error) {
      console.error('Erro ao adicionar resposta:', error);
      throw error;
    }
  };

  const createSurvey = async (surveyData: Omit<NPSSurvey, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 NPSContext: Recebendo dados para criar pesquisa:', surveyData);
      
      const newSurvey = await NPSService.createSurvey(surveyData);
      
      console.log('✅ NPSContext: Pesquisa criada pelo serviço:', newSurvey);
      
      setSurveys(prev => [...prev, newSurvey]);
      
      console.log('✅ NPSContext: Estado atualizado com nova pesquisa');
      
      return newSurvey;
    } catch (error) {
      console.error('❌ NPSContext: Erro ao criar pesquisa:', error);
      console.error('❌ NPSContext: Tipo do erro:', typeof error);
      console.error('❌ NPSContext: Detalhes:', error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error);
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
      // Log desabilitado: Erro ao atualizar pesquisa
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
      // Log desabilitado: Erro ao deletar pesquisa
      throw error;
    }
  };

  const sendSurveyToWhatsApp = async (surveyId: string, phones: string[]) => {
    setWhatsappLoading(true);
    try {
      // Buscar dados da pesquisa
      const survey = surveys.find(s => s.id === surveyId);
      if (!survey) {
        throw new Error('Pesquisa não encontrada');
      }

      // Verificar conexão com WhatsApp
      const isConnected = await WhatsAppService.checkConnection();
      if (!isConnected) {
        throw new Error('WhatsApp não está conectado');
      }

      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      // Enviar mensagens para cada telefone
      for (const phone of phones) {
        try {
          const cleanPhone = WhatsAppService.cleanPhoneNumber(phone);
          if (!WhatsAppService.validatePhoneNumber(cleanPhone)) {
            errors.push(`Número inválido: ${phone}`);
            failed++;
            continue;
          }

          // Gerar link NPS usando a nova função do banco de dados
          const { data: linkData, error: linkError } = await supabase
            .rpc('generate_nps_link_token', {
              p_survey_id: surveyId,
              p_user_name: cleanPhone, // Nome baseado no telefone
              p_user_phone: cleanPhone,
              p_use_localhost: true // Usar localhost ao invés do Supabase
            });

          if (linkError || !linkData) {
      
            errors.push(`${phone}: Erro ao gerar link NPS`);
            failed++;
            continue;
          }

          const { token, nps_url } = linkData;
          
          // Criar mensagem com o novo link NPS
          const message = `Olá! 👋\n\nGostaríamos de saber sua opinião sobre nossos serviços.\n\n📊 *${survey.title}*\n\nClique no link para responder:\n${nps_url}\n\n_Sua opinião é muito importante para nós!_`;

          // Registrar no banco antes de enviar
          await WhatsAppService.registerMessage({
            survey_id: surveyId,
            phone_number: cleanPhone,
            message_content: message,
            response_token: token,
            response_url: nps_url
          });

          // Enviar mensagem via Evolution API
          await WhatsAppService.sendMessage(cleanPhone, message);
          sent++;
        } catch (error) {
  
          errors.push(`${phone}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          failed++;
        }
      }

      return {
        success: sent > 0,
        sent,
        failed,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {

      throw error;
    } finally {
      setWhatsappLoading(false);
    }
  };

  const createWhatsAppSchedule = async (scheduleData: any) => {
    try {
      // Primeiro, criar ou obter um survey_id
      let surveyId = scheduleData.survey_id;
      if (!surveyId) {
        // Criar um survey básico se não existir
         const { data: survey, error: surveyError } = await supabase
           .from('nps_surveys')
           .insert({
             title: scheduleData.name || 'Pesquisa NPS WhatsApp',
             description: scheduleData.description || 'Pesquisa criada automaticamente',
             survey_type: 'nps',
             status: 'active',
             start_date: new Date().toISOString().split('T')[0],
             end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
             question: 'Como você avalia nosso serviço?'
           })
           .select('id')
           .single();
        
        if (surveyError) {
    
          throw new Error(`Falha ao criar survey: ${surveyError.message}`);
        }
        surveyId = survey.id;
      }

      // Usar diretamente a função RPC do Supabase
      const { data, error } = await supabase
        .rpc('create_whatsapp_schedule', {
          p_name: scheduleData.name || 'Teste NPS',
          p_survey_id: surveyId,
          p_target_users: JSON.stringify(scheduleData.target_users || []),
          p_schedule_type: scheduleData.schedule_type || 'immediate'
        });

      if (error) {
  
        throw new Error(`Falha ao criar agendamento: ${error.message}`);
      }

      return { success: true, schedule_id: data };
    } catch (error) {

      throw error;
    }
  };

  const getWhatsAppSchedules = async () => {
    try {
      // Usar message_schedules unificado ao invés de get_whatsapp_schedules
      const { data, error } = await supabase
        .from('message_schedules')
        .select('*')
        .eq('channel', 'whatsapp')
        .order('created_at', { ascending: false });

      if (error) {
  
        throw new Error(`Falha ao buscar agendamentos: ${error.message}`);
      }

      return data || [];
    } catch (error) {

      throw error;
    }
  };

  const getWhatsAppSendStats = async (scheduleId?: string) => {
    try {
      // Usar diretamente a função RPC do Supabase
      const { data, error } = await supabase
        .rpc('get_whatsapp_send_stats');

      if (error) {
  
        throw new Error(`Falha ao buscar estatísticas: ${error.message}`);
      }

      return data?.[0] || { total_sent: 0, total_delivered: 0, total_failed: 0, success_rate: 0 };
    } catch (error) {

      throw error;
    }
  };

  const testWhatsAppConnection = async () => {
    try {
      return await WhatsAppService.checkConnection();
    } catch (error) {

      return false;
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
      whatsappLoading,
      addResponse,
      createSurvey,
      updateSurvey,
      deleteSurvey,
      sendSurveyToWhatsApp,
      createWhatsAppSchedule,
      getWhatsAppSchedules,
      getWhatsAppSendStats,
      testWhatsAppConnection,
      categorizeResponse,
      refreshData
    }}>
      {children}
    </NPSContext.Provider>
  );
};
