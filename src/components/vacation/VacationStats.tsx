
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';

interface VacationStatsProps {
  onStatClick?: (type: 'total' | 'active' | 'pending' | 'approved' | 'alerts') => void;
}

export const VacationStats: React.FC<VacationStatsProps> = ({ onStatClick }) => {
  const { 
    vacationRequests, 
    getActiveVacations, 
    getPendingRequests, 
    getVacationAlerts 
  } = useVacation();

  const activeVacations = getActiveVacations();
  const pendingRequests = getPendingRequests();
  const vacationAlerts = getVacationAlerts();
  const totalRequests = vacationRequests.length;
  const approvedRequests = vacationRequests.filter(request => request.status === 'approved').length;

  const stats = [
    {
      title: 'Total de Solicitações',
      value: totalRequests,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      type: 'total' as const
    },
    {
      title: 'Em Férias Agora',
      value: activeVacations.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      type: 'active' as const
    },
    {
      title: 'Pendentes',
      value: pendingRequests.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      type: 'pending' as const
    },
    {
      title: 'Aprovadas',
      value: approvedRequests,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      type: 'approved' as const
    },
    {
      title: 'Alertas',
      value: vacationAlerts.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      type: 'alerts' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              onStatClick ? 'hover:bg-gray-50' : ''
            }`}
            onClick={() => onStatClick && onStatClick(stat.type)}
          >
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
