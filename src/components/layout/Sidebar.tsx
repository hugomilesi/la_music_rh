
import React, { useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  TrendingUp, 
  Award, 
  Settings,
  Bell,
  BarChart3,
  UserCheck,
  MessageSquare,
  Shield,
  Plane,
  Heart,
  DollarSign,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { useIsMobile } from '@/hooks/use-mobile';
import '@/styles/sidebar-animations.css';
import '@/styles/mobile-typography.css';

const menuItems = [
  {
    title: 'Dashboard',
    icon: BarChart3,
    href: '/dashboard',
    description: 'Visão geral do sistema',
    module: 'dashboard'
  },
  {
    title: 'Avaliações',
    icon: UserCheck,
    href: '/avaliacoes',
    description: 'Feedbacks e avaliações',
    module: 'avaliacoes'
  },
  {
    title: 'Agenda',
    icon: Calendar,
    href: '/agenda',
    description: 'Plantões e escalas',
    module: 'agenda'
  },
  {
    title: 'Férias',
    icon: Plane,
    href: '/ferias',
    description: 'Controle de férias',
    module: 'ferias'
  },
  {
    title: 'Benefícios',
    icon: Heart,
    href: '/beneficios',
    description: 'Planos e benefícios',
    module: 'beneficios'
  },
  {
    title: 'Documentos',
    icon: FileText,
    href: '/documentos',
    description: 'Contratos e arquivos',
    module: 'documentos'
  },
  {
    title: 'Ocorrências',
    icon: Shield,
    href: '/ocorrencias',
    description: 'Registros disciplinares',
    module: 'ocorrencias'
  },
  {
    title: 'NPS Interno',
    icon: TrendingUp,
    href: '/nps',
    description: 'Clima organizacional',
    module: 'nps'
  },
  {
    title: 'Gamificação',
    icon: Award,
    href: '/reconhecimento',
    description: 'Incentivos e Reconhecimentos',
    module: 'reconhecimento'
  },
  {
    title: 'Notificações',
    icon: Bell,
    href: '/notificacoes',
    description: 'Alertas e comunicados',
    module: 'notificacoes'
  },
  {
    title: 'WhatsApp',
    icon: MessageSquare,
    href: '/whatsapp',
    description: 'Integração WhatsApp',
    module: 'whatsapp'
  },
  {
    title: 'Folha de Pagamento',
    icon: DollarSign,
    href: '/folha-pagamento',
    description: 'Gestão da folha de pagamento',
    module: 'folha_pagamento'
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/configuracoes',
    description: 'Painel administrativo',
    module: 'configuracoes'
  }
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ collapsed, onToggle, isOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canViewModule, loading: isLoading } = usePermissionsV2();
  const isMobile = useIsMobile();
  
  // Debug: Log props and state changes
  useEffect(() => {
    // Sidebar state updated
  }, [collapsed, isOpen, isMobile, location.pathname]);

  // Suporte para tecla ESC (acessibilidade)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && isOpen) {
        onToggle();
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isMobile, isOpen, onToggle]);

  const handleNavigation = useCallback((href: string) => {
    navigate(href);
    if (isMobile && onToggle) {
      onToggle();
    }
  }, [navigate, isMobile, onToggle]);

  // Memorizar o pathname atual
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // Monitorar mudanças nas dependências do useMemo
  useEffect(() => {
    console.log('🔧 [Sidebar] Dependências do useMemo mudaram:', {
      canViewModuleType: typeof canViewModule,
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [canViewModule, isLoading]);

  // Filtrar itens do menu baseado nas permissões do usuário
  const visibleMenuItems = useMemo(() => {
    if (isLoading) {
      return [];
    }
    
    const filtered = menuItems.filter(item => {
      const canView = canViewModule(item.module);
      return canView;
    });
    
    return filtered;
  }, [canViewModule, isLoading]);

  // Listen for profile-loaded event to force sidebar re-render
  useEffect(() => {
    const handleProfileLoaded = () => {
      // The useMemo above will automatically recalculate when canViewModule changes
    };

    window.addEventListener('profile-loaded', handleProfileLoaded);
    
    return () => {
      window.removeEventListener('profile-loaded', handleProfileLoaded);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={cn(
        "glass-dark gradient-hr-primary text-white transition-all duration-300 shadow-hr-strong fixed left-0 top-0 h-full z-50 overflow-y-auto",
        collapsed ? "w-16" : "w-52 sm:w-56 md:w-64"
      )}>
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 glass-gradient rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-sm">LA</span>
            </div>
            {!collapsed && (
               <div className="sidebar-content">
                 <h1 className="sidebar-title sidebar-text">LA Music RH</h1>
                 <p className="sidebar-subtitle sidebar-text">Gestão de Pessoas</p>
               </div>
             )}
          </div>
        </div>
        
        <nav className="mt-6 sm:mt-8">
          <ul className="space-y-0.5 sm:space-y-1 px-2">
            {[...Array(5)].map((_, i) => (
              <li key={i}>
                <div className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-white/10 animate-pulse min-h-[44px]">
                  <div className="w-5 h-5 bg-white/20 rounded" />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-white/20 rounded mb-1" />
                      <div className="h-3 bg-white/10 rounded" />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div 
      data-testid="sidebar"
      onClick={(e) => {
        // Prevenir que cliques no sidebar fechem o overlay
        e.stopPropagation();
      }}
      className={cn(
        "glass-dark gradient-hr-primary text-white shadow-hr-strong",
        "sidebar-collapse-transition sidebar-mobile sidebar-collapse-smooth sidebar-container-animation",
        "sidebar-collapse-animation sidebar-retract-animation sidebar-sticky mobile-safe", collapsed ? "collapsed" : "expanded",
        isMobile ? "fixed left-0 top-0 z-50 w-72 h-screen overflow-y-auto" : "sticky top-0 z-auto h-screen overflow-y-auto",
        !isMobile && collapsed ? "w-16" : !isMobile ? "w-72" : "w-72"
      )}>
      {/* Header com logo e botão de fechar */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 glass-gradient rounded-xl flex items-center justify-center hover-glow transition-all duration-300">
              <span className="text-white font-bold text-sm">LA</span>
            </div>
            {!collapsed && (
              <div className={cn("sidebar-content-fade", collapsed ? "collapsed" : "expanded")}>
                <h1 className="text-base sm:text-lg font-bold">LA Music RH</h1>
                <p className="text-xs text-white/70">Gestão de Pessoas</p>
              </div>
            )}
          </div>
          
          {/* Ícone de fechamento para mobile */}
          {isMobile && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
              }}
              className="w-12 h-12 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 touch-target"
              aria-label="Fechar menu"
              title="Fechar menu"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      
      {/* Navegação */}
      <nav className="mt-4 sm:mt-6 sidebar-nav" data-testid="sidebar-nav">
        <ul className="space-y-1 px-2">
          {visibleMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            
            return (
              <li key={item.href} className={`sidebar-item-animate sidebar-staggered-animation`} style={{animationDelay: `${index * 0.05}s`}}>
                <button
                  data-testid={`sidebar-item-${item.href.replace('/', '')}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigation(item.href);
                    // Fechar sidebar em mobile após navegação
                    if (isMobile) {
                      onToggle();
                    }
                  }}
                  className={cn(
                     "w-full flex items-center gap-3 px-3 py-3 rounded-xl group text-left touch-target touch-feedback menu-item",
                     "min-h-[48px] sidebar-responsive-item",
                     isActive 
                        ? "glass-strong text-white shadow-hr-glow bg-white/20 menu-item-active" 
                       : "text-white/85 hover:glass-subtle hover:text-white hover:shadow-hr-soft hover:bg-white/10"
                   )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                     <div className={cn("flex-1 min-w-0 sidebar-content sidebar-content-fade", collapsed ? "collapsed" : "expanded")}>
                       <span className="menu-item-title sidebar-text block">{item.title}</span>
                       <p className="menu-item-description sidebar-text truncate transition-colors">{item.description}</p>
                     </div>
                   )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';
