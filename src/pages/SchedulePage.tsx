
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUnit } from '@/contexts/UnitContext';
import { useToast } from '@/hooks/use-toast';
import { ScheduleEvent } from '@/types/schedule';
import { getUnitInfo } from '@/types/unit';
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

const SchedulePage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [duplicateEvent, setDuplicateEvent] = useState<ScheduleEvent | null>(null);
  const { hasAnyUnitSelected } = useUnit();
  const { toast } = useToast();

  const {
    currentDate,
    viewMode,
    setViewMode,
    filteredEvents,
    currentWeek,
    getMonthDays,
    navigateWeek,
    navigateMonth,
    goToToday,
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

  const handleEditEvent = (eventId: string) => {
    const eventToEdit = filteredEvents.find(event => event.id === eventId);
    if (eventToEdit) {
      setSelectedEvent(eventToEdit);
      setShowEventDetails(false);
      setShowEditDialog(true);
    }
  };

  const handleDuplicateEvent = (event: ScheduleEvent) => {
    setDuplicateEvent(event);
    // Abrir dialog de novo evento com dados pré-preenchidos
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

  const timeSlots = Array.from({ length: 14 }, (_, i) => 8 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Gestão de plantões, escalas e eventos por unidade</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <UnitSelector />
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
        <ScheduleStats events={filteredEvents} selectedDate={currentDate} />
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tipo:</span>
                <div className="flex gap-2">
                  {['plantao', 'avaliacao', 'reuniao', 'folga', 'outro'].map(type => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
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
                <div className="grid grid-cols-8 gap-2">
                  {/* Time column */}
                  <div className="space-y-0">
                    <div className="h-16 border-b border-gray-200"></div>
                    {timeSlots.map(hour => (
                      <div key={hour} className="h-12 flex items-start text-xs text-gray-500 border-b border-gray-100">
                        {hour}:00
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {currentWeek.map((date, dayIndex) => (
                    <div key={dayIndex} className="relative">
                      <div className="text-center py-2 border-b border-gray-200 h-16 flex flex-col justify-center">
                        <div className="text-sm font-medium">{weekDays[dayIndex]}</div>
                        <div className={`text-lg font-bold ${
                          date.toDateString() === new Date().toDateString() 
                            ? 'text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                            : ''
                        }`}>
                          {date.getDate()}
                        </div>
                      </div>
                      
                      <div className="relative">
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
                            onClick={handleEventClick}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
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
                        key={index}
                        className={`min-h-[100px] p-2 border rounded-lg cursor-pointer ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${
                          isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        } hover:border-gray-300 hover:shadow-sm transition-all`}
                        onClick={() => handleDayClick(date)}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${
                          isToday ? 'text-blue-600' : ''
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => {
                            const unitInfo = getUnitInfo(event.unit);
                            return (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded ${getEventTypeColor(event.type)} border-l-2 relative group`}
                                style={{ borderLeftColor: unitInfo.color.replace('bg-', '#') }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 flex-1 min-w-0">
                                    <div className={`w-2 h-2 rounded-full ${unitInfo.color}`}></div>
                                    <span className="truncate">{event.title}</span>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <EventQuickActions
                                      event={event}
                                      onView={handleEventClick}
                                      onEdit={() => handleEditEvent(event.id)}
                                      onDuplicate={handleDuplicateEvent}
                                    />
                                  </div>
                                </div>
                              </div>
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

        {/* Events List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!hasAnyUnitSelected ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma unidade</p>
                    <p className="text-sm">Escolha uma ou mais unidades para ver os eventos</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum evento agendado</p>
                    <p className="text-sm">Clique em "Novo Evento" para adicionar um evento à agenda</p>
                  </div>
                ) : (
                  filteredEvents.slice(0, 5).map(event => {
                    const unitInfo = getUnitInfo(event.unit);
                    return (
                      <div 
                        key={event.id} 
                        className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer group"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${unitInfo.color}`}></div>
                              <span className="text-xs text-gray-500">{unitInfo.name}</span>
                            </div>
                            <h4 className="font-medium text-sm truncate">{event.title}</h4>
                            <p className="text-xs text-gray-600 truncate">{event.employee}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.date).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getEventTypeColor(event.type)} text-xs`}>
                              {getEventTypeLabel(event.type)}
                            </Badge>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <EventQuickActions
                                event={event}
                                onView={handleEventClick}
                                onEdit={() => handleEditEvent(event.id)}
                                onDuplicate={handleDuplicateEvent}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {(event.emailAlert || event.whatsappAlert) && (
                          <div className="flex gap-1 mt-2">
                            {event.emailAlert && (
                              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">📧</span>
                            )}
                            {event.whatsappAlert && (
                              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">📱</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                
                {filteredEvents.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver todos os eventos
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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
  );
};

export default SchedulePage;
