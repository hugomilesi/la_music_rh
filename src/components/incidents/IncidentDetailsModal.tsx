import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, AlertTriangle, FileText, Edit } from 'lucide-react';
import { Incident } from '@/contexts/IncidentsContext';

interface IncidentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: Incident | null;
  onEdit: (incident: Incident) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  open,
  onOpenChange,
  incident,
  onEdit
}) => {
  if (!incident) return null;

  const getSeverityBadge = (severity: string) => {
    const variants = {
      'baixa': 'bg-yellow-100 text-yellow-800',
      'media': 'bg-orange-100 text-orange-800',
      'alta': 'bg-red-100 text-red-800',
      'critica': 'bg-red-200 text-red-900'
    };
    return variants[severity as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'aberto': 'bg-red-100 text-red-800',
      'em_andamento': 'bg-blue-100 text-blue-800',
      'resolvido': 'bg-green-100 text-green-800',
      'cancelado': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = () => {
    onEdit(incident);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes da Ocorrência #{incident.id}</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Colaborador</span>
              </div>
              <p className="font-medium">{incident.employee}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Tipo</span>
              </div>
              <p className="font-medium">{incident.type}</p>
            </div>
          </div>

          {/* Status and Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Gravidade</span>
              </div>
              <Badge className={getSeverityBadge(incident.severity)}>
                {incident.severity}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Status</span>
              </div>
              <Badge className={getStatusBadge(incident.status)}>
                {incident.status}
              </Badge>
            </div>
          </div>

          {/* Date and Reporter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Data</span>
              </div>
              <p className="font-medium">{new Date(incident.date).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Responsável pelo Registro</span>
              </div>
              <p className="font-medium">{incident.reporter}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>Descrição</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">{incident.description}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};