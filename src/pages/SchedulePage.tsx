
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const mockEvents = [
  {
    id: 1,
    title: 'Plantão Manhã',
    employee: 'Ana Silva',
    unit: 'Centro',
    time: '08:00 - 12:00',
    type: 'plantao',
    date: '2024-03-21'
  },
  {
    id: 2,
    title: 'Avaliação 360°',
    employee: 'Carlos Santos',
    unit: 'Zona Sul',
    time: '14:00 - 15:00',
    type: 'avaliacao',
    date: '2024-03-21'
  },
  {
    id: 3,
    title: 'Reunião Pedagógica',
    employee: 'Equipe Centro',
    unit: 'Centro',
    time: '16:00 - 17:30',
    type: 'reuniao',
    date: '2024-03-22'
  }
];

const SchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const getEventTypeColor = (type: string) => {
    const colors = {
      'plantao': 'bg-blue-100 text-blue-800',
      'avaliacao': 'bg-purple-100 text-purple-800',
      'reuniao': 'bg-green-100 text-green-800',
      'folga': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

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
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date())}
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
                    <div className="text-lg font-bold">{date.getDate()}</div>
                  </div>
                  
                  <div className="space-y-1 min-h-[600px]">
                    {mockEvents
                      .filter(event => new Date(event.date).toDateString() === date.toDateString())
                      .map(event => (
                        <div
                          key={event.id}
                          className="bg-blue-50 border border-blue-200 rounded p-2 text-xs"
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-gray-600">{event.employee}</div>
                          <div className="text-gray-500">{event.time}</div>
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
            {mockEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.employee} • {event.unit}</p>
                    <p className="text-sm text-gray-500">{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getEventTypeColor(event.type)}>
                    {event.type === 'plantao' ? 'Plantão' : 
                     event.type === 'avaliacao' ? 'Avaliação' : 
                     event.type === 'reuniao' ? 'Reunião' : 'Evento'}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePage;
