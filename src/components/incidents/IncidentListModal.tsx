
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { Incident } from '@/contexts/IncidentsContext';

interface IncidentListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidents: Incident[];
  title: string;
}

export const IncidentListModal: React.FC<IncidentListModalProps> = ({
  open,
  onOpenChange,
  incidents,
  title
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Gravidade</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.employee}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityBadge(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                  <TableCell>{new Date(incident.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(incident.status)}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {incidents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma ocorrência encontrada
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
