
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Calendar, Users, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Birthday {
  id: string;
  name: string;
  position: string;
  unit: string;
  date: string;
  fullDate: Date;
  initials: string;
  gradient: string;
  celebrated: boolean;
}

interface MonthlyBirthday {
  id: string;
  name: string;
  position: string;
  unit: string;
  date: Date;
  initials: string;
  gradient: string;
}

export const BirthdayCard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [birthdays, setBirthdays] = useState<Birthday[]>([
    {
      id: '1',
      name: 'João Lima',
      position: 'Professor',
      unit: 'Campo Grande',
      date: 'Hoje',
      fullDate: new Date(),
      initials: 'JL',
      gradient: 'from-purple-500 to-pink-500',
      celebrated: false
    },
    {
      id: '2',
      name: 'Ana Silva',
      position: 'Coordenação',
      unit: 'Recreio',
      date: 'Hoje',
      fullDate: new Date(),
      initials: 'AS',
      gradient: 'from-blue-500 to-cyan-500',
      celebrated: true
    }
  ]);

  // Mock monthly birthdays data
  const monthlyBirthdays: MonthlyBirthday[] = [
    {
      id: '1',
      name: 'João Lima',
      position: 'Professor',
      unit: 'Campo Grande',
      date: new Date(),
      initials: 'JL',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: '2',
      name: 'Ana Silva',
      position: 'Coordenação',
      unit: 'Recreio',
      date: new Date(),
      initials: 'AS',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      position: 'Bartender',
      unit: 'Barra',
      date: new Date(2024, new Date().getMonth(), 5),
      initials: 'CO',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'Fernanda Costa',
      position: 'Segurança',
      unit: 'Campo Grande',
      date: new Date(2024, new Date().getMonth(), 12),
      initials: 'FC',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      name: 'Roberto Santos',
      position: 'DJ',
      unit: 'Recreio',
      date: new Date(2024, new Date().getMonth(), 18),
      initials: 'RS',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: '6',
      name: 'Maria Fernandes',
      position: 'Recepção',
      unit: 'Barra',
      date: new Date(2024, new Date().getMonth(), 25),
      initials: 'MF',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  const upcomingBirthdays = [
    { name: 'Carlos Oliveira', position: 'Bartender', unit: 'Barra', date: 'Amanhã', initials: 'CO' },
    { name: 'Fernanda Costa', position: 'Segurança', unit: 'Campo Grande', date: '2 dias', initials: 'FC' },
    { name: 'Roberto Santos', position: 'DJ', unit: 'Recreio', date: '3 dias', initials: 'RS' },
  ];

  const markAsCelebrated = (id: string) => {
    setBirthdays(prev => prev.map(birthday => 
      birthday.id === id ? { ...birthday, celebrated: true } : birthday
    ));
  };

  const getCurrentMonthBirthdays = () => {
    const today = new Date();
    return monthlyBirthdays.filter(birthday => 
      birthday.date.getMonth() === today.getMonth() &&
      birthday.date.getFullYear() === today.getFullYear()
    );
  };

  const getUpcomingMonthlyBirthdays = () => {
    const today = new Date();
    const currentMonthBirthdays = getCurrentMonthBirthdays();
    
    // Filter out today's birthdays and get upcoming ones
    const upcoming = currentMonthBirthdays
      .filter(birthday => birthday.date.getDate() > today.getDate())
      .sort((a, b) => a.date.getDate() - b.date.getDate())
      .slice(0, 4); // Show only next 4 birthdays
    
    return upcoming;
  };

  const getFilteredMonthlyBirthdays = () => {
    return monthlyBirthdays.filter(birthday => 
      birthday.date.getMonth() === currentMonth.getMonth() &&
      birthday.date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const organizeByWeeks = (birthdays: MonthlyBirthday[]) => {
    const weeks: MonthlyBirthday[][] = [[], [], [], [], [], []];
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startOfWeek = new Date(firstDay);
    startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());

    birthdays.forEach(birthday => {
      const daysDiff = Math.floor((birthday.date.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(daysDiff / 7);
      if (weekIndex >= 0 && weekIndex < 6) {
        weeks[weekIndex].push(birthday);
      }
    });

    return weeks.filter(week => week.length > 0);
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

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getBirthdayStatus = (date: Date) => {
    const today = new Date();
    const birthdayThisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
    
    if (birthdayThisYear.toDateString() === today.toDateString()) {
      return 'today';
    } else if (birthdayThisYear < today) {
      return 'past';
    } else {
      return 'future';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'today':
        return 'bg-green-100 border-green-300';
      case 'past':
        return 'bg-gray-100 border-gray-300';
      case 'future':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredMonthlyBirthdays = getFilteredMonthlyBirthdays();
  const weeklyBirthdays = organizeByWeeks(filteredMonthlyBirthdays);
  const currentMonthBirthdays = getCurrentMonthBirthdays();
  const upcomingMonthlyBirthdays = getUpcomingMonthlyBirthdays();
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
          {/* Today's Birthdays */}
          <div className="space-y-3">
            {birthdays.map((birthday) => (
              <div key={birthday.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
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
                  <span className="text-2xl">{birthday.celebrated ? '✅' : '🎉'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Birthdays Preview */}
          {upcomingMonthlyBirthdays.length > 0 && (
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
                {upcomingMonthlyBirthdays.map((birthday) => (
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
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
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
                            onClick={() => markAsCelebrated(birthday.id)}
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
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-lg capitalize min-w-[200px] text-center">
                    {formatMonthYear(currentMonth)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {weeklyBirthdays.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum aniversário encontrado para este mês</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
