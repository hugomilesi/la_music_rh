import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import useMessageScheduler from '@/hooks/useMessageScheduler';
import { CreateScheduleParams } from '@/types/messageScheduler';

const NPSButtonDebug: React.FC = () => {
  const { createSchedule, loading, error } = useMessageScheduler();
  const [formData, setFormData] = useState({
    selectedSurvey: 'test-survey-id',
    title: 'Teste Debug',
    description: 'Teste de debug do botão',
    scheduleType: 'immediate' as const
  });

  const handleSubmit = async () => {
    console.log('🔥 DEBUG: Iniciando handleSubmit');
    console.log('🔥 DEBUG: Loading antes:', loading);
    
    try {
      const scheduleParams: CreateScheduleParams = {
        type: 'nps',
        title: formData.title,
        description: formData.description,
        content: {
          survey_id: 'test-id',
          survey_title: 'Teste',
          message: 'Mensagem de teste',
          send_via_whatsapp: true,
          include_link: true,
          custom_message: ''
        },
        target_users: ['test-user-id'],
        schedule_type: formData.scheduleType,
        scheduled_for: undefined,
        recurrence_pattern: undefined,
        target_filters: {
          departments: []
        }
      };

      console.log('🔥 DEBUG: Chamando createSchedule');
      const scheduleId = await createSchedule(scheduleParams);
      console.log('🔥 DEBUG: Resultado createSchedule:', scheduleId);
      
    } catch (error) {
      console.log('🔥 DEBUG: Erro capturado:', error);
    }
    
    console.log('🔥 DEBUG: Loading depois:', loading);
  };

  const validateForm = () => {
    return formData.selectedSurvey && formData.title;
  };

  return (
    <div className="p-6 space-y-4 border-2 border-red-200 rounded-lg">
      <h2 className="text-xl font-bold text-red-600">DEBUG: Botão NPS</h2>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          <p>Loading: <span className="font-mono">{loading ? 'true' : 'false'}</span></p>
          <p>Error: <span className="font-mono">{error || 'null'}</span></p>
          <p>Form Valid: <span className="font-mono">{validateForm() ? 'true' : 'false'}</span></p>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={loading || !validateForm()}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {formData.scheduleType === 'immediate' ? 'Enviar Agora (DEBUG)' : 'Criar Agendamento (DEBUG)'}
        </Button>
        
        <div className="text-xs text-gray-500 font-mono">
          <p>Clique no botão e observe o console do navegador</p>
        </div>
      </div>
    </div>
  );
};

export default NPSButtonDebug;