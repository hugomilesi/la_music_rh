import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useToast } from '@/hooks/use-toast';
import { ScheduleEvent } from '@/types/schedule';
import NewEventDialog from '@/components/schedule/NewEventDialog';
import EventDetailsModal from '@/components/schedule/EventDetailsModal';
import EditEventDialog from '@/components/schedule/EditEventDialog';

const SchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { events } = useSchedule();
  const { toast } = useToast();

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

  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  // Generate calendar days for month view
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    toast({
      title: 'Navegação',
      description: 'Voltou para a data atual.',
    });
  };

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
    const eventToEdit = events.find(event => event.id === eventId);
    if (eventToEdit) {
      setSelectedEvent(eventToEdit);
      setShowEventDetails(false);
      setShowEditDialog(true);
    }
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedEvent(null);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Gestão de plantões, escalas e eventos</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
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
                  {viewMode === 'week' 
                    ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                    : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  }
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
          {viewMode === 'week' && (
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
                  <div className="space-y-12">
                    <div className="h-8"></div>
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="text-xs text-gray-500 h-12 flex items-start">
                        {8 + i}:00
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {currentWeek.map((date, dayIndex) => (
                    <div key={dayIndex} className="space-y-2">
                      <div className="text-center py-2 border-b">
                        <div className="text-sm font-medium">{weekDays[dayIndex]}</div>
                        <div className={`text-lg font-bold ${
                          date.toDateString() === new Date().toDateString() 
                            ? 'text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                            : ''
                        }`}>
                          {date.getDate()}
                        </div>
                      </div>
                      
                      <div className="space-y-1 min-h-[600px]">
                        {getEventsForDate(date).map(event => (
                          <div
                            key={event.id}
                            className="bg-blue-50 border border-blue-200 rounded p-2 text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-gray-600">{event.employee}</div>
                            <div className="text-gray-500">{event.startTime} - {event.endTime}</div>
                            {(event.emailAlert || event.whatsappAlert) && (
                              <div className="flex gap-1 mt-1">
                                {event.emailAlert && (
                                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">📧</span>
                                )}
                                {event.whatsappAlert && (
                                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">📱</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly View */}
          {viewMode === 'month' && (
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
                  {getMonthDays().map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayEvents = getEventsForDate(date);

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-2 border rounded-lg ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${
                          isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        } hover:border-gray-300 transition-colors`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${
                          isToday ? 'text-blue-600' : ''
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded cursor-pointer ${getEventTypeColor(event.type)}`}
                              onClick={() => handleEventClick(event)}
                            >
                              {event.title}
                            </div>
                          ))}
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
                {events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum evento agendado</p>
                    <p className="text-sm">Clique em "Novo Evento" para adicionar um evento à agenda</p>
                  </div>
                ) : (
                  events.slice(0, 5).map(event => (
                    <div 
                      key={event.id} 
                      className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{event.title}</h4>
                          <p className="text-xs text-gray-600 truncate">{event.employee}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.startTime} - {event.endTime}
                          </p>
                        </div>
                        <Badge className={`${getEventTypeColor(event.type)} text-xs`}>
                          {getEventTypeLabel(event.type)}
                        </Badge>
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
                  ))
                )}
                
                {events.length > 5 && (
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
    </div>
  );
};

export default SchedulePage;
