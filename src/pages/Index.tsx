
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
  CheckCircle,
  Music,
  Piano,
  Mic,
  Volume2,
  Play,
  Star,
  Sparkles
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
      description: 'Cadastro completo com perfis, informações de contato e histórico profissional.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Calendar,
      title: 'Gestão de Escalas',
      description: 'Controle de férias, folgas e horários de trabalho com calendário inteligente.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Avaliação de Desempenho',
      description: 'Ferramentas para avaliações de performance e NPS com relatórios visuais.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Award,
      title: 'Reconhecimento & Gamificação',
      description: 'Sistema de conquistas e programas de reconhecimento para motivar a equipe.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Canal de Incidentes',
      description: 'Gestão de ocorrências e registros disciplinares de forma organizada.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Heart,
      title: 'Administração de Benefícios',
      description: 'Gerenciamento completo de planos de saúde, vales e benefícios corporativos.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const benefits = [
    'Interface intuitiva e moderna para RH',
    'Dashboards com métricas de pessoas em tempo real',
    'Integração com WhatsApp para comunicação corporativa',
    'Controle de acesso por níveis hierárquicos',
    'Backup automático de dados na nuvem',
    'Suporte especializado para gestão de pessoas'
  ];

  // Removido testimonials para uso interno

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Musical Notes Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl text-white/10 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>♪</div>
        <div className="absolute top-40 right-20 text-4xl text-white/10 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>♫</div>
        <div className="absolute top-60 left-1/4 text-5xl text-white/10 animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}>♬</div>
        <div className="absolute bottom-40 right-1/3 text-7xl text-white/10 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}>♩</div>
        <div className="absolute bottom-60 left-1/2 text-4xl text-white/10 animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3s'}}>♪</div>
        <div className="absolute top-1/3 right-10 text-6xl text-white/10 animate-bounce" style={{animationDelay: '2.5s', animationDuration: '4s'}}>♫</div>
      </div>
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 glass-gradient rounded-xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover-glow">
                <Users className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LA Music RH</h1>
                <p className="text-sm text-white/80">Gestão de Pessoas Inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="hidden sm:inline-flex transform transition-all duration-300 hover:scale-105 hover:shadow-md bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                Entrar
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="glass-subtle border border-white/30 rounded-full px-6 py-2">
              <Sparkles className="w-4 h-4 text-white inline mr-2" />
              <span className="text-white/90 text-sm font-medium">Sistema de Gestão de RH Revolucionário</span>
              <Sparkles className="w-4 h-4 text-white inline ml-2" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Transforme sua
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> gestão de pessoas</span>
            <br />com tecnologia
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Sistema completo de gestão de recursos humanos que simplifica processos, 
            acompanha o desempenho dos colaboradores e melhora o clima organizacional com uma interface visual moderna.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-12 py-6 rounded-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/25 active:scale-95 group"
            >
              <Play className="mr-2 w-6 h-6 group-hover:scale-110 transition-transform" />
              Começar Agora
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="bg-transparent border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl transform transition-all duration-300 hover:scale-105"
            >
              <Volume2 className="mr-2 w-5 h-5" />
              Ver Demonstração
            </Button>
          </div>
          
          {/* Floating Musical Elements */}
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <Piano className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-10 -right-16 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse" style={{animationDelay: '1s'}}>
              <Mic className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Funcionalidades
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Musicais</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tudo que sua escola de música precisa para gerenciar alunos, professores e atividades musicais em um só lugar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all duration-500 border-0 bg-white/10 backdrop-blur-md transform hover:scale-105 hover:-translate-y-4 cursor-pointer group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <CardHeader className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-yellow-300 transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-gray-300 text-base group-hover:text-gray-200 transition-colors duration-300">
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
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Por que escolher o
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> LA Music RH?</span>
              </h2>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 group transform transition-all duration-300 hover:translate-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-gray-300 group-hover:text-white transition-colors duration-300">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-subtle rounded-2xl p-8 transform rotate-3 transition-all duration-500 hover:rotate-1 hover:scale-105 border border-white/20">
                <div className="glass-dark rounded-xl p-6 transform -rotate-3 shadow-hr-strong transition-all duration-500 hover:shadow-blue-500/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-blue-400" />
                      <span className="text-white font-semibold">Dashboard RH</span>
                    </div>
                    <div className="h-4 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded w-3/4 animate-pulse"></div>
                    <div className="h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-white/10 flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-white/50" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded flex-1 flex items-center justify-center">
                        <span className="text-xs text-white/70">Colaboradores</span>
                      </div>
                      <div className="h-8 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded flex-1 flex items-center justify-center">
                        <span className="text-xs text-white/70">Avaliações</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      


      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-400 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 text-6xl text-black/10 animate-bounce" style={{animationDelay: '0s'}}>♪</div>
          <div className="absolute bottom-10 right-10 text-8xl text-black/10 animate-bounce" style={{animationDelay: '1s'}}>♫</div>
          <div className="absolute top-1/2 left-1/4 text-4xl text-black/10 animate-bounce" style={{animationDelay: '2s'}}>♬</div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-8">
            Pronto para revolucionar sua
            <span className="text-white"> gestão de pessoas?</span>
          </h2>
          
          <p className="text-xl text-black/80 mb-12 max-w-2xl mx-auto">
            Simplifique seus processos de RH e melhore a experiência dos seus colaboradores
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-black text-white hover:bg-gray-800 text-lg px-10 py-6 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 font-bold"
            >
              <Play className="mr-2 w-5 h-5" />
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="bg-transparent border-black/30 text-black hover:bg-black/10 text-lg px-8 py-6 transform transition-all duration-300 hover:scale-105"
            >
              <Volume2 className="mr-2 w-5 h-5" />
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-gray-800"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 glass-gradient rounded-xl flex items-center justify-center">
                  <Users className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">LA Music RH</h3>
                  <p className="text-gray-400">Gestão de Pessoas Inteligente</p>
                </div>
              </div>
              <p className="text-gray-300 max-w-md">
                Transformando a gestão de recursos humanos com tecnologia inovadora e design intuitivo.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-blue-400">Funcionalidades</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Gestão de Colaboradores</li>
                <li>Controle de Escalas</li>
                <li>Avaliações de Desempenho</li>
                <li>Administração de Benefícios</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-blue-400">Suporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Contato</li>
                <li>Treinamentos</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2024 LA Music RH. Todos os direitos reservados.
            </p>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Feito com</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-gray-400 text-sm">para gestão de pessoas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
