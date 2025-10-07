import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Clock,
  MapPin,
  User,
  Calendar,
  Briefcase,
  Coffee,
  GraduationCap,
  Plane,
  CheckSquare,
  Bell,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { ScheduleEvent } from '@/types/schedule';
import { getScheduleUnitInfo } from '@/types/unit';

interface EventDetailsModalProps {
  event: ScheduleEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: ScheduleEvent) => void;
  onDelete?: (eventId: string) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!event) return null;

  const unitInfo = getScheduleUnitInfo(event.unit);
  const eventDate = event.date || event.event_date;
  const startTime = event.startTime || event.start_time;
  const endTime = event.endTime || event.end_time;

  const getEventTypeIcon = (type: string) => {
    const icons = {
      'meeting': <Briefcase className="w-5 h-5" />,
      'appointment': <Calendar className="w-5 h-5" />,
      'reminder': <Bell className="w-5 h-5" />,
      'task': <CheckSquare className="w-5 h-5" />,
      'vacation': <Plane className="w-5 h-5" />,
      'training': <GraduationCap className="w-5 h-5" />,
      'avaliacao': <User className="w-5 h-5" />,
      'coffee-connection': <Coffee className="w-5 h-5" />,
    };
    return icons[type as keyof typeof icons] || <Calendar className="w-5 h-5" />;
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      'meeting': 'Reunião',
      'appointment': 'Compromisso',
      'reminder': 'Lembrete',
      'task': 'Tarefa',
      'vacation': 'Férias',
      'training': 'Treinamento',
      'avaliacao': 'Avaliação',
      'coffee-connection': 'Coffee Connection'
    };
    return labels[type as keyof typeof labels] || 'Evento';
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'meeting': 'bg-green-100 text-green-800',
      'appointment': 'bg-blue-100 text-blue-800',
      'reminder': 'bg-yellow-100 text-yellow-800',
      'task': 'bg-purple-100 text-purple-800',
      'vacation': 'bg-gray-100 text-gray-800',
      'training': 'bg-indigo-100 text-indigo-800',
      'avaliacao': 'bg-red-100 text-red-800',
      'coffee-connection': 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = () => {
    onEdit?.(event);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      onDelete?.(event.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            <Badge className={getEventTypeColor(event.type)}>
              {getEventTypeLabel(event.type)}
            </Badge>
          </div>
          <DialogDescription>
            Detalhes do evento {getEventTypeLabel(event.type)} agendado para {formatDate(eventDate)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Grid de informações em cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colaborador */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Colaborador</p>
                    <p className="font-semibold">{event.employee}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data e Horário */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Data e Horário</p>
                    <p className="font-semibold">{formatDate(eventDate)}</p>
                    <p className="text-sm text-gray-500">{startTime} - {endTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unidade */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${unitInfo.color.replace('bg-', '').replace('text-', '')}`}></div>
                  <div>
                    <p className="text-sm text-gray-600">Unidade</p>
                    <p className="font-semibold">{unitInfo.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Local */}
            {event.location && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Local</p>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Descrição em card separado */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Descrição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{event.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Alertas */}
          {(event.emailAlert || event.whatsappAlert) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alertas Configurados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {event.emailAlert && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <span className="text-lg">📧</span>
                      <span className="text-sm font-medium text-blue-800">Email</span>
                    </div>
                  )}
                  {event.whatsappAlert && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                      <span className="text-lg">📱</span>
                      <span className="text-sm font-medium text-green-800">WhatsApp</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;