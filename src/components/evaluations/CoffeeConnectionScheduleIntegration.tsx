
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Coffee, Clock, MapPin } from 'lucide-react';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Unit } from '@/types/unit';

export const CoffeeConnectionScheduleIntegration: React.FC = () => {
  const { getCoffeeConnectionSchedule } = useEvaluations();
  const { addEvent } = useSchedule();
  
  const scheduledConnections = getCoffeeConnectionSchedule();

  const addToCalendar = (connection: any) => {
    if (connection.meetingDate && connection.meetingTime) {
      const [hours, minutes] = connection.meetingTime.split(':');
      const startDate = new Date(connection.meetingDate);
      startDate.setHours(parseInt(hours), parseInt(minutes));
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1); // 1 hour duration

      const newEvent = {
        title: `Coffee Connection - ${connection.employee}`,
        employeeId: connection.employeeId,
        unit: Unit.CAMPO_GRANDE, // Default unit, could be mapped from connection data
        date: connection.meetingDate,
        startTime: connection.meetingTime,
        endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
        type: 'avaliacao' as const, // Coffee Connection maps to evaluation type
        description: `Coffee Connection com ${connection.employee}\nLocal: ${connection.location || 'A definir'}\nTópicos: ${connection.topics?.join(', ') || 'Conversa geral'}`,
        location: connection.location || '',
        emailAlert: true,
        whatsappAlert: false
      };

      addEvent(newEvent);
      console.log('Coffee Connection adicionado ao calendário:', newEvent);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-600" />
          Coffee Connection - Agenda
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scheduledConnections.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum Coffee Connection agendado
          </p>
        ) : (
          <div className="space-y-3">
            {scheduledConnections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{connection.employee}</span>
                    <Badge className="bg-amber-100 text-amber-800">
                      Coffee Connection
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(connection.meetingDate!).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {connection.meetingTime}
                    </div>
                    {connection.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {connection.location}
                      </div>
                    )}
                  </div>
                  
                  {connection.topics && connection.topics.length > 0 && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        Tópicos: {connection.topics.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => addToCalendar(connection)}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Adicionar à Agenda
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
