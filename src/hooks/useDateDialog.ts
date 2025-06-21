
import { useState } from 'react';
import { ScheduleEvent } from '@/types/schedule';

export const useDateDialog = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<ScheduleEvent[]>([]);
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [showDayEventsDialog, setShowDayEventsDialog] = useState(false);

  const openDialogForDate = (date: Date, events: ScheduleEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
    
    if (events.length === 0) {
      setShowNewEventDialog(true);
    } else {
      setShowDayEventsDialog(true);
    }
  };

  const closeDayEventsDialog = () => {
    setShowDayEventsDialog(false);
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const closeNewEventDialog = () => {
    setShowNewEventDialog(false);
    setSelectedDate(null);
  };

  const openNewEventFromDay = () => {
    setShowDayEventsDialog(false);
    setShowNewEventDialog(true);
  };

  return {
    selectedDate,
    selectedEvents,
    showNewEventDialog,
    showDayEventsDialog,
    openDialogForDate,
    closeDayEventsDialog,
    closeNewEventDialog,
    openNewEventFromDay
  };
};
