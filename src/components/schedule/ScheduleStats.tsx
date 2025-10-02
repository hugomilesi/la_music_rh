
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle } from 'lucide-react';
import { ScheduleEvent } from '@/types/schedule';
import { useEmployees } from '@/contexts/EmployeeContext';

interface ScheduleStatsProps {
  events: ScheduleEvent[];
  selectedDate?: Date;
}

export const ScheduleStats: React.FC<ScheduleStatsProps> = ({ events, selectedDate }) => {
  const { employees } = useEmployees();

  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter(event => event.date === today);
    
    const typeCount = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const employeesWithEvents = new Set(events.map(event => event.employeeId)).size;
    
    const conflicts = events.filter((event, index) => {
      return events.some((otherEvent, otherIndex) => {
        return (
          index !== otherIndex &&
          event.employeeId === otherEvent.employeeId &&
          event.date === otherEvent.date &&
          ((event.startTime >= otherEvent.startTime && event.startTime < otherEvent.endTime) ||
           (event.endTime > otherEvent.startTime && event.endTime <= otherEvent.endTime))
        );
      });
    });

    return {
      totalEvents: events.length,
      todayEvents: todayEvents.length,
      typeCount,
      employeesWithEvents,
      totalEmployees: employees.length,
      conflicts: conflicts.length
    };
  }, [events, employees]);

  const eventTypeLabels = {
    'meeting': 'Reuniões',
    'appointment': 'Compromissos',
    'reminder': 'Lembretes',
    'task': 'Tarefas',
    'vacation': 'Férias',
    'training': 'Treinamentos',
    'avaliacao': 'Avaliações',
    'coffee-connection': 'Coffee Connections'
  };



  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">
            {stats.todayEvents} hoje
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.employeesWithEvents}</div>
          <p className="text-xs text-muted-foreground">
            de {stats.totalEmployees} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tipos de Evento</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(stats.typeCount).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span>{eventTypeLabels[type] || type}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conflitos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.conflicts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.conflicts === 0 ? 'Nenhum conflito' : 'Requer atenção'}
          </p>
        </CardContent>
      </Card>

    </div>
    </>
  );
};
