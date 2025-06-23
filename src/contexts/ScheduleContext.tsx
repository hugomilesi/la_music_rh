
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScheduleEvent, NewScheduleEventData } from '@/types/schedule';
import { Unit } from '@/types/unit';
import { scheduleService } from '@/services/scheduleService';
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
      const data = await scheduleService.getScheduleEvents();
      setEvents(data);
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
