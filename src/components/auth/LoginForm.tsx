
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationHelp, setShowConfirmationHelp] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const { signIn, signInWithGoogle, resendConfirmation } = useAuth();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowConfirmationHelp(false);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        let errorTitle = 'Erro no Login';
        let errorMessage = 'Erro ao fazer login. Tente novamente.';
        let showHelp = false;
        
        if (error.message.includes('Invalid login credentials')) {
          errorTitle = 'Credenciais inválidas';
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          errorTitle = 'Email não confirmado';
          errorMessage = 'Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.';
          showHelp = true;
        } else if (error.message.includes('email_not_confirmed')) {
          errorTitle = 'Email não confirmado';
          errorMessage = 'Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.';
          showHelp = true;
        } else if (error.message.includes('Too many requests')) {
          errorTitle = 'Muitas tentativas';
          errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
        } else if (error.message.includes('User not found')) {
          errorTitle = 'Usuário não encontrado';
          errorMessage = 'Não existe uma conta com este email. Verifique o email digitado.';
        } else if (error.message.includes('Invalid email')) {
          errorTitle = 'Email inválido';
          errorMessage = 'O formato do email está incorreto. Digite um email válido.';
        }
        
        setShowConfirmationHelp(showHelp);
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao LA Music RH.',
      });
    } catch (error) {
      toast({
        title: 'Erro no Login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: 'Email necessário',
        description: 'Digite seu email para reenviar a confirmação.',
        variant: 'destructive'
      });
      return;
    }
    
    setResendingConfirmation(true);
    
    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        toast({
          title: 'Erro ao reenviar confirmação',
          description: 'Não foi possível reenviar o email. Tente novamente.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Email reenviado!',
          description: 'Verifique sua caixa de entrada.',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive'
      });
    } finally {
      setResendingConfirmation(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: 'Erro no Login com Google',
          description: 'Não foi possível fazer login com Google. Tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro no Login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {showConfirmationHelp && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Parece que você ainda não confirmou seu email.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendConfirmation}
                disabled={resendingConfirmation}
                className="w-full"
              >
                {resendingConfirmation ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar Email de Confirmação
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="login-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full"
        disabled={loading}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuar com Google
      </Button>

      <div className="text-center text-sm text-gray-600">
        <p>Precisa de acesso? Entre em contato com o administrador do sistema.</p>
      </div>
    </div>
  );
};
