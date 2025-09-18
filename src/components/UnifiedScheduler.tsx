import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface UnifiedSchedulerProps {
  defaultType?: 'notification' | 'nps' | 'whatsapp' | 'email';
  onScheduleCreated?: (scheduleId: string) => void;
  onCancel?: () => void;
}

const UnifiedScheduler: React.FC<UnifiedSchedulerProps> = ({
  defaultType = 'notification',
  onScheduleCreated,
  onCancel
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Agendador Unificado</CardTitle>
        <CardDescription>
          Sistema de agendamento de mensagens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            O sistema de agendamento unificado foi simplificado. 
            As funcionalidades de agendamento foram removidas desta versão.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default UnifiedScheduler;