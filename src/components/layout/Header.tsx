
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
    <header className="glass-subtle border-b border-white/10 shadow-hr-soft sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-gray-600 hover:text-gray-900 hover-lift rounded-xl transition-all duration-300"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <CollaboratorSearchDropdown 
            placeholder="Buscar colaboradores..."
            className="w-80"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          
          <div className="border-l border-gray-200/30 pl-3">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
