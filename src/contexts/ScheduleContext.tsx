
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ScheduleEvent, NewScheduleEventData } from '@/types/schedule';
import { Unit } from '@/types/unit';

interface ScheduleContextType {
  events: ScheduleEvent[];
  isLoading: boolean;
  addEvent: (data: NewScheduleEventData) => void;
  updateEvent: (id: string, data: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsForUnits: (units: Unit[]) => ScheduleEvent[];
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Mock data atualizado com as novas unidades
const mockEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Plantão Manhã',
    employeeId: '1',
    employee: 'Ana Silva',
    unit: Unit.CAMPO_GRANDE,
    date: '2024-03-21',
    startTime: '08:00',
    endTime: '12:00',
    type: 'plantao',
    description: 'Plantão de atendimento matinal',
    location: 'Unidade Campo Grande',
    emailAlert: true,
    whatsappAlert: false,
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Avaliação 360°',
    employeeId: '2',
    employee: 'Carlos Santos',
    unit: Unit.RECREIO,
    date: '2024-03-21',
    startTime: '14:00',
    endTime: '15:00',
    type: 'avaliacao',
    description: 'Sessão de avaliação 360° trimestral',
    location: 'Sala de reuniões - Recreio',
    emailAlert: true,
    whatsappAlert: true,
    createdAt: '2024-03-15T11:00:00Z',
    updatedAt: '2024-03-15T11:00:00Z'
  },
  {
    id: '3',
    title: 'Reunião Pedagógica',
    employeeId: '3',
    employee: 'Equipe Barra',
    unit: Unit.BARRA,
    date: '2024-03-22',
    startTime: '16:00',
    endTime: '17:30',
    type: 'reuniao',
    description: 'Reunião mensal da equipe pedagógica',
    location: 'Auditório - Barra',
    emailAlert: true,
    whatsappAlert: false,
    createdAt: '2024-03-15T12:00:00Z',
    updatedAt: '2024-03-15T12:00:00Z'
  }
];

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<ScheduleEvent[]>(mockEvents);
  const [isLoading, setIsLoading] = useState(false);

  const addEvent = useCallback((data: NewScheduleEventData) => {
    setIsLoading(true);
    
    // Simular chamada de API
    setTimeout(() => {
      const newEvent: ScheduleEvent = {
        ...data,
        id: Date.now().toString(),
        employee: 'Colaborador', // Seria obtido do lookup de funcionários
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setEvents(prev => [...prev, newEvent]);
      setIsLoading(false);
      
      // Aqui seria implementado o envio de alertas
      if (data.emailAlert || data.whatsappAlert) {
        console.log('Enviando alertas para o evento:', newEvent.title);
      }
    }, 1000);
  }, []);

  const updateEvent = useCallback((id: string, data: Partial<ScheduleEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, ...data, updatedAt: new Date().toISOString() } 
        : event
    ));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  const getEventsForUnits = useCallback((units: Unit[]) => {
    if (units.length === 0) return [];
    return events.filter(event => units.includes(event.unit));
  }, [events]);

  return (
    <ScheduleContext.Provider value={{
      events,
      isLoading,
      addEvent,
      updateEvent,
      deleteEvent,
      getEventsForUnits
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
