
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';
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
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowModal(true)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Aniversários
            <Badge variant="secondary">{birthdays.length} hoje</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {birthdays.map((birthday) => (
              <BirthdayItem key={birthday.id} birthday={birthday} />
            ))}
          </div>

          <MonthlyBirthdayPreview
            upcomingBirthdays={upcomingMonthlyBirthdays}
            totalMonthlyBirthdays={totalMonthlyBirthdays}
          />
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
