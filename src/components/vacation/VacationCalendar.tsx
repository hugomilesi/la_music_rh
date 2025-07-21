
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const VacationCalendar: React.FC = () => {
  const { vacationRequests } = useVacation();
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getVacationsForDate = (date: Date) => {
    return vacationRequests.filter(request => {
      if (request.status !== 'aprovado') return false;
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Calendário de Férias - {format(today, 'MMMM yyyy', { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map(day => {
            const vacations = getVacationsForDate(day);
            const isCurrentMonth = isSameMonth(day, today);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  p-2 min-h-[80px] border rounded-lg
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className={`text-sm font-medium mb-1 ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {vacations.slice(0, 2).map(vacation => (
                    <div
                      key={vacation.id}
                      className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate"
                      title={vacation.employeeName}
                    >
                      {vacation.employeeName}
                    </div>
                  ))}
                  {vacations.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{vacations.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-sm text-gray-600">Colaborador em férias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Hoje</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
