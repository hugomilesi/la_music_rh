
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollaboratorSearchDropdown } from '@/components/search/CollaboratorSearchDropdown';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { AdminProfileDropdown } from '@/components/admin/AdminProfileDropdown';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-gray-600 hover:text-gray-900"
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
          
          <div className="border-l pl-3">
            <AdminProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
