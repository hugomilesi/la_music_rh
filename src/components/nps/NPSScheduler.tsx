import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface NPSSchedulerProps {
  onScheduleCreated?: (scheduleId: string) => void;
  onCancel?: () => void;
}

const NPSScheduler: React.FC<NPSSchedulerProps> = ({
  onScheduleCreated,
  onCancel
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamento de Pesquisas NPS</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            O sistema de agendamento foi simplificado. 
            As pesquisas NPS agora são enviadas manualmente através da página de gerenciamento.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default NPSScheduler;