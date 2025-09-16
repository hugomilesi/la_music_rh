
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollaboratorSearchDropdown } from '@/components/search/CollaboratorSearchDropdown';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { UserProfileDropdown } from '@/components/auth/UserProfileDropdown';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="glass-subtle border-b border-white/10 shadow-hr-soft sticky top-0 z-50 backdrop-blur-md mobile-safe">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 mobile-safe">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSidebar();
            }}
            className="min-w-[48px] min-h-[48px] p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 flex-shrink-0 touch-target menu-toggle-button"
            aria-label="Abrir menu de navegação"
            title="Menu"
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <div className="hidden sm:block flex-1 max-w-xs md:max-w-sm lg:max-w-md">
            <CollaboratorSearchDropdown 
              placeholder="Buscar colaboradores..."
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:block">
            <NotificationDropdown />
          </div>
          
          <div className="border-l border-gray-200/30 pl-2 sm:pl-3">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="sm:hidden px-3 pb-3">
        <CollaboratorSearchDropdown 
          placeholder="Buscar colaboradores..."
          className="w-full"
        />
      </div>
    </header>
  );
};
