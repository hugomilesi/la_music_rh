
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coffee, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useEvaluations } from '@/contexts/EvaluationContext';

interface CoffeeConnectionCardProps {
  onScheduleNew: () => void;
}

export const CoffeeConnectionCard: React.FC<CoffeeConnectionCardProps> = ({ onScheduleNew }) => {
  const { evaluations } = useEvaluations();
  
  // Get Coffee Connection evaluations
  const coffeeConnections = evaluations.filter(evaluation => evaluation.type === 'Coffee Connection');
  const approvedSessions = coffeeConnections.filter(evaluation => evaluation.status === 'Em Andamento');
  const completedSessions = coffeeConnections.filter(evaluation => evaluation.status === 'Concluída');
  
  // Get upcoming sessions (next 5 approved sessions) - show only approved sessions
  const upcomingSessions = approvedSessions
    .filter(session => session.meetingDate && session.meetingTime)
    .filter(session => {
      // Show only future sessions
      const sessionDateTime = new Date(`${session.meetingDate}T${session.meetingTime}`);
      return sessionDateTime > new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.meetingDate}T${a.meetingTime}`);
      const dateB = new Date(`${b.meetingDate}T${b.meetingTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5)
    .map(session => ({
      employee: session.employee || 'Funcionário não informado',
      date: session.meetingDate!,
      time: session.meetingTime!,
      location: session.location || 'Local não informado',
      status: 'Aprovado'
    }));

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
                <p className="text-2xl font-bold text-amber-600">{coffeeConnections.length}</p>
                <p className="text-xs text-gray-500">Total de sessões</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedSessions.length}</p>
                <p className="text-xs text-gray-500">Concluídas</p>
              </div>
            </div>
            
            <Button 
              onClick={onScheduleNew} 
              style={{ backgroundColor: '#B45309' }}
              className="hover:opacity-90 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Sessão
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Próximas Sessões Aprovadas</h4>
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma sessão aprovada agendada
              </p>
            ) : (
              upcomingSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{session.employee}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(session.date).toLocaleDateString('pt-BR')} às {session.time}
                        <MapPin className="w-3 h-3 ml-1" />
                        {session.location}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {session.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
