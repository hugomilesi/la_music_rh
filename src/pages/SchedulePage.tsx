
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import NewEventDialog from '@/components/schedule/NewEventDialog';

const SchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const { events } = useSchedule();

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
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Sincronizar Google
          </Button>
          <NewEventDialog />
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigateWeek('next')}
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
                    {events
                      .filter(event => event.date === date.toISOString().split('T')[0])
                      .map(event => (
                        <div
                          key={event.id}
                          className="bg-blue-50 border border-blue-200 rounded p-2 text-xs cursor-pointer hover:bg-blue-100 transition-colors"
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

      {/* Events List */}
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
              events.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.employee} • {event.unit}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('pt-BR')} • {event.startTime} - {event.endTime}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getEventTypeColor(event.type)}>
                      {getEventTypeLabel(event.type)}
                    </Badge>
                    {(event.emailAlert || event.whatsappAlert) && (
                      <div className="flex gap-1">
                        {event.emailAlert && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded" title="Alerta por email">📧</span>
                        )}
                        {event.whatsappAlert && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded" title="Alerta por WhatsApp">📱</span>
                        )}
                      </div>
                    )}
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePage;
