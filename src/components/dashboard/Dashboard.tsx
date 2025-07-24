import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Award, 
  Music, 
  Piano, 
  Mic, 
  Volume2, 
  Star, 
  Sparkles, 
  Play,
  Headphones,
  Radio,
  Disc
} from 'lucide-react';
import { StatCard } from './StatCard';
import { BirthdayCard } from './BirthdayCard';
import { AlertCard } from './AlertCard';
import { VacationAlerts } from '../vacation/VacationAlerts';
import { KPIModal } from './KPIModal';

export const Dashboard: React.FC = () => {
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

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
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 text-6xl text-yellow-400/5 animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}>♪</div>
        <div className="absolute top-40 right-20 text-4xl text-orange-400/5 animate-bounce" style={{animationDelay: '1s', animationDuration: '5s'}}>♫</div>
        <div className="absolute bottom-40 left-1/4 text-5xl text-purple-400/5 animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}>♬</div>
        <div className="absolute bottom-20 right-1/3 text-7xl text-pink-400/5 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}>♩</div>
      </div>

      {/* Header Section */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-4xl animate-pulse">♪</div>
            <div className="absolute top-8 right-8 text-3xl animate-pulse" style={{animationDelay: '1s'}}>♫</div>
            <div className="absolute bottom-4 left-1/3 text-5xl animate-pulse" style={{animationDelay: '2s'}}>♬</div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                <Music className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {getGreeting()}, Maestro! 🎵
                </h1>
                <p className="text-purple-100 text-lg">
                  Bem-vindo ao seu painel musical - LA Music RH
                </p>
                <p className="text-purple-200 text-sm mt-1">
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
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Todas as unidades musicais</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Play className="w-4 h-4" />
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
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Métricas Musicais
          </h2>
          <p className="text-gray-600">Acompanhe o desempenho da sua escola de música em tempo real</p>
        </div>
        
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
            trend={{ value: -0.8, isPositive: true }}
            color="green"
            onClick={() => handleStatCardClick('turnover')}
          />
          
          <StatCard
            title="NPS Interno"
            value="85"
            subtitle="Satisfação da equipe"
            icon={Star}
            trend={{ value: 5, isPositive: true }}
            color="yellow"
            onClick={() => handleStatCardClick('nps')}
          />
          
          <StatCard
            title="Alertas Pendentes"
            value="8"
            subtitle="Requerem atenção imediata"
            icon={AlertTriangle}
            color="red"
            onClick={() => handleStatCardClick('alerts')}
          />
          
          <StatCard
            title="Admissões (30 dias)"
            value="12"
            subtitle="Novos colaboradores"
            icon={Music}
            color="green"
            onClick={() => handleStatCardClick('admissions')}
          />
          
          <StatCard
            title="Avaliações Pendentes"
            value="15"
            subtitle="Aguardando revisão"
            icon={Mic}
            color="orange"
            onClick={() => handleStatCardClick('evaluations')}
          />
          
          <StatCard
            title="Gamificação"
            value="89"
            subtitle="Pontos distribuídos"
            icon={Award}
            color="purple"
            onClick={() => handleStatCardClick('gamification')}
          />
          
          <StatCard
            title="Ocorrências"
            value="3"
            subtitle="Registradas este mês"
            icon={Piano}
            color="indigo"
            onClick={() => handleStatCardClick('incidents')}
          />
        </div>
      </div>

      {/* Musical Interactive Cards */}
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-purple-500" />
            Atividades Musicais
          </h2>
          <p className="text-gray-600">Informações importantes e eventos da escola</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Aniversários */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
            <div className="absolute top-2 right-2 text-2xl opacity-20">🎂</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Aniversários</h3>
              </div>
              <p className="text-pink-100 mb-4">Celebre com nossa equipe!</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Maria Silva - Hoje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">João Santos - Amanhã</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Ana Costa - 25/01</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Alertas Importantes */}
          <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
            <div className="absolute top-2 right-2 text-2xl opacity-20">⚠️</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Alertas Importantes</h3>
              </div>
              <p className="text-red-100 mb-4">Requer atenção imediata</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">3 documentos vencidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">2 avaliações em atraso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">1 incidente pendente</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Alertas de Férias */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
            <div className="absolute top-2 right-2 text-2xl opacity-20">🏖️</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Alertas de Férias</h3>
              </div>
              <p className="text-blue-100 mb-4">Programação de ausências</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">5 solicitações pendentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Carlos sai em 3 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Luana retorna segunda</span>
                </div>
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
    </div>
  );
};
