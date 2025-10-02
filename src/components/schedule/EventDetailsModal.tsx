import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 p-6 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="150" cy="50" r="30" fill="white" fillOpacity="0.1" />
              <circle cx="180" cy="80" r="20" fill="white" fillOpacity="0.15" />
              <circle cx="120" cy="30" r="15" fill="white" fillOpacity="0.1" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm">
                  {getEventTypeIcon(event.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
                  <Badge className="bg-yellow-400 text-yellow-900 font-semibold px-3 py-1">
                    {getEventTypeLabel(event.type)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-white text-opacity-90">
              <p className="text-lg font-medium">{formatDate(eventDate)}</p>
              <p className="text-white text-opacity-80">{startTime} - {endTime}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Colaborador */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Colaborador</p>
              <p className="text-lg font-semibold text-gray-900">{event.employee}</p>
            </div>
          </div>

          {/* Unidade */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-full ${unitInfo.color} flex items-center justify-center`}>
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unidade</p>
              <p className="text-lg font-semibold text-gray-900">{unitInfo.name}</p>
            </div>
          </div>

          {/* Local */}
          {event.location && (
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Local</p>
                <p className="text-lg font-semibold text-gray-900">{event.location}</p>
              </div>
            </div>
          )}

          {/* Descrição */}
          {event.description && (
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-purple-50 rounded-lg">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Descrição</p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {event.description || 'Sem descrição disponível'}
              </p>
            </div>
          )}

          {/* Alertas */}
          {(event.emailAlert || event.whatsappAlert) && (
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-yellow-50 rounded-lg">
                  <Bell className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="font-medium text-gray-900">Alertas Configurados</p>
              </div>
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
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
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