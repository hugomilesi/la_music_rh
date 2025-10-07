
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Filter, Calendar, ChevronLeft, ChevronRight, Clock, Plus, MapPin, User, RefreshCw } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUnit } from '@/hooks/useUnit';
import { useToast } from '@/hooks/use-toast';
import { ScheduleEvent } from '@/types/schedule';
import { getScheduleUnitInfo } from '@/types/unit';
import NewEventDialog from '@/components/schedule/NewEventDialog';
import EventDetailsModal from '@/components/schedule/EventDetailsModal';
import EditEventDialog from '@/components/schedule/EditEventDialog';
import DayEventsDialog from '@/components/schedule/DayEventsDialog';
import WeekEvent from '@/components/schedule/WeekEvent';
import TimeSlot from '@/components/schedule/TimeSlot';
import { UnitSelector } from '@/components/common/UnitSelector';
import { useDateDialog } from '@/hooks/useDateDialog';
import { useScheduleCalendar } from '@/hooks/useScheduleCalendar';
import { ScheduleStats } from '@/components/schedule/ScheduleStats';
import { EventQuickActions } from '@/components/schedule/EventQuickActions';
import EventCarousel from '@/components/schedule/EventCarousel';

const SchedulePage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [duplicateEvent, setDuplicateEvent] = useState<ScheduleEvent | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const { hasAnyUnitSelected } = useUnit();
  const { toast } = useToast();
  const { refreshEvents, isLoading } = useSchedule();

  const {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    filteredEvents,
    currentWeek,
    getMonthDays,
    navigateWeek,
    navigateMonth,
    goToToday,
    navigateToDate,
    getEventsForDate
  } = useScheduleCalendar();

  const {
    selectedDate,
    selectedEvents,
    showNewEventDialog,
    showDayEventsDialog,
    openDialogForDate,
    closeDayEventsDialog,
    closeNewEventDialog,
    openNewEventFromDay
  } = useDateDialog();

  const getEventTypeColor = (type: string) => {
    const colors = {
      'meeting': 'bg-green-100 text-green-800',
      'appointment': 'bg-blue-100 text-blue-800',
      'reminder': 'bg-yellow-100 text-yellow-800',
      'task': 'bg-purple-100 text-purple-800',
      'vacation': 'bg-gray-100 text-gray-800',
      'training': 'bg-indigo-100 text-indigo-800',
      'avaliacao': 'bg-red-100 text-red-800',
      'evaluation': 'bg-red-100 text-red-800',
      'coffee-connection': 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const handleGoogleSync = () => {
    toast({
      title: 'Google Calendar',
      description: 'Sincronização com Google Calendar será implementada em breve.',
    });
  };

  const handleFilters = () => {
    setShowFilters(!showFilters);
    toast({
      title: 'Filtros',
      description: showFilters ? 'Filtros ocultados' : 'Filtros exibidos',
    });
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (eventOrId: string | ScheduleEvent) => {
    let eventToEdit: ScheduleEvent | undefined;
    
    if (typeof eventOrId === 'string') {
      // Se recebeu um ID, busca o evento
      eventToEdit = filteredEvents.find(event => event.id === eventOrId);
    } else {
      // Se recebeu o evento completo, usa diretamente
      eventToEdit = eventOrId;
    }
    
    if (eventToEdit) {
      setSelectedEvent(eventToEdit);
      setShowEventDetails(false);
      setShowEditDialog(true);
    }
  };

  const handleDuplicateEvent = (event: ScheduleEvent) => {
    setDuplicateEvent(event);
    openDialogForDate(new Date(event.date), []);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedEvent(null);
  };

  const handleDayClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    openDialogForDate(date, dayEvents);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
    openDialogForDate(slotDate, []);
  };

  const handleEventClickFromDay = (event: ScheduleEvent) => {
    closeDayEventsDialog();
    handleEventClick(event);
  };

  // Funções para interatividade bidirecional com o carrossel
  const handleCarouselEventClick = (event: ScheduleEvent) => {
    // Destacar o evento no calendário
    setHighlightedEventId(event.id);
    
    // Navegar para a data do evento
    const eventDate = new Date(event.date || event.event_date);
    
    // Se estiver na visão de semana, navegar para a semana do evento
    if (viewMode === 'week') {
      const eventWeekStart = new Date(eventDate);
      eventWeekStart.setDate(eventDate.getDate() - eventDate.getDay());
      
      const currentWeekStart = new Date(currentDate);
      currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
      
      if (eventWeekStart.getTime() !== currentWeekStart.getTime()) {
        setCurrentDate(eventDate);
      }
    }
    // Se estiver na visão de mês, navegar para o mês do evento
    else if (viewMode === 'month') {
      if (eventDate.getMonth() !== currentDate.getMonth() || 
          eventDate.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(eventDate);
      }
    }
    
    // Abrir detalhes do evento após um pequeno delay para permitir a navegação
    setTimeout(() => {
      handleEventClick(event);
    }, 300);
    
    // Limpar o highlight após 5 segundos
    setTimeout(() => {
      setHighlightedEventId(null);
    }, 5000);
  };

  const handleCarouselEventHover = (event: ScheduleEvent | null) => {
    setHoveredEventId(event?.id || null);
  };

  const handleCalendarEventClick = (event: ScheduleEvent) => {
    // Destacar o evento no carrossel
    setHighlightedEventId(event.id);
    handleEventClick(event);
    
    // Limpar o highlight após 5 segundos
    setTimeout(() => {
      setHighlightedEventId(null);
    }, 5000);
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-600 mt-1">Gestão de plantões, escalas e eventos por unidade</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <UnitSelector />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshEvents}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={handleGoogleSync}>
              <Calendar className="w-4 h-4 mr-2" />
              Sincronizar Google
            </Button>
            <NewEventDialog />
          </div>
        </div>

        {/* Unit Warning */}
        {!hasAnyUnitSelected && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <span className="text-lg">⚠️</span>
                <p className="font-medium">
                  Nenhuma unidade selecionada. Selecione pelo menos uma unidade para visualizar os eventos.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {hasAnyUnitSelected && (
          <ScheduleStats 
            events={filteredEvents} 
            selectedDate={currentDate}
          />
        )}

        {/* Event Carousel */}
        {hasAnyUnitSelected && (
          <EventCarousel
            onEventClick={handleCarouselEventClick}
            onEventHover={handleCarouselEventHover}
            highlightedEventId={highlightedEventId}
            onEventEdit={handleEditEvent}
            onEventDelete={(eventId) => {
              // Refresh events after deletion
              refreshEvents();
            }}
          />
        )}

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tipo:</span>
                  <div className="flex gap-2">
                    {['meeting', 'appointment', 'reminder', 'task', 'vacation', 'training'].map(type => (
                      <Badge key={type} variant="outline" className="cursor-pointer hover:bg-gray-100">
                        {getEventTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToToday}
                >
                  Hoje
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Semana
                  </Button>
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Mês
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <div className="w-full">
            {/* Weekly View */}
            {viewMode === 'week' && hasAnyUnitSelected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Visão Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Sticky Headers */}
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                      <div className="grid grid-cols-8 gap-2">
                        {/* Empty space for time column */}
                        <div className="h-16"></div>
                        
                        {/* Day headers */}
                        {currentWeek.map((date, dayIndex) => (
                          <div key={dayIndex} className="text-center py-2 h-16 flex flex-col justify-center bg-white">
                            <div className="text-sm font-medium">{weekDays[dayIndex]}</div>
                            <div className={`text-lg font-bold ${
                              date.toDateString() === new Date().toDateString() 
                                ? 'text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                                : ''
                            }`}>
                              {date.getDate()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Scrollable content */}
                    <div className="overflow-y-auto max-h-[600px]">
                      <div className="grid grid-cols-8 gap-2">
                        {/* Time column */}
                        <div className="space-y-0">
                          {timeSlots.map(hour => (
                            <div key={hour} className="h-20 flex items-start text-sm text-gray-500 border-b border-gray-100 px-2">
                              {hour}:00
                            </div>
                          ))}
                        </div>

                        {/* Day columns */}
                        {currentWeek.map((date, dayIndex) => (
                          <div key={dayIndex} className="relative">
                            <div className="relative overflow-hidden">
                              {/* Time slots */}
                              {timeSlots.map(hour => (
                                <TimeSlot
                                  key={hour}
                                  hour={hour}
                                  date={date}
                                  onSlotClick={handleTimeSlotClick}
                                />
                              ))}
                              
                              {/* Events */}
                              {getEventsForDate(date).map(event => (
                                <WeekEvent
                                  key={event.id}
                                  event={event}
                                  onClick={handleCalendarEventClick}
                                  isHighlighted={highlightedEventId === event.id}
                                  isHovered={hoveredEventId === event.id}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Monthly View */}
            {viewMode === 'month' && hasAnyUnitSelected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Visão Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Month header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Month days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getMonthDays.map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isToday = date.toDateString() === new Date().toDateString();
                      const dayEvents = getEventsForDate(date);

                      return (
                        <div
                          key={`date-${index}`}
                          className={`min-h-[120px] p-3 border rounded-lg cursor-pointer ${
                            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          } ${
                            isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          } hover:border-gray-300 hover:shadow-md transition-all`}
                          onClick={() => handleDayClick(date)}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          } ${
                            isToday ? 'text-blue-600' : ''
                          }`}>
                            {date.getDate()}
                          </div>
                          
                          <div className="space-y-2 mt-2">
                            {dayEvents.slice(0, 2).map(event => {
                              const unitInfo = getScheduleUnitInfo(event.unit);
                              return (
                                <Tooltip key={event.id}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`text-xs p-2 rounded-md ${getEventTypeColor(event.type)} border-l-3 relative group cursor-pointer hover:opacity-90 hover:shadow-sm transition-all ${
                                        highlightedEventId === event.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                                      } ${
                                        hoveredEventId === event.id ? 'opacity-80 scale-105' : ''
                                      }`}
                                      style={{ borderLeftColor: unitInfo.color.replace('bg-', '#') }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCalendarEventClick(event);
                                      }}
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1">
                                          <div className={`w-2 h-2 rounded-full ${unitInfo.color}`}></div>
                                          <span className="font-medium truncate">{event.title}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 truncate">{event.employee}</div>
                                        <div className="text-xs text-gray-500">{event.startTime}</div>
                                      </div>
                                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <EventQuickActions
                                          event={event}
                                          onView={handleEventClick}
                                          onEdit={() => handleEditEvent(event.id)}
                                          onDuplicate={handleDuplicateEvent}
                                        />
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <div className="space-y-2 p-2">
                                      <div className="flex items-center gap-2 font-semibold">
                                        <User className="w-4 h-4" />
                                        {event.employee}
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-3 h-3" />
                                          <span>Tipo: {getEventTypeLabel(event.type)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-3 h-3" />
                                          <span>Horário: {event.startTime} - {event.endTime}</span>
                                        </div>
                                        {event.location && (
                                          <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            <span>Local: {event.location}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <div className={`w-3 h-3 rounded-full ${unitInfo.color}`}></div>
                                          <span>Unidade: {unitInfo.name}</span>
                                        </div>
                                        {event.description && (
                                          <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-600">{event.description}</p>
                                          </div>
                                        )}
                                        {(event.emailAlert || event.whatsappAlert) && (
                                          <div className="flex gap-1 mt-2">
                                            {event.emailAlert && (
                                              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">📧 Email</span>
                                            )}
                                            {event.whatsappAlert && (
                                              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">📱 WhatsApp</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayEvents.length - 2} mais
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Modals */}
        <EventDetailsModal
          event={selectedEvent}
          isOpen={showEventDetails}
          onClose={handleCloseEventDetails}
          onEdit={handleEditEvent}
        />

        <EditEventDialog
          event={selectedEvent}
          isOpen={showEditDialog}
          onClose={handleCloseEditDialog}
        />

        <DayEventsDialog
          date={selectedDate}
          events={selectedEvents}
          isOpen={showDayEventsDialog}
          onClose={closeDayEventsDialog}
          onEventClick={handleEventClickFromDay}
          onNewEvent={openNewEventFromDay}
        />

        <NewEventDialog
          preselectedDate={selectedDate}
          isOpen={showNewEventDialog}
          onClose={closeNewEventDialog}
        />
      </div>
    </TooltipProvider>
  );
};

export default SchedulePage;
