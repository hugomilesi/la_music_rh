
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  Heart,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { EditProfileDialog } from './EditProfileDialog';
import { AvatarUpload } from './AvatarUpload';

export const UserProfile: React.FC = () => {
  const { user, profile } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem. Verifique se a nova senha e a confirmação são idênticas.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres para garantir a segurança.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      // Primeiro, verificar a senha atual fazendo login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword
      });

      if (signInError) {
        toast({
          title: "Senha atual incorreta",
          description: "A senha atual informada está incorreta. Verifique e tente novamente.",
          variant: "destructive"
        });
        setIsChangingPassword(false);
        return;
      }

      // Atualizar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        toast({
          title: "Erro ao alterar senha",
          description: `Não foi possível alterar a senha: ${updateError.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Senha alterada com sucesso!",
          description: "Sua senha foi atualizada. Use a nova senha em seus próximos acessos.",
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao alterar a senha. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua conta segura alterando sua senha regularmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                    required
                    disabled={isChangingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                    disabled={isChangingPassword}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite sua nova senha"
                    required
                    disabled={isChangingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                    disabled={isChangingPassword}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme sua nova senha"
                    required
                    disabled={isChangingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                    disabled={isChangingPassword}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};
