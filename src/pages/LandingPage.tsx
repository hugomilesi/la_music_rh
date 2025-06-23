
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, BarChart3, Calendar, Award, Shield, TrendingUp } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Gestão de Colaboradores',
      description: 'Controle completo de funcionários, cargos e departamentos'
    },
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description: 'Métricas e indicadores em tempo real'
    },
    {
      icon: Calendar,
      title: 'Agenda e Escalas',
      description: 'Organização de plantões e horários'
    },
    {
      icon: Award,
      title: 'Reconhecimento',
      description: 'Sistema de gamificação e incentivos'
    },
    {
      icon: Shield,
      title: 'Controle de Ocorrências',
      description: 'Gestão disciplinar e registros'
    },
    {
      icon: TrendingUp,
      title: 'NPS Interno',
      description: 'Acompanhamento do clima organizacional'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LA Music RH</h1>
                <p className="text-sm text-gray-600">Gestão de Pessoas</p>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Acessar Sistema
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Sistema de Gestão de
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Recursos Humanos</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para gerenciar colaboradores, avaliações, benefícios, 
            escalas e muito mais. Transforme a gestão de pessoas da sua empresa.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"
            >
              Começar Agora
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h3>
            <p className="text-lg text-gray-600">
              Tudo que você precisa para uma gestão eficiente de recursos humanos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para Revolucionar sua Gestão de RH?
          </h3>
          <p className="text-xl text-purple-100 mb-8">
            Junte-se às empresas que já transformaram seus processos de recursos humanos.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="bg-white text-purple-600 hover:bg-gray-50 text-lg px-8 py-3"
          >
            Acessar Sistema
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LA</span>
            </div>
            <span className="text-xl font-bold">LA Music RH</span>
          </div>
          <p className="text-gray-400">
            © 2024 LA Music RH. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
