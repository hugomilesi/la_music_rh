import { useState, useEffect } from 'react';

interface PWAInfo {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  browser: 'chrome' | 'safari' | 'firefox' | 'edge' | 'other';
  installPromptEvent: BeforeInstallPromptEvent | null;
  isOnline: boolean;
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
}

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

export const usePWA = (): PWAInfo => {
  const [pwaInfo, setPwaInfo] = useState<PWAInfo>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    platform: 'unknown',
    browser: 'other',
    installPromptEvent: null,
    isOnline: navigator.onLine,
    displayMode: 'browser'
  });

  useEffect(() => {
    const detectPlatform = (): 'ios' | 'android' | 'desktop' | 'unknown' => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/ipad|iphone|ipod/.test(userAgent)) {
        return 'ios';
      } else if (/android/.test(userAgent)) {
        return 'android';
      } else if (/windows|macintosh|linux/.test(userAgent)) {
        return 'desktop';
      }
      
      return 'unknown';
    };

    const detectBrowser = (): 'chrome' | 'safari' | 'firefox' | 'edge' | 'other' => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/edg/.test(userAgent)) {
        return 'edge';
      } else if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) {
        return 'chrome';
      } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
        return 'safari';
      } else if (/firefox/.test(userAgent)) {
        return 'firefox';
      }
      
      return 'other';
    };

    const detectDisplayMode = (): 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser' => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
      } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return 'fullscreen';
      } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
      }
      
      return 'browser';
    };

    const detectInstallation = (): { isInstalled: boolean; isStandalone: boolean } => {
      const displayMode = detectDisplayMode();
      const isStandalone = displayMode === 'standalone' || displayMode === 'fullscreen';
      
      // iOS detection
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      // Android/Chrome detection
      const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Windows detection
      const isWindowsStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      const isInstalled = isIOSStandalone || isAndroidStandalone || isWindowsStandalone || isStandalone;
      
      return {
        isInstalled,
        isStandalone
      };
    };

    const updatePWAInfo = () => {
      const platform = detectPlatform();
      const browser = detectBrowser();
      const displayMode = detectDisplayMode();
      const { isInstalled, isStandalone } = detectInstallation();
      
      setPwaInfo(prev => ({
        ...prev,
        platform,
        browser,
        displayMode,
        isInstalled,
        isStandalone,
        isOnline: navigator.onLine
      }));
    };

    // Initial detection
    updatePWAInfo();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setPwaInfo(prev => ({
        ...prev,
        canInstall: true,
        installPromptEvent: e
      }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setPwaInfo(prev => ({
        ...prev,
        isInstalled: true,
        isStandalone: true,
        canInstall: false,
        installPromptEvent: null
      }));
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setPwaInfo(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPwaInfo(prev => ({ ...prev, isOnline: false }));
    };

    // Listen for display mode changes
    const handleDisplayModeChange = () => {
      const displayMode = detectDisplayMode();
      const { isInstalled, isStandalone } = detectInstallation();
      
      setPwaInfo(prev => ({
        ...prev,
        displayMode,
        isInstalled,
        isStandalone
      }));
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for display mode changes
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)');
    const minimalUIQuery = window.matchMedia('(display-mode: minimal-ui)');
    
    standaloneQuery.addEventListener('change', handleDisplayModeChange);
    fullscreenQuery.addEventListener('change', handleDisplayModeChange);
    minimalUIQuery.addEventListener('change', handleDisplayModeChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
      fullscreenQuery.removeEventListener('change', handleDisplayModeChange);
      minimalUIQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  return pwaInfo;
};

// Hook para instalar PWA
export const useInstallPWA = () => {
  const { installPromptEvent, canInstall } = usePWA();
  
  const installPWA = async (): Promise<boolean> => {
    if (!installPromptEvent || !canInstall) {
      return false;
    }
    
    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      return outcome === 'accepted';
    } catch (error) {

      return false;
    }
  };
  
  return {
    installPWA,
    canInstall
  };
};

// Hook para detectar se está offline
export const useOfflineStatus = () => {
  const { isOnline } = usePWA();
  return !isOnline;
};

// Hook para obter informações específicas da plataforma
export const usePlatformInfo = () => {
  const { platform, browser, displayMode } = usePWA();
  
  const isMobile = platform === 'ios' || platform === 'android';
  const isDesktop = platform === 'desktop';
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  const isChrome = browser === 'chrome';
  const isSafari = browser === 'safari';
  const isFirefox = browser === 'firefox';
  const isEdge = browser === 'edge';
  
  return {
    platform,
    browser,
    displayMode,
    isMobile,
    isDesktop,
    isIOS,
    isAndroid,
    isChrome,
    isSafari,
    isFirefox,
    isEdge
  };
};

// Utilitário para verificar se PWA é suportado
export const isPWASupported = (): boolean => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

// Utilitário para verificar se pode mostrar prompt de instalação
export const canShowInstallPrompt = (platform: string, browser: string): boolean => {
  // Chrome/Edge no Android e Desktop
  if ((browser === 'chrome' || browser === 'edge') && (platform === 'android' || platform === 'desktop')) {
    return true;
  }
  
  // Safari no iOS (manual)
  if (browser === 'safari' && platform === 'ios') {
    return true;
  }
  
  return false;
};