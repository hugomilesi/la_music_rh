
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Database,
  Download
} from 'lucide-react';

interface UserSettingsState {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  language: string;
  autoLogout: boolean;
  dataSharing: boolean;
}

export const UserSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettingsState>({
    emailNotifications: true,
    whatsappNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'pt-BR',
    autoLogout: false,
    dataSharing: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = (key: keyof UserSettingsState, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Configurações salvas',
        description: 'Suas preferências foram atualizadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // Simular exportação de dados
      const userData = {
        email: user?.email,
        exportDate: new Date().toISOString(),
        settings: settings,
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Dados exportados',
        description: 'Seus dados foram exportados com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar dados.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-gray-500">Receber alertas e atualizações por email</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="whatsapp-notifications">Notificações por WhatsApp</Label>
                <p className="text-sm text-gray-500">Receber mensagens importantes via WhatsApp</p>
              </div>
            </div>
            <Switch
              id="whatsapp-notifications"
              checked={settings.whatsappNotifications}
              onCheckedChange={(checked) => handleSettingChange('whatsappNotifications', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-sm text-gray-500">Receber notificações no navegador</p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-gray-500">Usar tema escuro na interface</p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-500" />
              <div>
                <Label>Idioma</Label>
                <p className="text-sm text-gray-500">Idioma da interface do sistema</p>
              </div>
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Configure opções de segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="auto-logout">Logout Automático</Label>
                <p className="text-sm text-gray-500">Fazer logout automaticamente após inatividade</p>
              </div>
            </div>
            <Switch
              id="auto-logout"
              checked={settings.autoLogout}
              onCheckedChange={(checked) => handleSettingChange('autoLogout', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Privacidade e Dados
          </CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e privacidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="data-sharing">Compartilhamento de Dados</Label>
                <p className="text-sm text-gray-500">Permitir uso de dados para melhorias do sistema</p>
              </div>
            </div>
            <Switch
              id="data-sharing"
              checked={settings.dataSharing}
              onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-gray-500" />
              <div>
                <Label>Exportar Dados</Label>
                <p className="text-sm text-gray-500">Baixar uma cópia dos seus dados</p>
              </div>
            </div>
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
