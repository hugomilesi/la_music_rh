
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coffee, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Evaluation } from '@/types/evaluation';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { useToast } from '@/hooks/use-toast';

export const CoffeeConnectionScheduleIntegration: React.FC = () => {
  const { evaluations, updateEvaluation } = useEvaluations();
  const { toast } = useToast();
  
  // Filtrar apenas Coffee Connections com status 'Em Andamento'
  const scheduledConnections = evaluations
    .filter(evaluation => evaluation.type === 'Coffee Connection' && evaluation.status === 'Em Andamento')
    .map(evaluation => ({
      id: evaluation.id,
      title: `Coffee Connection - ${evaluation.employee}`,
      employee: evaluation.employee,
      employeeId: evaluation.employeeId,
      meetingDate: evaluation.meetingDate,
      meetingTime: evaluation.meetingTime,
      location: evaluation.location,
      topics: evaluation.topics
    }));

  const approveAndAddToCalendar = async (connection: any) => {
    if (connection.meetingDate && connection.meetingTime) {
      try {
        // Aprovar a avaliação (mudar status para 'Em Andamento')
        await updateEvaluation(connection.id, { status: 'Em Andamento' });
        
        toast({
          title: "Sucesso",
          description: `Coffee Connection aprovado e será exibido no calendário para ${connection.employee}`,
        });
        
        // Coffee Connection aprovado e será exibido no calendário através da view
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao processar aprovação",
          variant: "destructive",
        });
      }
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
                  onClick={() => approveAndAddToCalendar(connection)}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Aprovar e Agendar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
