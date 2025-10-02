import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Identifica tipos específicos de erro
    const errorType = this.identifyErrorType(error);
    console.log('Tipo de erro identificado:', errorType);
    
    // Tratamento específico para erros de WebSocket/Realtime
    if (errorType === 'websocket' || errorType === 'realtime') {
      console.log('Erro de conexão detectado, tentando recuperação automática...');
      // Força limpeza de conexões
      this.handleConnectionError();
    }
    
    // Chama callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  identifyErrorType = (error: Error): string => {
    const message = (error?.message || '').toLowerCase();
    const stack = (error?.stack || '').toLowerCase();
    
    if (message.includes('websocket') || message.includes('connection') || 
        message.includes('subscribe') || message.includes('channel') ||
        stack.includes('supabase') || stack.includes('realtime')) {
      return 'websocket';
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'permission';
    }
    
    return 'unknown';
  };

  handleConnectionError = () => {
    try {
      // Tenta acessar o incidentService globalmente para forçar cleanup
      if (window && (window as any).incidentService) {
        (window as any).incidentService.forceCleanup();
      }
      
      // Agenda uma tentativa de reconexão
      setTimeout(() => {
        if (!this.state.hasError) {
          console.log('ErrorBoundary: Tentando reconexão automática...');
          window.location.reload();
        }
      }, 5000);
    } catch (cleanupError) {
      console.error('Erro durante cleanup automático:', cleanupError);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Renderiza fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderiza UI de erro padrão
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Algo deu errado
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-xs font-mono text-red-800">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Recarregar Página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;