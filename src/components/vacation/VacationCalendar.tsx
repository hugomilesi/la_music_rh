
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, FileText, Users, Plane, CalendarDays } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';
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

  // Calculate vacation statistics
  const vacationStats = useMemo(() => {
    const approvedVacations = vacationRequests.filter(req => req.status === 'aprovado');
    const currentlyOnVacation = approvedVacations.filter(req => {
      const startDate = new Date(req.startDate);
      const endDate = new Date(req.endDate);
      return today >= startDate && today <= endDate;
    });
    
    const upcomingVacations = approvedVacations.filter(req => {
      const startDate = new Date(req.startDate);
      return isAfter(startDate, today) && isBefore(startDate, addDays(today, 30));
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    const scheduledThisMonth = approvedVacations.filter(req => {
      const startDate = new Date(req.startDate);
      const endDate = new Date(req.endDate);
      return (startDate >= monthStart && startDate <= monthEnd) || 
             (endDate >= monthStart && endDate <= monthEnd) ||
             (startDate <= monthStart && endDate >= monthEnd);
    });
    
    return {
      currentlyOnVacation,
      upcomingVacations: upcomingVacations.slice(0, 5),
      scheduledThisMonth: scheduledThisMonth.length,
      totalApproved: approvedVacations.length
    };
  }, [vacationRequests, today, monthStart, monthEnd]);

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
          {/* Vacation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{vacationStats.currentlyOnVacation.length}</p>
                    <p className="text-sm text-blue-600">Em férias hoje</p>
                  </div>
                </div>
                {vacationStats.currentlyOnVacation.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {vacationStats.currentlyOnVacation.slice(0, 3).map(vacation => (
                      <div key={vacation.id} className="text-xs text-blue-700 truncate">
                        • {vacation.employeeName}
                      </div>
                    ))}
                    {vacationStats.currentlyOnVacation.length > 3 && (
                      <div className="text-xs text-blue-600">+{vacationStats.currentlyOnVacation.length - 3} mais</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{vacationStats.upcomingVacations.length}</p>
                    <p className="text-sm text-green-600">Próximas férias (30 dias)</p>
                  </div>
                </div>
                {vacationStats.upcomingVacations.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {vacationStats.upcomingVacations.slice(0, 3).map(vacation => (
                      <div key={vacation.id} className="text-xs text-green-700">
                        • {vacation.employeeName} - {format(new Date(vacation.startDate), 'dd/MM', { locale: ptBR })}
                      </div>
                    ))}
                    {vacationStats.upcomingVacations.length > 3 && (
                      <div className="text-xs text-green-600">+{vacationStats.upcomingVacations.length - 3} mais</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{vacationStats.scheduledThisMonth}</p>
                    <p className="text-sm text-purple-600">Férias este mês</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-purple-700">
                    Total aprovadas: {vacationStats.totalApproved}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
                  p-2 min-h-[90px] border rounded-lg transition-all hover:shadow-md
                  ${isCurrentMonthDay ? 'bg-white' : 'bg-gray-50'}
                  ${isTodayDate ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${vacations.length > 0 ? 'border-blue-200' : ''}
                `}
              >
                <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
                  !isCurrentMonthDay ? 'text-gray-400' : isTodayDate ? 'text-blue-700' : ''
                }`}>
                  <span>{format(day, 'd')}</span>
                  {vacations.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                      {vacations.length}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  {vacations.slice(0, 2).map(vacation => {
                    const isStartDate = format(new Date(vacation.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    const isEndDate = format(new Date(vacation.endDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    
                    return (
                      <Tooltip key={vacation.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`text-xs p-1.5 rounded-md truncate cursor-pointer hover:scale-105 transition-all shadow-sm ${
                              isStartDate ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-l-4 border-green-500' :
                              isEndDate ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-l-4 border-red-500' :
                              'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                            }`}
                          >
                            <div className="font-medium truncate flex items-center gap-1">
                              {isStartDate && <span className="text-green-600">🟢</span>}
                              {isEndDate && <span className="text-red-600">🔴</span>}
                              {vacation.employeeName}
                            </div>
                            {(isStartDate || isEndDate) && (
                              <div className="text-xs opacity-75 mt-0.5">
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
                        <div className="text-xs text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 p-1.5 rounded-md cursor-pointer hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            +{vacations.length - 2} mais
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-2 p-2">
                          <div className="font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Outras férias neste dia:
                          </div>
                          {vacations.slice(2).map(vacation => (
                            <div key={vacation.id} className="text-sm border-l-2 border-blue-200 pl-2">
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

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Legenda do Calendário
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-green-100 to-green-200 border-l-4 border-green-500 rounded-md flex items-center justify-center">
                <span className="text-xs">🟢</span>
              </div>
              <span className="text-sm text-gray-700">Início das férias</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md"></div>
              <span className="text-sm text-gray-700">Em férias</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-red-100 to-red-200 border-l-4 border-red-500 rounded-md flex items-center justify-center">
                <span className="text-xs">🔴</span>
              </div>
              <span className="text-sm text-gray-700">Fim das férias</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 bg-blue-50 rounded-md"></div>
              <span className="text-sm text-gray-700">Hoje</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">3</Badge>
              <span>Número indica quantidade de funcionários em férias no dia</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </TooltipProvider>
  );
};
