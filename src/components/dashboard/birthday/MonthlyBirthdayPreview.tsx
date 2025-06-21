
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { MonthlyBirthday } from './types';

interface MonthlyBirthdayPreviewProps {
  upcomingBirthdays: MonthlyBirthday[];
  totalMonthlyBirthdays: number;
}

export const MonthlyBirthdayPreview: React.FC<MonthlyBirthdayPreviewProps> = ({
  upcomingBirthdays,
  totalMonthlyBirthdays
}) => {
  if (upcomingBirthdays.length === 0) return null;

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">Este mês</span>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {totalMonthlyBirthdays} total
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1">
        {upcomingBirthdays.map((birthday) => (
          <div key={birthday.id} className="flex-shrink-0 min-w-[120px] p-2 bg-blue-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 bg-gradient-to-r ${birthday.gradient} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                {birthday.initials}
              </div>
              <span className="text-xs font-medium text-gray-900 truncate">
                {birthday.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate">{birthday.position}</p>
            <p className="text-xs text-blue-600 font-medium">
              {birthday.date.getDate()}/{birthday.date.getMonth() + 1}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
