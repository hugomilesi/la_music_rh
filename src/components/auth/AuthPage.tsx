
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hr-primary">
        <div className="text-center glass-subtle p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white/80">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hr-primary p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 glass-subtle rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 glass-subtle rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 glass-subtle rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 glass-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 hover-glow transition-all duration-300">
            <span className="text-white font-bold text-2xl">LA</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">LA Music RH</h1>
          <p className="text-white/80 text-lg">Sistema de Gestão de Pessoas</p>
        </div>

        <Card className="w-full glass-strong border-white/20 shadow-hr-strong hover-lift">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-800">Bem-vindo</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-white/70">
          <p>© 2024 LA Music RH. Todos os direitos reservados.</p>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};
