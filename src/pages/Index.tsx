
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Calendar, 
  Shield, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, session } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if we have a valid authenticated user with session and haven't redirected yet
    if (user && session && !loading && !hasRedirected && window.location.pathname === '/') {
      console.log('Authenticated user with valid session detected, redirecting to dashboard');
      setHasRedirected(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, session, loading, navigate, hasRedirected]);

  const features = [
    {
      icon: Users,
      title: 'Gestão de Colaboradores',
      description: 'Cadastro completo, organização por unidades e acompanhamento da equipe.'
    },
    {
      icon: Calendar,
      title: 'Controle de Férias',
      description: 'Gestão inteligente de férias com alertas e aprovações automáticas.'
    },
    {
      icon: TrendingUp,
      title: 'Avaliações & NPS',
      description: 'Feedbacks contínuos e medição do clima organizacional.'
    },
    {
      icon: Award,
      title: 'Reconhecimento',
      description: 'Sistema de gamificação e incentivos para motivar a equipe.'
    },
    {
      icon: Shield,
      title: 'Ocorrências',
      description: 'Registro e acompanhamento de incidentes disciplinares.'
    },
    {
      icon: Heart,
      title: 'Benefícios',
      description: 'Gestão completa de planos de saúde e benefícios corporativos.'
    }
  ];

  const benefits = [
    'Interface intuitiva e moderna',
    'Relatórios e dashboards em tempo real',
    'Integração com WhatsApp',
    'Controle de acesso e permissões',
    'Backup automático na nuvem',
    'Suporte técnico especializado'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">LA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LA Music RH</h1>
                <p className="text-sm text-gray-600">Gestão de Pessoas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="hidden sm:inline-flex"
              >
                Entrar
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
            Gerencie sua equipe com
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> inteligência</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Sistema completo de gestão de pessoas para escolas de música. 
            Simplifique processos, aumente a produtividade e melhore o clima organizacional.
          </p>
          
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4"
            >
              Experimente Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para gerenciar sua equipe em um só lugar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Por que escolher o LA Music RH?
              </h2>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 transform rotate-3">
                <div className="bg-white rounded-xl p-6 transform -rotate-3 shadow-xl">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-32 bg-gradient-to-r from-purple-100 to-blue-100 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-purple-200 rounded flex-1"></div>
                      <div className="h-8 bg-blue-200 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Pronto para transformar a gestão da sua equipe?
          </h2>
          
          <p className="text-xl text-purple-100 mb-12">
            Junte-se a centenas de empresas que já otimizaram seus processos de RH
          </p>
          
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Criar Conta Gratuita
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LA</span>
              </div>
              <div>
                <h3 className="font-bold">LA Music RH</h3>
                <p className="text-sm text-gray-400">Gestão de Pessoas</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2024 LA Music RH. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
