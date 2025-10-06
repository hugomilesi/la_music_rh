/**
 * Sistema global de tratamento de erros
 * Captura erros não tratados e problemas de WebSocket/Realtime
 */

interface ErrorReport {
  type: 'websocket' | 'network' | 'javascript' | 'promise' | 'unknown';
  message: string;
  stack?: string;
  timestamp: Date;
  url?: string;
  userAgent?: string;
}

class GlobalErrorHandler {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;
  private isInitialized = false;

  init() {
    if (this.isInitialized) {
      return;
    }

    this.setupGlobalErrorHandlers();
    this.isInitialized = true;
  }

  private setupGlobalErrorHandlers() {
    // Captura erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.handleError({
        type: this.classifyError(event.error?.message || event.message),
        message: event.error?.message || event.message || 'Erro JavaScript desconhecido',
        stack: event.error?.stack,
        timestamp: new Date(),
        url: event.filename,
      });
    });

    // Captura promises rejeitadas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      this.handleError({
        type: this.classifyError(error?.message || String(error)),
        message: error?.message || String(error) || 'Promise rejeitada não tratada',
        stack: error?.stack,
        timestamp: new Date(),
      });
    });

    // Intercepta console.error para capturar erros do Supabase
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Verifica se é um erro relacionado ao Supabase/WebSocket
      if (this.isSupabaseError(message)) {
        this.handleError({
          type: 'websocket',
          message: message,
          timestamp: new Date(),
        });
      }
      
      // Chama o console.error original
      originalConsoleError.apply(console, args);
    };
  }

  private classifyError(message: string): ErrorReport['type'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('websocket') || 
        lowerMessage.includes('subscribe') || 
        lowerMessage.includes('channel') ||
        lowerMessage.includes('supabase') ||
        lowerMessage.includes('realtime')) {
      return 'websocket';
    }
    
    if (lowerMessage.includes('network') || 
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('connection')) {
      return 'network';
    }
    
    return 'javascript';
  }

  private isSupabaseError(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('supabase') ||
           lowerMessage.includes('subscribe multiple times') ||
           lowerMessage.includes('websocket') ||
           lowerMessage.includes('channel') ||
           lowerMessage.includes('realtime');
  }

  private handleError(errorReport: ErrorReport) {
    // Adiciona à fila de erros
    this.errorQueue.push(errorReport);
    
    // Mantém o tamanho da fila
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }


    // Tratamento específico para erros de WebSocket
    if (errorReport.type === 'websocket') {
      this.handleWebSocketError(errorReport);
    }
  }

  private handleWebSocketError(errorReport: ErrorReport) {
    
    // Verifica se é o erro específico de múltiplas subscrições
    if (errorReport.message.includes('subscribe multiple times')) {
      this.forceWebSocketCleanup();
    }
  }

  private forceWebSocketCleanup() {
    try {
      // Tenta acessar o incidentService para forçar cleanup
      if (typeof window !== 'undefined') {
        // Procura por instâncias do Supabase no window
        const supabaseInstances = Object.keys(window).filter(key => 
          key.includes('supabase') || key.includes('Supabase')
        );
        
        supabaseInstances.forEach(key => {
          const instance = (window as any)[key];
          if (instance && typeof instance.removeAllChannels === 'function') {
            instance.removeAllChannels();
          }
        });
      }
      
      // Agenda uma limpeza adicional
      setTimeout(() => {
        this.deepCleanWebSockets();
      }, 1000);
    } catch (error) {
    }
  }

  private deepCleanWebSockets() {
    try {
      // Remove event listeners relacionados ao WebSocket
      const events = ['beforeunload', 'unload', 'pagehide'];
      events.forEach(event => {
        window.removeEventListener(event, this.cleanupOnUnload);
        window.addEventListener(event, this.cleanupOnUnload);
      });
    } catch (error) {
    }
  }

  private cleanupOnUnload = () => {
    try {
      // Força cleanup de todas as conexões
      this.forceWebSocketCleanup();
    } catch (error) {
    }
  };

  // Métodos públicos para monitoramento
  getErrorQueue(): ErrorReport[] {
    return [...this.errorQueue];
  }

  getWebSocketErrors(): ErrorReport[] {
    return this.errorQueue.filter(error => error.type === 'websocket');
  }

  clearErrorQueue() {
    this.errorQueue = [];
  }

  // Método para reportar erros manualmente
  reportError(error: Error, type?: ErrorReport['type']) {
    this.handleError({
      type: type || this.classifyError(error.message),
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
    });
  }
}

// Instância singleton
export const globalErrorHandler = new GlobalErrorHandler();

// Função de inicialização para ser chamada no App.tsx
export const initializeErrorHandling = () => {
  globalErrorHandler.init();
};

// Função para reportar erros manualmente
export const reportError = (error: Error, type?: ErrorReport['type']) => {
  globalErrorHandler.reportError(error, type);
};

// Função para obter estatísticas de erros
export const getErrorStats = () => {
  const errors = globalErrorHandler.getErrorQueue();
  const webSocketErrors = globalErrorHandler.getWebSocketErrors();
  
  return {
    total: errors.length,
    webSocket: webSocketErrors.length,
    recent: errors.filter(e => 
      Date.now() - e.timestamp.getTime() < 5 * 60 * 1000 // últimos 5 minutos
    ).length,
  };
};