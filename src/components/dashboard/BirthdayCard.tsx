
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Music, Cake, Star, Sparkles } from 'lucide-react';
import { Birthday, MonthlyBirthday } from './birthday/types';
import { BirthdayItem } from './birthday/BirthdayItem';
import { MonthlyBirthdayPreview } from './birthday/MonthlyBirthdayPreview';
import { BirthdayModal } from './birthday/BirthdayModal';
import { getCurrentMonthBirthdays, getUpcomingMonthlyBirthdays } from './birthday/birthdayUtils';
import { mockBirthdays, mockMonthlyBirthdays } from './birthday/mockData';

export const BirthdayCard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [birthdays, setBirthdays] = useState<Birthday[]>(mockBirthdays);
  const monthlyBirthdays: MonthlyBirthday[] = mockMonthlyBirthdays;

  const markAsCelebrated = (id: string) => {
    setBirthdays(prev => prev.map(birthday => 
      birthday.id === id ? { ...birthday, celebrated: true } : birthday
    ));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const currentMonthBirthdays = getCurrentMonthBirthdays(monthlyBirthdays);
  const upcomingMonthlyBirthdays = getUpcomingMonthlyBirthdays(monthlyBirthdays);
  const totalMonthlyBirthdays = currentMonthBirthdays.length;

  return (
    <>
      <Card className="hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden border-purple-200 bg-gradient-to-br from-white to-purple-50/30" onClick={() => setShowModal(true)}>
        {/* Musical background decoration */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
          <div className="absolute top-4 right-4 text-3xl animate-pulse">🎂</div>
          <div className="absolute bottom-4 left-4 text-2xl animate-bounce delay-300">♪</div>
          <div className="absolute top-1/2 right-8 text-xl animate-pulse delay-500">♫</div>
        </div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Cake className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Aniversariantes Musicais
            </span>
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 group-hover:scale-105 transition-transform duration-300"
            >
              <Music className="w-3 h-3 mr-1" />
              {birthdays.length} hoje
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
          <div className="space-y-3">
            {birthdays.length > 0 ? (
              birthdays.map((birthday) => (
                <div key={birthday.id} className="group/item hover:bg-purple-50/50 rounded-lg p-2 transition-colors duration-200">
                  <BirthdayItem birthday={birthday} />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum aniversário hoje</p>
                <p className="text-xs">Mas sempre há música para celebrar! 🎵</p>
              </div>
            )}
          </div>

          <div className="border-t border-purple-100 pt-4">
            <MonthlyBirthdayPreview
              upcomingBirthdays={upcomingMonthlyBirthdays}
              totalMonthlyBirthdays={totalMonthlyBirthdays}
            />
          </div>
          
          {/* Musical note trail */}
          <div className="absolute bottom-2 right-2 flex space-x-1 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <span className="text-xs animate-bounce">♪</span>
            <span className="text-xs animate-bounce delay-100">♫</span>
            <span className="text-xs animate-bounce delay-200">♪</span>
          </div>
        </CardContent>
      </Card>

      <BirthdayModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        birthdays={birthdays}
        monthlyBirthdays={monthlyBirthdays}
        currentMonth={currentMonth}
        onNavigateMonth={navigateMonth}
        onMarkAsCelebrated={markAsCelebrated}
      />
    </>
  );
};
