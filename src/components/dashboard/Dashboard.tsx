
import React from 'react';
import { Users, TrendingUp, Calendar, AlertTriangle, Award, Clock } from 'lucide-react';
import { StatCard } from './StatCard';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral da gestão de pessoas - LA Music</p>
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
        />
        
        <StatCard
          title="Turnover Mensal"
          value="3.2%"
          subtitle="Meta: < 5%"
          icon={TrendingUp}
          trend={{ value: -1.2, isPositive: true }}
          color="green"
        />
        
        <StatCard
          title="NPS Interno"
          value="8.4"
          subtitle="Clima organizacional"
          icon={Award}
          trend={{ value: 0.8, isPositive: true }}
          color="purple"
        />
        
        <StatCard
          title="Alertas Pendentes"
          value="12"
          subtitle="Docs vencidos: 7 | Avaliações: 5"
          icon={AlertTriangle}
          color="orange"
        />
        
        <StatCard
          title="Admissões (30 dias)"
          value="8"
          subtitle="Novas contratações"
          icon={Users}
          color="green"
        />
        
        <StatCard
          title="Avaliações Pendentes"
          value="15"
          subtitle="Vencimento próximo"
          icon={Calendar}
          color="orange"
        />
        
        <StatCard
          title="Horas Trabalhadas"
          value="2.847h"
          subtitle="Esta semana"
          icon={Clock}
          color="blue"
        />
        
        <StatCard
          title="Ocorrências"
          value="3"
          subtitle="Este mês"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aniversários Hoje</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                JL
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">João Lima</p>
                <p className="text-sm text-gray-600">Professor • Campo Grande</p>
              </div>
              <span className="text-2xl">🎉</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                AS
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Ana Silva</p>
                <p className="text-sm text-gray-600">Coordenação • Recreio</p>
              </div>
              <span className="text-2xl">🎂</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Importantes</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Documentos Vencidos</p>
                <p className="text-sm text-red-700">7 colaboradores com docs em atraso</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Avaliações Próximas</p>
                <p className="text-sm text-orange-700">15 avaliações vencem em 7 dias</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <Award className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Reconhecimentos</p>
                <p className="text-sm text-blue-700">3 colaboradores se destacaram</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
