
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Birthday } from './types';

interface BirthdayItemProps {
  birthday: Birthday;
  onMarkAsCelebrated?: (id: string) => void;
  showActions?: boolean;
}

export const BirthdayItem: React.FC<BirthdayItemProps> = ({ 
  birthday, 
  onMarkAsCelebrated, 
  showActions = false 
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
      <div className={`w-10 h-10 bg-gradient-to-r ${birthday.gradient} rounded-full flex items-center justify-center text-white font-semibold`}>
        {birthday.initials}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{birthday.name}</p>
        <p className="text-sm text-gray-600">{birthday.position} • {birthday.unit}</p>
      </div>
      <div className="flex items-center gap-2">
        {birthday.celebrated && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Parabenizado
          </Badge>
        )}
        {showActions && !birthday.celebrated && onMarkAsCelebrated && (
          <Button 
            size="sm" 
            onClick={() => onMarkAsCelebrated(birthday.id)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Marcar como Parabenizado
          </Button>
        )}
        <span className="text-2xl">{birthday.celebrated ? '✅' : '🎉'}</span>
      </div>
    </div>
  );
};
