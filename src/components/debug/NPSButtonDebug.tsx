import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const NPSButtonDebug: React.FC = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Debug NPS</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            As funcionalidades de debug do NPS foram removidas desta versão.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default NPSButtonDebug;