
import React from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { getUnitInfo, ScheduleUnit } from '@/types/unit';

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
      'outro': 'bg-orange-100 border-orange-300 text-orange-800',
      'coffee-connection': 'bg-amber-100 border-amber-300 text-amber-800'
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
    
    // Each hour is 80px (20px per slot)
    const top = (startMinutes / 60) * 80;
    const height = ((endMinutes - startMinutes) / 60) * 80;
    
    return { top, height: Math.max(height, 20) }; // Minimum height of 20px
  };

  const { top, height } = getEventPosition();
  const unitInfo = getUnitInfo(event.unit as ScheduleUnit);

  return (
    <div
      className={`absolute left-2 right-2 rounded-md p-2 text-xs cursor-pointer border ${getEventTypeColor(event.type)} hover:shadow-lg hover:scale-105 transition-all z-10`}
      style={{ 
        top: `${top}px`, 
        height: `${height}px`,
        borderLeftWidth: '4px',
        borderLeftColor: unitInfo.color.replace('bg-', '#')
      }}
      onClick={() => onClick(event)}
    >
      <div className="space-y-1 h-full flex flex-col">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${unitInfo.color}`}></div>
          <span className="text-xs font-medium text-gray-600 truncate">{unitInfo.name}</span>
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="font-semibold text-gray-900 truncate leading-tight">{event.title}</div>
          <div className="text-gray-700 truncate font-medium">{event.employee}</div>
          <div className="text-gray-500 text-xs">{event.startTime}</div>
        </div>
        
        {(event.emailAlert || event.whatsappAlert) && (
          <div className="flex gap-1 mt-auto">
            {event.emailAlert && (
              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">📧</span>
            )}
            {event.whatsappAlert && (
              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">📱</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeekEvent;
