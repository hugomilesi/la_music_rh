
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Award, 
  Settings,
  Bell,
  BarChart3,
  UserCheck,
  Clock,
  MessageSquare,
  Shield,
  Plane,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    icon: BarChart3,
    href: '/dashboard',
    description: 'Visão geral do sistema'
  },

  {
    title: 'Avaliações',
    icon: UserCheck,
    href: '/avaliacoes',
    description: 'Feedbacks e avaliações'
  },
  {
    title: 'Agenda',
    icon: Calendar,
    href: '/agenda',
    description: 'Plantões e escalas'
  },
  {
    title: 'Férias',
    icon: Plane,
    href: '/ferias',
    description: 'Controle de férias'
  },
  {
    title: 'Benefícios',
    icon: Heart,
    href: '/beneficios',
    description: 'Planos e benefícios'
  },
  {
    title: 'Documentos',
    icon: FileText,
    href: '/documentos',
    description: 'Contratos e arquivos'
  },
  {
    title: 'Ocorrências',
    icon: Shield,
    href: '/ocorrencias',
    description: 'Registros disciplinares'
  },
  {
    title: 'NPS Interno',
    icon: TrendingUp,
    href: '/nps',
    description: 'Clima organizacional'
  },
  {
    title: 'Reconhecimento',
    icon: Award,
    href: '/reconhecimento',
    description: 'Incentivos e gamificação'
  },
  {
    title: 'Ponto',
    icon: Clock,
    href: '/ponto',
    description: 'Controle de ponto'
  },
  {
    title: 'Notificações',
    icon: Bell,
    href: '/notificacoes',
    description: 'Alertas e comunicados'
  },
  {
    title: 'WhatsApp',
    icon: MessageSquare,
    href: '/whatsapp',
    description: 'Integração WhatsApp'
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/configuracoes',
    description: 'Painel administrativo'
  }
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <div className={cn(
      "bg-gradient-to-b from-purple-900 to-purple-800 text-white transition-all duration-300 shadow-xl",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">LA</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold">LA Music RH</h1>
              <p className="text-xs text-purple-200">Gestão de Pessoas</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="mt-8">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group text-left",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "text-purple-200 hover:bg-white/10 hover:text-white"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{item.title}</span>
                      <p className="text-xs text-purple-200 truncate">{item.description}</p>
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
};
