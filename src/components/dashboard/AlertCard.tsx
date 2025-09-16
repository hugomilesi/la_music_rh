
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Award, CheckCircle, X, Music, Piano, Mic, Volume2, Bell } from 'lucide-react';
import '@/styles/card-animations.css';

interface Alert {
  id: string;
  type: 'documento' | 'avaliacao' | 'reconhecimento';
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
      type: 'documento',
      title: 'Instrumentos Precisam Manutenção',
      description: '5 pianos e 3 violões precisam de afinação',
      priority: 'high',
      dismissed: false,
      employee: 'João Silva - Professor de Piano',
      dueDate: '5 dias atrás'
    },
    {
      id: '2',
      type: 'avaliacao',
      title: 'Avaliações Musicais Próximas',
      description: '12 alunos têm recitais em 7 dias',
      priority: 'medium',
      dismissed: false,
      employee: 'Ana Silva - Professora de Violino',
      dueDate: '3 dias'
    },
    {
      id: '3',
      type: 'reconhecimento',
      title: 'Conquistas Musicais',
      description: '4 alunos ganharam competições',
      priority: 'low',
      dismissed: false,
      employee: 'Pedro Costa - Professor de Guitarra',
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
      case 'documento':
        return <Piano className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'avaliacao':
        return <Mic className="w-5 h-5 text-orange-500 animate-bounce" />;
      case 'reconhecimento':
        return <Award className="w-5 h-5 text-blue-500 animate-pulse" />;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'documento':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 shadow-red-100';
      case 'avaliacao':
        return 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-400 shadow-orange-100';
      case 'reconhecimento':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-blue-100';
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
      <Card className="dashboard-card cursor-pointer group relative overflow-hidden border-orange-200 bg-gradient-to-br from-white to-orange-50/30" onClick={() => setShowModal(true)}>
        {/* Musical background decoration */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
          <div className="absolute top-4 right-4 text-3xl animate-pulse">🎵</div>
          <div className="absolute bottom-4 left-4 text-2xl animate-bounce delay-300">🎼</div>
          <div className="absolute top-1/2 right-8 text-xl animate-pulse delay-500">♪</div>
        </div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-orange-600 card-icon" />
              <Volume2 className="w-3 h-3 text-red-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
              Alertas do Sistema
            </span>
            <Badge 
              variant="destructive" 
              className="bg-gradient-to-r from-red-500 to-orange-500 card-badge animate-pulse"
            >
              <Music className="w-3 h-3 mr-1" />
              {activeAlerts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="space-y-3">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 group/item ${getAlertColor(alert.type)}`}>
                  <div className="group-hover/item:scale-110 transition-transform duration-200">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover/item:text-gray-800 transition-colors">{alert.title}</p>
                    <p className="text-sm text-gray-600 group-hover/item:text-gray-700 transition-colors">{alert.description}</p>
                  </div>
                  <Badge variant="outline" className={`${getPriorityColor(alert.priority)} group-hover/item:scale-105 transition-transform duration-200`}>
                    {alert.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum alerta ativo</p>
                <p className="text-xs">Tudo em harmonia! 🎶</p>
              </div>
            )}
          </div>
          
          {/* Musical note trail */}
          <div className="absolute bottom-2 right-2 flex space-x-1 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <span className="text-xs animate-bounce">♪</span>
            <span className="text-xs animate-bounce delay-100">♫</span>
            <span className="text-xs animate-bounce delay-200">♪</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-orange-600" />
                <Music className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Gestão de Alertas do Sistema
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-red-600 flex items-center gap-2">
                <Piano className="w-5 h-5" />
                Alertas Ativos ({activeAlerts.length})
              </h3>
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
