
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Gift, Calendar, Users } from 'lucide-react';

interface Birthday {
  id: string;
  name: string;
  position: string;
  unit: string;
  date: string;
  initials: string;
  gradient: string;
  celebrated: boolean;
}

export const BirthdayCard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [birthdays, setBirthdays] = useState<Birthday[]>([
    {
      id: '1',
      name: 'João Lima',
      position: 'Professor',
      unit: 'Campo Grande',
      date: 'Hoje',
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
      initials: 'AS',
      gradient: 'from-blue-500 to-cyan-500',
      celebrated: true
    }
  ]);

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

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowModal(true)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Aniversários Hoje
            <Badge variant="secondary">{birthdays.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Gestão de Aniversários
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
