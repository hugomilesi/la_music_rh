
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, FileText } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const VacationCalendar: React.FC = () => {
  const { vacationRequests } = useVacation();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(today);
  };

  const getVacationsForDate = (date: Date) => {
    return vacationRequests.filter(request => {
      if (request.status !== 'aprovado') return false;
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getVacationTooltipContent = (vacation: any, day: Date) => {
    const startDate = new Date(vacation.startDate);
    const endDate = new Date(vacation.endDate);
    const isStartDate = format(startDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    const isEndDate = format(endDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    const daysRemaining = differenceInDays(endDate, day);
    
    return (
      <div className="space-y-2 p-2">
        <div className="flex items-center gap-2 font-semibold">
          <User className="w-4 h-4" />
          {vacation.employeeName}
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>Período: {formatVacationPeriod(vacation.startDate, vacation.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Total: {vacation.days} dias</span>
          </div>
          {!isEndDate && daysRemaining > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Restam: {daysRemaining + 1} dias</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3" />
            <span>Motivo: {vacation.reason}</span>
          </div>
          {isStartDate && (
            <div className="text-green-600 font-medium">🟢 Início das férias</div>
          )}
          {isEndDate && (
            <div className="text-red-600 font-medium">🔴 Último dia de férias</div>
          )}
        </div>
      </div>
    );
  };

  const formatVacationPeriod = (startDate: string, endDate: string) => {
    const start = format(new Date(startDate), 'dd/MM', { locale: ptBR });
    const end = format(new Date(endDate), 'dd/MM', { locale: ptBR });
    return `${start} - ${end}`;
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendário de Férias
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-lg font-semibold text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </div>
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
            const isTodayDate = isToday(day);
            const isCurrentMonthDay = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  p-2 min-h-[80px] border rounded-lg
                  ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                  ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className={`text-sm font-medium mb-1 ${!isCurrentMonthDay ? 'text-gray-400' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {vacations.slice(0, 2).map(vacation => {
                    const isStartDate = format(new Date(vacation.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    const isEndDate = format(new Date(vacation.endDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    
                    return (
                      <Tooltip key={vacation.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                              isStartDate ? 'bg-green-100 text-green-800 border-l-2 border-green-500' :
                              isEndDate ? 'bg-red-100 text-red-800 border-l-2 border-red-500' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <div className="font-medium truncate">{vacation.employeeName}</div>
                            {(isStartDate || isEndDate) && (
                              <div className="text-xs opacity-75">
                                {isStartDate ? 'Início' : 'Fim'} - {vacation.days}d
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          {getVacationTooltipContent(vacation, day)}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {vacations.length > 2 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded cursor-pointer hover:bg-gray-200 transition-colors">
                          +{vacations.length - 2} mais
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-2 p-2">
                          <div className="font-semibold">Outras férias neste dia:</div>
                          {vacations.slice(2).map(vacation => (
                            <div key={vacation.id} className="text-sm">
                              <div className="font-medium">{vacation.employeeName}</div>
                              <div className="text-xs text-gray-600">
                                {formatVacationPeriod(vacation.startDate, vacation.endDate)} ({vacation.days} dias)
                              </div>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-l-2 border-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Início das férias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-sm text-gray-600">Em férias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-l-2 border-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Fim das férias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Hoje</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </TooltipProvider>
  );
};
