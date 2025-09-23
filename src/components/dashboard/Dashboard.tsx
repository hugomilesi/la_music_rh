import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Award, 
  Shield, 
  Heart, 
  Clock, 
  Star, 
  Sparkles, 
  Play,
  Building,
  Target,
  CheckCircle,
  Mail
} from 'lucide-react';
import { StatCard } from './StatCard';
import { StatCardSkeleton } from './StatCardSkeleton';
import { BirthdayCard } from './BirthdayCard';
import { AlertCard } from './AlertCard';
import { VacationAlerts } from '../vacation/VacationAlerts';
import { KPIModal } from './KPIModal';
import { EmailTestDialog } from '../email/EmailTestDialog';
import { useDashboardData, useDashboardAlerts, useUnitSummary } from '@/hooks/useDashboardData';

export const Dashboard: React.FC = () => {
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEmailTestOpen, setIsEmailTestOpen] = useState(false);
  
  // Hooks personalizados para dados do dashboard
  const metrics = useDashboardData();
  const alerts = useDashboardAlerts();
  const unitSummary = useUnitSummary(metrics.unitDistribution, metrics.isLoading);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStatCardClick = (type: string) => {
    setSelectedKPI(type);
  };

  const closeModal = () => {
    setSelectedKPI(null);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };



  return (
    <div className="space-y-8 relative">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/5 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-indigo-400/5 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-pink-400/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10">
        <div className="gradient-hr-primary glass-subtle rounded-2xl p-8 text-white relative overflow-hidden border border-white/20 shadow-hr-strong">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-8 w-6 h-6 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-4 left-1/3 w-10 h-10 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 glass-gradient rounded-xl flex items-center justify-center hover-glow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {getGreeting()}, Gestor! 👥
                </h1>
                <p className="text-white/90 text-lg">
                  Bem-vindo ao seu painel de RH - LA Music RH
                </p>
                <p className="text-white/80 text-sm mt-1">
                  {currentTime.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-6 md:mt-0">
              <div className="glass-subtle rounded-full px-4 py-2 border border-white/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse inline-block mr-2"></div>
                <span className="text-sm font-medium">Todas as unidades</span>
              </div>
              <div className="glass-subtle rounded-full px-4 py-2 border border-white/30">
                <Clock className="w-4 h-4 inline mr-2" />
                <span className="text-sm font-medium">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Musical Stats Grid */}
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-500" />
            Métricas de RH
          </h2>
          <p className="text-gray-600">Acompanhe o desempenho da gestão de pessoas em tempo real</p>
        </div>
        
        <div className="dashboard-stats-grid">
          {metrics.isLoading ? (
            <>
              <StatCardSkeleton className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200" />
              <StatCardSkeleton className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200" />
              <StatCardSkeleton className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200" />
              <StatCardSkeleton className="bg-gradient-to-br from-red-50 to-pink-100 border-red-200" />
              <StatCardSkeleton className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200" />
              <StatCardSkeleton className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200" />
              <StatCardSkeleton className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200" />
              <StatCardSkeleton className="bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200" />
            </>
          ) : (
            <>
              <StatCard
                title="Colaboradores Ativos"
                value={metrics.activeEmployees.toString()}
                subtitle={unitSummary}
                icon={Users}
                trend={{ value: 8, isPositive: true }}
                color="blue"
                onClick={() => handleStatCardClick('employees')}
              />
              
              <StatCard
                title="Turnover Mensal"
                value={`${metrics.turnoverRate}%`}
                subtitle="Meta: < 5%"
                icon={TrendingUp}
                trend={{ value: -0.8, isPositive: true }}
                color="green"
                onClick={() => handleStatCardClick('turnover')}
              />
              
              <StatCard
                title="NPS Interno"
                value={metrics.currentNPS.toString()}
                subtitle="Satisfação da equipe"
                icon={Star}
                trend={{ value: metrics.npsChange, 
                  isPositive: metrics.npsChange >= 0 }}
                color="yellow"
                onClick={() => handleStatCardClick('nps')}
              />
              
              <StatCard
                title="Alertas Pendentes"
                value={metrics.pendingIncidents.toString()}
                subtitle="Requerem atenção imediata"
                icon={AlertTriangle}
                color="red"
                onClick={() => handleStatCardClick('alerts')}
              />
              
              <StatCard
                title="Admissões (30 dias)"
                value={metrics.recentAdmissions.toString()}
                subtitle="Novos colaboradores"
                icon={CheckCircle}
                color="green"
                onClick={() => handleStatCardClick('admissions')}
              />
              
              <StatCard
                title="Avaliações em Andamento"
                value={metrics.ongoingEvaluations.toString()}
                subtitle="Em processo de avaliação"
                icon={Target}
                color="orange"
                onClick={() => handleStatCardClick('avaliacoes')}
              />
              
              <StatCard
                title="Gamificação"
                value={metrics.gamificationPoints.toString()}
                subtitle="Pontos distribuídos"
                icon={Award}
                color="purple"
                onClick={() => handleStatCardClick('gamification')}
              />
              
              <StatCard
                title="Ocorrências"
                value={metrics.totalIncidents.toString()}
                subtitle="Registradas este mês"
                icon={Shield}
                color="indigo"
                onClick={() => handleStatCardClick('incidents')}
              />
            </>
          )}
        </div>
      </div>

      {/* HR Interactive Cards */}
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Heart className="w-6 h-6 text-purple-500" />
            Atividades de RH
          </h2>
          <p className="text-gray-600">Informações importantes e eventos da equipe</p>
        </div>
        
        <div className="dashboard-cards-grid">
          {/* Aniversários */}
          <div className="gradient-hr-warm glass-subtle rounded-xl p-6 text-white relative overflow-hidden group hover-lift transition-all duration-300 border border-white/20 shadow-hr-soft">
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors"></div>
            <div className="absolute top-2 right-2 text-2xl opacity-20">🎂</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="glass-gradient rounded-lg p-2">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Aniversários</h3>
              </div>
              <p className="text-white/90 mb-4">Celebre com nossa equipe!</p>
              <div className="space-y-2">
                {alerts.birthdays.slice(0, 3).map((birthday, index) => (
                  <div key={birthday.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">{birthday.name} - {birthday.when}</span>
                  </div>
                ))}
                {alerts.birthdays.length === 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Nenhum aniversário próximo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Alertas Importantes */}
          <div className="gradient-hr-danger glass-subtle rounded-xl p-6 text-white relative overflow-hidden group hover-lift transition-all duration-300 border border-white/20 shadow-hr-soft">
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors"></div>
            <div className="absolute top-2 right-2 text-2xl opacity-20">⚠️</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="glass-gradient rounded-lg p-2">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Alertas Importantes</h3>
              </div>
              <p className="text-white/90 mb-4">Requer atenção imediata</p>
              <div className="space-y-2">
                {alerts.incidents.slice(0, 3).map((incident) => (
                  <div key={incident.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">{incident.description}</span>
                  </div>
                ))}
                {alerts.incidents.length === 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Nenhum alerta pendente</span>
                  </div>
                )}
                {alerts.incidents.length > 3 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">+{alerts.incidents.length - 3} outros alertas</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Alertas de Férias */}
          <div className="gradient-hr-cool glass-subtle rounded-xl p-6 text-white relative overflow-hidden group hover-lift transition-all duration-300 border border-white/20 shadow-hr-soft">
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors"></div>
            <div className="absolute top-2 right-2 text-2xl opacity-20">🏖️</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="glass-gradient rounded-lg p-2">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Alertas de Férias</h3>
              </div>
              <p className="text-white/90 mb-4">Programação de ausências</p>
              <div className="space-y-2">
                {alerts.vacations.slice(0, 3).map((vacation, index) => (
                  <div key={vacation.id || `vacation-${index}`} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">{vacation.description}</span>
                  </div>
                ))}
                {alerts.vacations.length === 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Nenhuma programação de férias</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Modal */}
      <KPIModal
        isOpen={!!selectedKPI}
        onClose={closeModal}
        type={selectedKPI as any}
      />

      {/* Email Test Dialog */}
      <EmailTestDialog
        isOpen={isEmailTestOpen}
        onClose={() => setIsEmailTestOpen(false)}
      />

      {/* Floating Email Test Button */}
      <button
        onClick={() => setIsEmailTestOpen(true)}
        className="fixed bottom-6 right-6 z-50 gradient-hr-primary glass-subtle rounded-full p-4 text-white shadow-hr-strong hover-lift transition-all duration-300 border border-white/20 group"
        title="Testar Envio de Email"
      >
        <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
      </button>
    </div>
  );
};
