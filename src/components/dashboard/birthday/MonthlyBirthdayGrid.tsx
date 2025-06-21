
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { MonthlyBirthday } from './types';
import { getBirthdayStatus, getStatusColor } from './birthdayUtils';

interface MonthlyBirthdayGridProps {
  weeklyBirthdays: MonthlyBirthday[][];
}

export const MonthlyBirthdayGrid: React.FC<MonthlyBirthdayGridProps> = ({ weeklyBirthdays }) => {
  if (weeklyBirthdays.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhum aniversário encontrado para este mês</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weeklyBirthdays.map((week, weekIndex) => (
        <div key={weekIndex} className="space-y-3">
          <h4 className="font-medium text-gray-700">
            Semana {weekIndex + 1}
          </h4>
          <div className="grid gap-3">
            {week.map((birthday) => {
              const status = getBirthdayStatus(birthday.date);
              return (
                <div 
                  key={birthday.id} 
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 ${getStatusColor(status)}`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${birthday.gradient} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {birthday.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{birthday.name}</p>
                    <p className="text-sm text-gray-600">{birthday.position} • {birthday.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {birthday.date.getDate()} de {birthday.date.toLocaleDateString('pt-BR', { month: 'long' })}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={
                        status === 'today' 
                          ? 'text-green-700 border-green-700' 
                          : status === 'past'
                          ? 'text-gray-500 border-gray-500'
                          : 'text-blue-700 border-blue-700'
                      }
                    >
                      {status === 'today' ? 'Hoje' : status === 'past' ? 'Passou' : 'Próximo'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
