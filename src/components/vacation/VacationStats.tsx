
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';

export const VacationStats: React.FC = () => {
  const { 
    vacationRequests, 
    getActiveVacations, 
    getPendingRequests, 
    vacationAlerts 
  } = useVacation();

  const activeVacations = getActiveVacations();
  const pendingRequests = getPendingRequests();
  const totalRequests = vacationRequests.length;

  const stats = [
    {
      title: 'Total de Solicitações',
      value: totalRequests,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Em Férias Agora',
      value: activeVacations.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pendentes',
      value: pendingRequests.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Alertas',
      value: vacationAlerts.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
