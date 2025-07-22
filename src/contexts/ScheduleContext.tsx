
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScheduleEvent, NewScheduleEventData } from '@/types/schedule';
import { Unit } from '@/types/unit';
import { scheduleService } from '@/services/scheduleService';
import { evaluationService } from '@/services/evaluationService';
import { useToast } from '@/hooks/use-toast';

interface ScheduleContextType {
  events: ScheduleEvent[];
  isLoading: boolean;
  addEvent: (data: NewScheduleEventData) => Promise<void>;
  updateEvent: (id: string, data: Partial<ScheduleEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsForUnits: (units: Unit[]) => ScheduleEvent[];
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
      
      // Carregar eventos da agenda
      const scheduleEvents = await scheduleService.getScheduleEvents();
      
      // Carregar avaliações e converter para eventos
      let evaluationEvents: ScheduleEvent[] = [];
      try {
        const evaluations = await evaluationService.getEvaluations();
        evaluationEvents = evaluations
          .filter(evaluation => evaluation.meetingDate && evaluation.meetingTime)
          .map(evaluation => ({
            id: `eval_${evaluation.id}`,
            title: `${evaluation.type} - ${evaluation.employee}`,
            employeeId: evaluation.employeeId,
            unit: evaluation.unit as Unit,
            date: evaluation.meetingDate!,
            startTime: evaluation.meetingTime!,
            endTime: addOneHour(evaluation.meetingTime!),
            type: 'avaliacao',
            description: `${evaluation.type} com ${evaluation.employee}${evaluation.topics ? `. Tópicos: ${evaluation.topics.join(', ')}` : ''}`,
            location: evaluation.location || 'Não informado',
            emailAlert: false,
            whatsappAlert: false,
            createdAt: evaluation.date || new Date().toISOString(),
            updatedAt: evaluation.date || new Date().toISOString()
          }));
      } catch (evalError) {
        console.warn('Error loading evaluation events:', evalError);
      }
      
      // Combinar eventos da agenda e avaliações
      const allEvents = [...scheduleEvents, ...evaluationEvents];
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading schedule events:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos",
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
        console.log('Enviando alertas para o evento:', newEvent.title);
      }
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso",
      });
    } catch (error) {
      console.error('Error adding event:', error);
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
      console.error('Error updating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await scheduleService.deleteScheduleEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      toast({
        title: "Sucesso",
        description: "Evento removido com sucesso",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover evento",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const getEventsForUnits = useCallback((units: Unit[]) => {
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
