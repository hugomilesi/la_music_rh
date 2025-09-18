import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { History, Info } from 'lucide-react';

interface NPSSendHistoryProps {
  className?: string;
}

const NPSSendHistory: React.FC<NPSSendHistoryProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Histórico de Envios NPS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            O histórico de envios foi simplificado. 
            As pesquisas NPS agora são gerenciadas através do sistema simplificado.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default NPSSendHistory;