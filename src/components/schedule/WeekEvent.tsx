
import React from 'react';
import { ScheduleEvent } from '@/types/schedule';

interface WeekEventProps {
  event: ScheduleEvent;
  onClick: (event: ScheduleEvent) => void;
}

const WeekEvent: React.FC<WeekEventProps> = ({ event, onClick }) => {
  const getEventTypeColor = (type: string) => {
    const colors = {
      'plantao': 'bg-blue-100 border-blue-300 text-blue-800',
      'avaliacao': 'bg-purple-100 border-purple-300 text-purple-800',
      'reuniao': 'bg-green-100 border-green-300 text-green-800',
      'folga': 'bg-gray-100 border-gray-300 text-gray-800',
      'outro': 'bg-orange-100 border-orange-300 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  // Calculate position and height based on time
  const getEventPosition = () => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    
    // Convert to minutes from 8:00 AM
    const startMinutes = (startHour - 8) * 60 + startMinute;
    const endMinutes = (endHour - 8) * 60 + endMinute;
    
    // Each hour is 48px (12 slots * 4px)
    const top = (startMinutes / 60) * 48;
    const height = ((endMinutes - startMinutes) / 60) * 48;
    
    return { top, height: Math.max(height, 20) }; // Minimum height of 20px
  };

  const { top, height } = getEventPosition();

  return (
    <div
      className={`absolute left-1 right-1 rounded p-1 text-xs cursor-pointer border ${getEventTypeColor(event.type)} hover:shadow-md transition-all z-10`}
      style={{ top: `${top}px`, height: `${height}px` }}
      onClick={() => onClick(event)}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="text-gray-600 truncate">{event.employee}</div>
      <div className="text-gray-500">{event.startTime}</div>
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
  );
};

export default WeekEvent;
