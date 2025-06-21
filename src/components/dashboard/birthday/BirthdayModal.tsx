
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Birthday, MonthlyBirthday } from './types';
import { BirthdayItem } from './BirthdayItem';
import { MonthlyBirthdayGrid } from './MonthlyBirthdayGrid';
import { formatMonthYear, organizeByWeeks, getFilteredMonthlyBirthdays } from './birthdayUtils';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthdays: Birthday[];
  monthlyBirthdays: MonthlyBirthday[];
  currentMonth: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onMarkAsCelebrated: (id: string) => void;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({
  isOpen,
  onClose,
  birthdays,
  monthlyBirthdays,
  currentMonth,
  onNavigateMonth,
  onMarkAsCelebrated
}) => {
  const upcomingBirthdays = [
    { name: 'Carlos Oliveira', position: 'Bartender', unit: 'Barra', date: 'Amanhã', initials: 'CO' },
    { name: 'Fernanda Costa', position: 'Segurança', unit: 'Campo Grande', date: '2 dias', initials: 'FC' },
    { name: 'Roberto Santos', position: 'DJ', unit: 'Recreio', date: '3 dias', initials: 'RS' },
  ];

  const filteredMonthlyBirthdays = getFilteredMonthlyBirthdays(monthlyBirthdays, currentMonth);
  const weeklyBirthdays = organizeByWeeks(filteredMonthlyBirthdays, currentMonth);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gestão de Aniversários
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Aniversários de Hoje
              </h3>
              <div className="space-y-3">
                {birthdays.map((birthday) => (
                  <div key={birthday.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${birthday.gradient} rounded-full flex items-center justify-center text-white font-semibold`}>
                        {birthday.initials}
                      </div>
                      <div>
                        <p className="font-medium">{birthday.name}</p>
                        <p className="text-sm text-gray-600">{birthday.position} • {birthday.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {birthday.celebrated ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Parabenizado
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => onMarkAsCelebrated(birthday.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Marcar como Parabenizado
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Próximos Aniversários
              </h3>
              <div className="space-y-2">
                {upcomingBirthdays.map((birthday, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {birthday.initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{birthday.name}</p>
                      <p className="text-sm text-gray-600">{birthday.position} • {birthday.unit}</p>
                    </div>
                    <Badge variant="outline">{birthday.date}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Aniversários do Mês
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateMonth('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-lg capitalize min-w-[200px] text-center">
                  {formatMonthYear(currentMonth)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateMonth('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <MonthlyBirthdayGrid weeklyBirthdays={weeklyBirthdays} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
