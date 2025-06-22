
import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CollaboratorSearchModal } from '@/components/search/CollaboratorSearchModal';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { AdminProfileDropdown } from '@/components/admin/AdminProfileDropdown';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  return (
    <>
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
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar colaboradores..."
                className="pl-10 w-80 cursor-pointer"
                onClick={handleSearchClick}
                readOnly
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            
            <div className="border-l pl-3">
              <AdminProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <CollaboratorSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};
