
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Incident } from '@/types/incident';
import { AlertTriangle, TrendingUp, Calendar, User } from 'lucide-react';

interface StatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  incidents: Incident[];
  filterType: 'total' | 'active' | 'resolved' | 'thisMonth';
}

export const StatsModal: React.FC<StatsModalProps> = ({ 
  open, 
  onOpenChange, 
  title, 
  incidents,
  filterType 
}) => {
  const getSeverityBadge = (severity: string) => {
    const variants = {
      'leve': 'bg-yellow-100 text-yellow-800',
      'moderado': 'bg-orange-100 text-orange-800',
      'grave': 'bg-red-100 text-red-800'
    };
    return variants[severity as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'ativo': 'bg-red-100 text-red-800',
      'resolvido': 'bg-green-100 text-green-800',
      'arquivado': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeStats = () => {
    const typeCount = incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({ type, count }));
  };

  const getSeverityStats = () => {
    const severityCount = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { severity: 'grave', count: severityCount.grave || 0, color: 'text-red-600' },
      { severity: 'moderado', count: severityCount.moderado || 0, color: 'text-orange-600' },
      { severity: 'leve', count: severityCount.leve || 0, color: 'text-yellow-600' }
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {title} ({incidents.length} ocorrências)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getTypeStats().map(({ type, count }) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm">{type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Por Gravidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getSeverityStats().map(({ severity, count, color }) => (
                  <div key={severity} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{severity}</span>
                    <span className={`font-medium ${color}`}>{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Incidents List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Lista de Ocorrências</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {incidents.map((incident) => (
                <Card key={incident.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{incident.employee}</h4>
                      <p className="text-sm text-gray-600">{incident.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSeverityBadge(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge className={getStatusBadge(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{incident.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(incident.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {incident.reporter}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
