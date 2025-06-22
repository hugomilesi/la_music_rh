
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Settings, LogOut, Edit, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditProfileDialog } from './EditProfileDialog';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  units: string[];
  avatar?: string;
  lastLogin: string;
  joinDate: string;
}

const mockAdminProfile: AdminProfile = {
  id: 'admin-1',
  name: 'Aline Cristina Pessanha Faria',
  email: 'aline.faria@lamusic.com',
  phone: '(21) 99999-9999',
  role: 'Coordenadora Geral',
  department: 'Coordenação',
  units: ['Campo Grande', 'Barra', 'Recreio'],
  lastLogin: '2024-03-21 09:30',
  joinDate: '2024-01-15'
};

export const AdminProfileDropdown: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfile>(mockAdminProfile);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleProfileUpdate = (updatedProfile: Partial<AdminProfile>) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Implement logout logic here
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{profile.name.split(' ')[0]}</p>
              <p className="text-xs text-gray-500">{profile.role}</p>
            </div>
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 bg-white" align="end">
          <div className="p-4">
            {/* Profile Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-600">{profile.role}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {profile.department}
                </Badge>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{profile.units.join(', ')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Desde {new Date(profile.joinDate).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Last Login */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Último acesso</p>
              <p className="text-sm font-medium">
                {new Date(profile.lastLogin).toLocaleString('pt-BR')}
              </p>
            </div>

            <Separator className="mb-4" />

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              
              <Separator className="my-2" />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair do Sistema
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        profile={profile}
        onUpdate={handleProfileUpdate}
      />
    </>
  );
};
