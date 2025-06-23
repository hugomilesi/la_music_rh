
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Edit, 
  Mail, 
  Calendar, 
  Shield, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  User,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { EditProfileDialog } from './EditProfileDialog';
import { AvatarUpload } from './AvatarUpload';

export const UserProfile: React.FC = () => {
  const { user, profile } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getRoleColor = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'gerente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getProfileData = () => {
    return {
      phone: (profile as any)?.phone,
      department: (profile as any)?.department,
      position: (profile as any)?.position,
      bio: (profile as any)?.bio,
      birth_date: (profile as any)?.birth_date,
      address: (profile as any)?.address,
      emergency_contact: (profile as any)?.emergency_contact,
      emergency_phone: (profile as any)?.emergency_phone,
      start_date: (profile as any)?.start_date,
      status: (profile as any)?.status,
    };
  };

  const profileData = getProfileData();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <AvatarUpload size="lg" showUploadButton={false} showDeleteButton={false} />
              <div>
                <CardTitle className="text-2xl">{profile?.full_name || 'Usuário'}</CardTitle>
                <CardDescription className="text-base">{user?.email}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  {profile?.role && (
                    <Badge variant="secondary" className={getRoleColor(profile.role)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {profile.role}
                    </Badge>
                  )}
                  {profileData.status && (
                    <Badge variant={profileData.status === 'active' ? 'default' : 'secondary'}>
                      {profileData.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={() => setEditDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Bio Card */}
      {profileData.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Sobre mim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Seus dados pessoais básicos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base">{user?.email}</p>
              </div>
            </div>
            
            {profileData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-base">{profileData.phone}</p>
                </div>
              </div>
            )}

            {profileData.birth_date && (
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                  <p className="text-base">{formatDate(profileData.birth_date)}</p>
                </div>
              </div>
            )}

            {profileData.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p className="text-base">{profileData.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
            <CardDescription>
              Seus dados de trabalho
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.department && (
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Departamento</p>
                  <p className="text-base">{profileData.department}</p>
                </div>
              </div>
            )}

            {profileData.position && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Cargo</p>
                  <p className="text-base">{profileData.position}</p>
                </div>
              </div>
            )}

            {profileData.start_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Início</p>
                  <p className="text-base">{formatDate(profileData.start_date)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Conta criada em</p>
                <p className="text-base">{formatDate(profile?.created_at || null)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contact */}
      {(profileData.emergency_contact || profileData.emergency_phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Contato de Emergência
            </CardTitle>
            <CardDescription>
              Informações para situações de emergência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.emergency_contact && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome do Contato</p>
                    <p className="text-base">{profileData.emergency_contact}</p>
                  </div>
                </div>
              )}
              
              {profileData.emergency_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefone de Emergência</p>
                    <p className="text-base">{profileData.emergency_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};
