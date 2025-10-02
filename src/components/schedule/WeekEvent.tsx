
import React from 'react';
import { ScheduleEvent } from '@/types/schedule';
import { getUnitInfo, ScheduleUnit } from '@/types/unit';

interface WeekEventProps {
  event: ScheduleEvent;
  onClick: (event: ScheduleEvent) => void;
  isHighlighted?: boolean;
  isHovered?: boolean;
}

const WeekEvent: React.FC<WeekEventProps> = ({ event, onClick, isHighlighted = false, isHovered = false }) => {
  const getEventTypeColor = (type: string) => {
    const eventTypeColors = {
      'meeting': 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100',
      'appointment': 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100',
      'reminder': 'bg-yellow-50 border-yellow-200 text-yellow-900 hover:bg-yellow-100',
      'task': 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100',
      'vacation': 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100',
      'training': 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100',
      'avaliacao': 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100',
      'coffee-connection': 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100',
    };
    return eventTypeColors[type as keyof typeof eventTypeColors] || 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100';
  };

  const handleClick = () => {
    onClick(event);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.slice(0, 5); // Format HH:MM
  };

  // Calculate position and height based on time with precise grid alignment
  const getEventPosition = () => {
    const startTime = event.startTime || event.start_time || '08:00';
    const endTime = event.endTime || event.end_time || '09:00';
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Each hour slot is 80px (h-20 in Tailwind = 80px)
    // Calculate position based on hour slots
    const top = startHour * 80 + (startMinute * 80) / 60;
    const endPosition = endHour * 80 + (endMinute * 80) / 60;
    const height = endPosition - top;
    
    return { 
      top: Math.max(0, top), 
      height: Math.max(20, height) // Minimum height for visibility
    };
  };

  const { top, height } = getEventPosition();
  const unitInfo = getUnitInfo(event.unit as ScheduleUnit);

  // Get unit accent color for border
  const getUnitAccentColor = (unitColor: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-green-500': '#10b981',
      'bg-blue-500': '#3b82f6',
      'bg-purple-500': '#8b5cf6',
      'bg-yellow-500': '#eab308',
      'bg-red-500': '#ef4444',
      'bg-indigo-500': '#6366f1',
      'bg-pink-500': '#ec4899',
      'bg-teal-500': '#14b8a6',
    };
    return colorMap[unitColor] || '#6b7280';
  };

  return (
    <div
      className={`absolute left-1 right-1 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md z-10 ${
        getEventTypeColor(event.type || 'appointment')
      } ${
        isHighlighted ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${
        isHovered ? 'scale-105 shadow-lg' : ''
      }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        minHeight: '20px'
      }}
      onClick={handleClick}
      title={`${event.title || event.name || 'Evento sem título'} - ${formatTime(event.startTime || event.start_time)} às ${formatTime(event.endTime || event.end_time)}`}
    >
      <div className="p-1.5 sm:p-2 h-full flex items-center justify-center">
        <h4 className="font-medium text-xs sm:text-sm leading-tight text-center truncate w-full">
          {event.title || event.name || 'Evento sem título'}
        </h4>
      </div>
    </div>
  );
};

export default WeekEvent;
