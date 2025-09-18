import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Share, Plus, Chrome, Globe, Wifi, WifiOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWA, useInstallPWA, canShowInstallPrompt } from '@/hooks/usePWA';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  const pwaInfo = usePWA();
  const { installPWA, canInstall } = useInstallPWA();
  
  const {
    isInstalled,
    platform,
    browser,
    isOnline,
    installPromptEvent
  } = pwaInfo;
  
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  const browserType = browser as 'chrome' | 'safari' | 'other';

  useEffect(() => {
    // Não mostrar se já instalado
    if (isInstalled) return;
    
    // Verificar se pode mostrar prompt
    const canShow = canShowInstallPrompt(platform, browser);
    if (!canShow) return;
    
    // Verificar se foi dispensado recentemente
    if (localStorage.getItem('pwa-install-dismissed')) return;

    // Mostrar prompt após delay baseado na plataforma
    const delay = isIOS ? 4000 : isAndroid && browserType === 'chrome' ? 2000 : 6000;
    
    const timer = setTimeout(() => {
      if (!isInstalled && (canInstall || isIOS)) {
        setShowPrompt(true);
        setTimeout(() => setIsVisible(true), 100);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isInstalled, platform, browser, canInstall, isIOS, isAndroid, browserType]);

  const handleInstallClick = async () => {
    try {
      const installed = await installPWA();
      if (installed) {
        setIsVisible(false);
        setTimeout(() => setShowPrompt(false), 300);
      }
    } catch (error) {

    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
      
      // Mostrar novamente após 3 dias
      setTimeout(() => {
        localStorage.removeItem('pwa-install-dismissed');
      }, 3 * 24 * 60 * 60 * 1000);
    }, 300);
  };

  const getBrowserIcon = () => {
    switch (browserType) {
      case 'chrome':
        return <Chrome className="w-4 h-4" />;
      case 'safari':
        return <Globe className="w-4 h-4" />;
      default:
        return <Smartphone className="w-4 h-4" />;
    }
  };

  const getInstallInstructions = () => {
    if (isIOS) {
      return {
        title: 'Instalar no iOS',
        steps: [
          { icon: <Share className="w-4 h-4" />, text: 'Toque no ícone de compartilhar' },
          { icon: <Plus className="w-4 h-4" />, text: 'Selecione "Adicionar à Tela de Início"' },
          { icon: <Download className="w-4 h-4" />, text: 'Toque em "Adicionar"' }
        ]
      };
    } else if (isAndroid && browserType === 'chrome') {
      return {
        title: 'Instalar no Android',
        steps: [
          { icon: <Chrome className="w-4 h-4" />, text: 'Toque no menu do Chrome (⋮)' },
          { icon: <Plus className="w-4 h-4" />, text: 'Selecione "Adicionar à tela inicial"' },
          { icon: <Download className="w-4 h-4" />, text: 'Confirme a instalação' }
        ]
      };
    } else {
      return {
        title: 'Instalar App',
        steps: [
          { icon: <Smartphone className="w-4 h-4" />, text: 'Use o menu do seu navegador' },
          { icon: <Plus className="w-4 h-4" />, text: 'Procure por "Adicionar à tela inicial"' },
          { icon: <Download className="w-4 h-4" />, text: 'Confirme a instalação' }
        ]
      };
    }
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  const instructions = getInstallInstructions();

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <Card className="bg-white/95 backdrop-blur-md border-primary/20 shadow-2xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl relative">
                {getBrowserIcon()}
                {/* Indicador de status online/offline */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {isOnline ? (
                    <Wifi className="w-2 h-2 text-white absolute top-0 left-0" />
                  ) : (
                    <WifiOff className="w-2 h-2 text-white absolute top-0 left-0" />
                  )}
                </div>
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">
                  Instalar LA Music RH
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 flex items-center gap-1">
                  Acesso rápido e funcionalidades offline
                  {!isOnline && (
                    <span className="text-orange-600 font-medium">(Offline)</span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <p className="text-xs font-medium text-gray-700">
                {instructions.title}
              </p>
            </div>
            
            <div className="space-y-2">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-xs text-gray-600 flex-1">{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          {canInstall && !isIOS ? (
            <Button 
              onClick={handleInstallClick}
              className="w-full h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              size="sm"
              disabled={!isOnline}
            >
              <Download className="w-4 h-4 mr-2" />
              {isOnline ? 'Instalar Agora' : 'Offline - Aguarde'}
            </Button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 text-center font-medium">
                💡 Siga os passos acima para instalar o app
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${
                  i === 0 ? 'bg-primary' : 'bg-gray-300'
                } transition-colors duration-300`}></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;