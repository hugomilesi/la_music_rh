
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScheduleEvent, NewScheduleEventData } from '@/types/schedule';
import { ScheduleUnit } from '@/types/unit';
import { scheduleService } from '@/services/scheduleService';
import { evaluationService } from '@/services/evaluationService';
import { useToast } from '@/hooks/use-toast';

interface ScheduleContextType {
  events: ScheduleEvent[];
  isLoading: boolean;
  addEvent: (data: NewScheduleEventData) => Promise<void>;
  updateEvent: (id: string, data: Partial<ScheduleEvent>) => Promise<void>;
  deleteEvent: (id: string, source?: 'schedule' | 'evaluations') => Promise<void>;
  getEventsForUnits: (units: ScheduleUnit[]) => ScheduleEvent[];
  refreshEvents: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      
      // Usar a nova VIEW que combina eventos e avaliações
      const events = await scheduleService.getScheduleEventsWithEvaluations();
      
      setEvents(events);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para adicionar uma hora
  const addOneHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const addEvent = useCallback(async (data: NewScheduleEventData) => {
    try {
      setIsLoading(true);
      const newEvent = await scheduleService.createScheduleEvent(data);
      setEvents(prev => [...prev, newEvent]);
      
      // Alertas (implementação simples via console, seria integrado com serviço de notificações)
      if (data.emailAlert || data.whatsappAlert) {
        // Sending alerts for event logging disabled
      }
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso",
      });
    } catch (error) {
      // Error adding event logging disabled
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateEvent = useCallback(async (id: string, data: Partial<ScheduleEvent>) => {
    try {
      const updatedEvent = await scheduleService.updateScheduleEvent(id, data);
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso",
      });
    } catch (error) {
      // Error updating event logging disabled
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteEvent = async (eventId: string, source?: string) => {
    try {
      
      // Encontrar o evento para verificar se é uma avaliação
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        toast({
          title: "Erro",
          description: "Evento não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Se for uma avaliação (ID começa com 'eval_' ou tem is_evaluation = true)
      if (eventId.startsWith('eval_') || event.is_evaluation) {
        
        // Extrair o ID real da avaliação (remover prefixo 'eval_' se existir)
        const evaluationId = eventId.startsWith('eval_') ? eventId.replace('eval_', '') : eventId;
        
        // Deletar da tabela evaluations
        await evaluationService.deleteEvaluation(evaluationId);
        
      } else {
        // Só permitir exclusão de eventos regulares
        await scheduleService.deleteScheduleEvent(eventId);
      }
      
      // Recarregar eventos após exclusão
      await loadEvents();
      
      toast({
        title: "Sucesso",
        description: event.is_evaluation ? "Avaliação removida com sucesso" : "Evento removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o evento",
        variant: "destructive",
      });
    }
  };

  const getEventsForUnits = useCallback((units: ScheduleUnit[]) => {
    if (units.length === 0) return [];
    return events.filter(event => units.includes(event.unit));
  }, [events]);

  const refreshEvents = async () => {
    await loadEvents();
  };

  return (
    <ScheduleContext.Provider value={{
      events,
      isLoading,
      addEvent,
      updateEvent,
      deleteEvent,
      getEventsForUnits,
      refreshEvents
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
