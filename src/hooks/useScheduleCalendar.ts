
import { useState, useMemo } from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useUnit } from '@/contexts/UnitContext';
import { useToast } from '@/hooks/use-toast';

export const useScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const { getEventsForUnits } = useSchedule();
  const { selectedUnits } = useUnit();
  const { toast } = useToast();

  const filteredEvents = useMemo(() => {
    return getEventsForUnits(selectedUnits);
  }, [getEventsForUnits, selectedUnits]);

  const currentWeek = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - date.getDay() + i);
      return date;
    });
  }, [currentDate]);

  const getMonthDays = useMemo(() => {
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
  }, [currentDate]);

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

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const checkEventConflicts = (newEvent: {
    employeeId: string;
    date: string;
    startTime: string;
    endTime: string;
  }, excludeEventId?: string) => {
    const conflicts = filteredEvents.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      
      return (
        event.employeeId === newEvent.employeeId &&
        event.date === newEvent.date &&
        ((newEvent.startTime >= event.startTime && newEvent.startTime < event.endTime) ||
         (newEvent.endTime > event.startTime && newEvent.endTime <= event.endTime) ||
         (newEvent.startTime <= event.startTime && newEvent.endTime >= event.endTime))
      );
    });

    return conflicts;
  };

  return {
    currentDate,
    viewMode,
    setViewMode,
    filteredEvents,
    currentWeek,
    getMonthDays,
    navigateWeek,
    navigateMonth,
    goToToday,
    getEventsForDate,
    checkEventConflicts
  };
};
