
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { ScheduleEvent } from '@/types/schedule';

interface ConflictAlertProps {
  conflicts: ScheduleEvent[];
  className?: string;
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({ conflicts, className }) => {
  if (conflicts.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">
            {conflicts.length === 1 ? 'Conflito de horário detectado:' : `${conflicts.length} conflitos de horário detectados:`}
          </p>
          <div className="space-y-1">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{conflict.startTime} - {conflict.endTime}</Badge>
                <span>{conflict.title}</span>
              </div>
            ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
