
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, Edit } from 'lucide-react';
import { ScheduleEvent } from '@/types/schedule';

interface EventDetailsModalProps {
  event: ScheduleEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (eventId: string) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!event) return null;

  const getEventTypeColor = (type: string) => {
    const colors = {
      'plantao': 'bg-blue-100 text-blue-800',
      'avaliacao': 'bg-purple-100 text-purple-800',
      'reuniao': 'bg-green-100 text-green-800',
      'folga': 'bg-gray-100 text-gray-800',
      'outro': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      'plantao': 'Plantão',
      'avaliacao': 'Avaliação',
      'reuniao': 'Reunião',
      'folga': 'Folga',
      'outro': 'Outro'
    };
    return labels[type as keyof typeof labels] || 'Evento';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{event.title}</DialogTitle>
            <Badge className={getEventTypeColor(event.type)}>
              {getEventTypeLabel(event.type)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Event Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{event.employee}</p>
                  <p className="text-sm text-gray-600">Colaborador</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">Data</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{event.startTime} - {event.endTime}</p>
                  <p className="text-sm text-gray-600">Horário</p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-sm text-gray-600">Local</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">{event.unit}</p>
                  <p className="text-sm text-gray-600">Unidade</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {event.description && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-gray-700">{event.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          {(event.emailAlert || event.whatsappAlert) && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Alertas Configurados</h4>
                <div className="flex gap-2">
                  {event.emailAlert && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-2 rounded-lg">
                      <span>📧</span>
                      <span className="text-sm">Email</span>
                    </div>
                  )}
                  {event.whatsappAlert && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-2 rounded-lg">
                      <span>📱</span>
                      <span className="text-sm">WhatsApp</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Metadata */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Informações do Sistema</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Criado em</p>
                  <p>{new Date(event.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Última modificação</p>
                  <p>{new Date(event.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={() => onEdit(event.id)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Evento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;
