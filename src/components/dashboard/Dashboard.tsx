import React, { useState } from 'react';
import { Users, TrendingUp, Calendar, AlertTriangle, Award, Clock } from 'lucide-react';
import { StatCard } from './StatCard';
import { BirthdayCard } from './BirthdayCard';
import { AlertCard } from './AlertCard';
import { KPIModal } from './KPIModal';

export const Dashboard: React.FC = () => {
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  const handleStatCardClick = (type: string) => {
    setSelectedKPI(type);
  };

  const closeModal = () => {
    setSelectedKPI(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral da gestão de pessoas - LA Music RH</p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Todas as unidades</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Colaboradores Ativos"
          value="127"
          subtitle="Campo Grande: 45 | Recreio: 42 | Barra: 40"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          color="blue"
          onClick={() => handleStatCardClick('employees')}
        />
        
        <StatCard
          title="Turnover Mensal"
          value="3.2%"
          subtitle="Meta: < 5%"
          icon={TrendingUp}
          trend={{ value: -1.2, isPositive: true }}
          color="green"
          onClick={() => handleStatCardClick('turnover')}
        />
        
        <StatCard
          title="NPS Interno"
          value="8.4"
          subtitle="Clima organizacional"
          icon={Award}
          trend={{ value: 0.8, isPositive: true }}
          color="purple"
          onClick={() => handleStatCardClick('nps')}
        />
        
        <StatCard
          title="Alertas Pendentes"
          value="12"
          subtitle="Docs vencidos: 7 | Avaliações: 5"
          icon={AlertTriangle}
          color="orange"
          onClick={() => handleStatCardClick('alerts')}
        />
        
        <StatCard
          title="Admissões (30 dias)"
          value="8"
          subtitle="Novas contratações"
          icon={Users}
          color="green"
          onClick={() => handleStatCardClick('admissions')}
        />
        
        <StatCard
          title="Avaliações Pendentes"
          value="15"
          subtitle="Vencimento próximo"
          icon={Calendar}
          color="orange"
          onClick={() => handleStatCardClick('evaluations')}
        />
        
        <StatCard
          title="Horas Trabalhadas"
          value="2.847h"
          subtitle="Esta semana"
          icon={Clock}
          color="blue"
          onClick={() => handleStatCardClick('hours')}
        />
        
        <StatCard
          title="Ocorrências"
          value="3"
          subtitle="Este mês"
          icon={AlertTriangle}
          color="red"
          onClick={() => handleStatCardClick('incidents')}
        />
      </div>

      {/* Interactive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BirthdayCard />
        <AlertCard />
      </div>

      {/* KPI Modal */}
      <KPIModal
        isOpen={!!selectedKPI}
        onClose={closeModal}
        type={selectedKPI as any}
      />
    </div>
  );
};
