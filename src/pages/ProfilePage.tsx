import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AvatarUpload } from '@/components/user/AvatarUpload';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Calendar,
  Shield,
  Key,
  Save,
  Loader2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    username: profile?.username || '',
    phone: profile?.phone || '',
    department: profile?.department || '',
    position: profile?.position || '',
    bio: profile?.bio || '',
    address: profile?.address || '',
    emergency_contact: profile?.emergency_contact || '',
    emergency_phone: profile?.emergency_phone || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await updateProfile(profileData);
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso',
      });
    } catch (error: any) {
      // Log desabilitado: Error updating profile
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perfil',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se a senha atual foi informada
    if (!passwordData.currentPassword) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe sua senha atual',
        variant: 'destructive'
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ser diferente da senha atual',
        variant: 'destructive'
      });
      return;
    }

    setIsPasswordLoading(true);

    try {
      // Validar senha atual tentando fazer login
      if (!user?.email) {
        throw new Error('Email do usuário não encontrado');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        toast({
          title: 'Erro',
          description: 'Senha atual incorreta',
          variant: 'destructive'
        });
        return;
      }

      // Se chegou até aqui, a senha atual está correta
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso',
      });
    } catch (error: any) {
      // Log desabilitado: Error changing password
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao alterar senha',
        variant: 'destructive'
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">👤 Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <AvatarUpload size="lg" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{profile?.username || 'Usuário'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {profile?.role && (
                    <Badge className={`mt-2 ${getRoleColor(profile.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {profile.role}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                {profile?.department && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.department}</span>
                  </div>
                )}
                {profile?.position && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.position}</span>
                  </div>
                )}
                {profileData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Seu nome de usuário"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Seu departamento"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={profileData.position}
                      onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Seu cargo"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Seu endereço"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Contato de Emergência</Label>
                    <Input
                      id="emergency_contact"
                      value={profileData.emergency_contact}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                      placeholder="Nome do contato"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
                    <Input
                      id="emergency_phone"
                      value={profileData.emergency_phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergency_phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite sua nova senha"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme sua nova senha"
                    required
                  />
                </div>
                
                <Button type="submit" disabled={isPasswordLoading}>
                  {isPasswordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Key className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}