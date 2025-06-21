
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Award, CheckCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'document' | 'evaluation' | 'recognition';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dismissed: boolean;
  employee?: string;
  dueDate?: string;
}

export const AlertCard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'document',
      title: 'Documentos Vencidos',
      description: '7 colaboradores com docs em atraso',
      priority: 'high',
      dismissed: false,
      employee: 'João Silva',
      dueDate: '5 dias atrás'
    },
    {
      id: '2',
      type: 'evaluation',
      title: 'Avaliações Próximas',
      description: '15 avaliações vencem em 7 dias',
      priority: 'medium',
      dismissed: false,
      employee: 'Ana Silva',
      dueDate: '3 dias'
    },
    {
      id: '3',
      type: 'recognition',
      title: 'Reconhecimentos',
      description: '3 colaboradores se destacaram',
      priority: 'low',
      dismissed: false,
      employee: 'Pedro Costa',
      dueDate: 'Hoje'
    }
  ]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'document':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'evaluation':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'recognition':
        return <Award className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'document':
        return 'bg-red-50 border-red-500';
      case 'evaluation':
        return 'bg-orange-50 border-orange-500';
      case 'recognition':
        return 'bg-blue-50 border-blue-500';
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowModal(true)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Alertas Importantes
            <Badge variant="destructive">{activeAlerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}>
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                </div>
                <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                  {alert.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Gestão de Alertas
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-red-600">Alertas Ativos ({activeAlerts.length})</h3>
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          {alert.employee && (
                            <p className="text-xs text-gray-500">
                              Relacionado a: {alert.employee} • Prazo: {alert.dueDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissAlert(alert.id)}
                        className="ml-4"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Dispensar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {alerts.filter(alert => alert.dismissed).length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-600">Alertas Dispensados</h3>
                <div className="space-y-2">
                  {alerts.filter(alert => alert.dismissed).map((alert) => (
                    <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{alert.title}</p>
                        <p className="text-sm text-gray-500">{alert.description}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Dispensado
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
