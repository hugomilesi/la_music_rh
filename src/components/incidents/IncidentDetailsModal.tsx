
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Incident } from '@/types/incident';
import { useIncident } from '@/contexts/IncidentContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, User, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface IncidentDetailsModalProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({ 
  incident, 
  open, 
  onOpenChange 
}) => {
  const { updateIncident } = useIncident();
  const { toast } = useToast();
  const [resolution, setResolution] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!incident) return null;

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

  const handleResolve = () => {
    if (!resolution.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione uma resolução para a ocorrência.",
        variant: "destructive"
      });
      return;
    }

    updateIncident(incident.id, {
      status: 'resolvido',
      resolution,
      resolvedBy: 'Admin',
      resolvedDate: new Date().toISOString().split('T')[0]
    });

    toast({
      title: "Sucesso",
      description: "Ocorrência resolvida com sucesso.",
    });

    setResolution('');
    setIsResolving(false);
    onOpenChange(false);
  };

  const handleArchive = () => {
    updateIncident(incident.id, {
      status: 'arquivado'
    });

    toast({
      title: "Sucesso",
      description: "Ocorrência arquivada com sucesso.",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Ocorrência</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{incident.employee}</h3>
              <p className="text-sm text-gray-600">#{incident.id}</p>
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

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-medium">{incident.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Data</p>
                <p className="font-medium">{new Date(incident.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Responsável</p>
                <p className="font-medium">{incident.reporter}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Criado em</p>
                <p className="font-medium">{new Date(incident.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Descrição</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">{incident.description}</p>
            </div>
          </div>

          {/* Resolution (if resolved) */}
          {incident.status === 'resolvido' && incident.resolution && (
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Resolução
              </Label>
              <div className="mt-1 p-3 bg-green-50 rounded-md">
                <p className="text-sm">{incident.resolution}</p>
                <div className="mt-2 text-xs text-gray-600">
                  Resolvido por {incident.resolvedBy} em {incident.resolvedDate && new Date(incident.resolvedDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          )}

          {/* Resolution Form (for active incidents) */}
          {incident.status === 'ativo' && (
            <div className="space-y-4">
              {isResolving ? (
                <div>
                  <Label htmlFor="resolution">Resolução</Label>
                  <Textarea
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Descreva como a ocorrência foi resolvida..."
                    rows={3}
                  />
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                {!isResolving ? (
                  <>
                    <Button variant="outline" onClick={handleArchive}>
                      Arquivar
                    </Button>
                    <Button onClick={() => setIsResolving(true)}>
                      Resolver
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => {
                      setIsResolving(false);
                      setResolution('');
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleResolve}>
                      Confirmar Resolução
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
