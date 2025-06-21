
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coffee, Calendar, MapPin, Users, Clock } from 'lucide-react';

interface CoffeeConnectionCardProps {
  onScheduleNew: () => void;
}

export const CoffeeConnectionCard: React.FC<CoffeeConnectionCardProps> = ({ onScheduleNew }) => {
  const upcomingSessions = [
    {
      employee: 'Carlos Santos',
      date: '2024-03-25',
      time: '14:00',
      location: 'Sala de Reuniões - Recreio',
      status: 'Confirmado'
    },
    {
      employee: 'Maria Oliveira',
      date: '2024-03-27',
      time: '10:30',
      location: 'Café Central - Barra',
      status: 'Pendente'
    }
  ];

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <Coffee className="w-5 h-5" />
          Coffee Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Conversas estruturadas para feedback contínuo e desenvolvimento
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">12</p>
                <p className="text-xs text-gray-500">Sessões este mês</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-xs text-gray-500">Concluídas</p>
              </div>
            </div>
            
            <Button onClick={onScheduleNew} className="bg-amber-600 hover:bg-amber-700">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Sessão
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Próximas Sessões</h4>
            {upcomingSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium">{session.employee}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {session.date} às {session.time}
                      <MapPin className="w-3 h-3 ml-1" />
                      {session.location}
                    </div>
                  </div>
                </div>
                <Badge 
                  className={session.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {session.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
