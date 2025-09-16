
import React from 'react';

interface TimeSlotProps {
  hour: number;
  date: Date;
  onSlotClick: (date: Date, hour: number) => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ hour, date, onSlotClick }) => {
  return (
    <div 
      className="border-t border-gray-100 h-20 hover:bg-blue-50 cursor-pointer transition-colors relative"
      onClick={() => onSlotClick(date, hour)}
    >
      {/* Visual separator every 15 minutes */}
      <div className="absolute top-5 left-0 right-0 border-t border-gray-50"></div>
      <div className="absolute top-10 left-0 right-0 border-t border-gray-50"></div>
      <div className="absolute top-15 left-0 right-0 border-t border-gray-50"></div>
    </div>
  );
};

export default TimeSlot;
