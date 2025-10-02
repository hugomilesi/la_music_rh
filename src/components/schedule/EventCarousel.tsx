import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, Calendar, Briefcase, Coffee, GraduationCap, Plane, CheckSquare, Bell, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { ScheduleEvent } from '@/types/schedule';
import { getScheduleUnitInfo } from '@/types/unit';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUnit } from '@/hooks/useUnit';
import { useToast } from '@/hooks/use-toast';
import type { CarouselApi } from '@/components/ui/carousel';
import EventDetailsModal from './EventDetailsModal';

interface EventCarouselProps {
  onEventClick?: (event: ScheduleEvent) => void;
  onEventHover?: (event: ScheduleEvent | null) => void;
  highlightedEventId?: string | null;
  onEventEdit?: (event: ScheduleEvent) => void;
  onEventDelete?: (eventId: string) => void;
}

const EventCarousel: React.FC<EventCarouselProps> = ({ 
  onEventClick, 
  onEventHover,
  highlightedEventId,
  onEventEdit,
  onEventDelete
}) => {
  const { events, deleteEvent } = useSchedule();
  const { selectedUnits } = useUnit();
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filtrar apenas eventos futuros e das unidades selecionadas
  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    return events
      .filter(event => {
        // Filtrar por unidades selecionadas
        if (selectedUnits.length > 0 && !selectedUnits.includes(event.unit)) {
          return false;
        }

        // Filtrar apenas eventos futuros
        const eventDate = event.date || event.event_date;
        const eventTime = event.startTime || event.start_time;
        
        if (eventDate > today) {
          return true;
        }
        
        if (eventDate === today && eventTime > currentTime) {
          return true;
        }
        
        return false;
      })
      .sort((a, b) => {
        const dateA = a.date || a.event_date;
        const dateB = b.date || b.event_date;
        const timeA = a.startTime || a.start_time;
        const timeB = b.startTime || b.start_time;
        
        if (dateA !== dateB) {
          return dateA.localeCompare(dateB);
        }
        return timeA.localeCompare(timeB);
      })
      .slice(0, 20); // Limitar a 20 eventos para performance
  }, [events, selectedUnits]);

  // Auto-scroll functionality with smart pause/resume
  useEffect(() => {
    if (!api || !isAutoScrolling || upcomingEvents.length <= 3 || userInteracted) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000); // Scroll a cada 4 segundos

    return () => clearInterval(interval);
  }, [api, isAutoScrolling, upcomingEvents.length, userInteracted]);

  // Resume auto-scroll after user inactivity
  useEffect(() => {
    if (!userInteracted) return;

    const timeout = setTimeout(() => {
      setUserInteracted(false);
    }, 10000); // Resume after 10 seconds of inactivity

    return () => clearTimeout(timeout);
  }, [userInteracted]);

  // Update carousel state
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Pause auto-scroll on hover and mark user interaction
  const handleMouseEnter = useCallback(() => {
    setIsAutoScrolling(false);
    setUserInteracted(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsAutoScrolling(true);
  }, []);

  // Handle manual navigation
  const handleManualNavigation = useCallback(() => {
    setUserInteracted(true);
  }, []);

  // Event handlers
  const handleEventDetails = useCallback((event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  }, []);

  const handleEventEdit = useCallback((event: ScheduleEvent) => {
    onEventEdit?.(event);
  }, [onEventEdit]);

  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast({
        title: 'Sucesso',
        description: 'Evento excluído com sucesso.',
      });
      onEventDelete?.(eventId);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir evento. Tente novamente.',
        variant: 'destructive',
      });
    }
  }, [deleteEvent, toast, onEventDelete]);

  const handleCardClick = useCallback((event: ScheduleEvent, e: React.MouseEvent) => {
    // Prevent click if clicking on dropdown menu
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      return;
    }
    onEventClick?.(event);
  }, [onEventClick]);

  const getEventTypeIcon = (type: string) => {
    const icons = {
      'meeting': <Briefcase className="w-4 h-4" />,
      'appointment': <Calendar className="w-4 h-4" />,
      'reminder': <Bell className="w-4 h-4" />,
      'task': <CheckSquare className="w-4 h-4" />,
      'vacation': <Plane className="w-4 h-4" />,
      'training': <GraduationCap className="w-4 h-4" />,
      'avaliacao': <User className="w-4 h-4" />,
      'evaluation': <User className="w-4 h-4" />,
      'coffee-connection': <Coffee className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <Calendar className="w-4 h-4" />;
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'meeting': 'bg-gradient-to-br from-green-500 to-emerald-600',
      'appointment': 'bg-gradient-to-br from-blue-500 to-cyan-600',
      'reminder': 'bg-gradient-to-br from-yellow-500 to-amber-600',
      'task': 'bg-gradient-to-br from-purple-500 to-violet-600',
      'vacation': 'bg-gradient-to-br from-gray-500 to-slate-600',
      'training': 'bg-gradient-to-br from-indigo-500 to-blue-600',
      'avaliacao': 'bg-gradient-to-br from-red-500 to-rose-600',
      'evaluation': 'bg-gradient-to-br from-red-500 to-rose-600',
      'coffee-connection': 'bg-gradient-to-br from-orange-500 to-amber-600',
    };
    return colors[type as keyof typeof colors] || 'bg-gradient-to-br from-gray-500 to-slate-600';
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
      'evaluation': 'Avaliação',
      'coffee-connection': 'Coffee Connection'
    };
    return labels[type as keyof typeof labels] || 'Evento';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    }
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  if (upcomingEvents.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Nenhum evento próximo</p>
            <p className="text-sm">Não há eventos agendados para os próximos dias.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
            <p className="text-sm text-gray-600">
              {upcomingEvents.length} evento{upcomingEvents.length !== 1 ? 's' : ''} agendado{upcomingEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Auto-scroll</span>
            </div>
            <span>•</span>
            <span>{current} de {count}</span>
          </div>
        </div>

        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {upcomingEvents.map((event) => {
              const unitInfo = getScheduleUnitInfo(event.unit);
              const eventDate = event.date || event.event_date;
              const startTime = event.startTime || event.start_time;
              const endTime = event.endTime || event.end_time;
              const isHighlighted = highlightedEventId === event.id;

              return (
                <CarouselItem key={event.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="p-1">
                    <Card 
                      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                        isHighlighted ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
                      }`}
                      onClick={(e) => handleCardClick(event, e)}
                      onMouseEnter={() => onEventHover?.(event)}
                      onMouseLeave={() => onEventHover?.(null)}
                    >
                      <div className={`${getEventTypeColor(event.type)} text-white relative`}>
                        {/* Background decorative elements */}
                        <svg
                          className="absolute right-0 top-0 h-full w-2/3 pointer-events-none opacity-20"
                          viewBox="0 0 300 200"
                          fill="none"
                        >
                          <circle cx="220" cy="100" r="90" fill="#fff" fillOpacity="0.1" />
                          <circle cx="260" cy="60" r="60" fill="#fff" fillOpacity="0.15" />
                          <circle cx="200" cy="160" r="50" fill="#fff" fillOpacity="0.08" />
                        </svg>

                        <CardContent className="p-4 relative z-10">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getEventTypeIcon(event.type)}
                                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                                  {getEventTypeLabel(event.type)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs font-medium opacity-90">
                                  {formatDate(eventDate)}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild data-dropdown-trigger>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUserInteracted(true);
                                      }}
                                    >
                                      <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleEventDetails(event)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Ver detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEventEdit(event)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar evento
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleEventDelete(event.id)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Excluir evento
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Title */}
                            <div>
                              <h4 className="font-semibold text-white truncate text-sm">
                                {event.title}
                              </h4>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-xs text-white/90">
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span className="truncate">{event.employee}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${unitInfo.color}`}></div>
                                <span className="truncate">{unitInfo.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span>{startTime} - {endTime}</span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/20">
                              <div className="text-xs text-white/80">
                                Clique para ver detalhes
                              </div>
                              {(event.emailAlert || event.whatsappAlert) && (
                                <div className="flex gap-1">
                                  {event.emailAlert && (
                                    <div className="w-2 h-2 bg-white/60 rounded-full" title="Email alert" />
                                  )}
                                  {event.whatsappAlert && (
                                    <div className="w-2 h-2 bg-white/60 rounded-full" title="WhatsApp alert" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious 
            className="-left-12" 
            onClick={handleManualNavigation}
          />
          <CarouselNext 
            className="-right-12" 
            onClick={handleManualNavigation}
          />
        </Carousel>

        {/* Event Details Modal */}
        <EventDetailsModal
          event={selectedEvent}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
        />
      </CardContent>
    </Card>
  );
};

export default EventCarousel;