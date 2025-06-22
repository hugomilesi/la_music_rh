
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { toast } from '@/hooks/use-toast';

interface WhatsAppConfigDialogProps {
  children: React.ReactNode;
}

export const WhatsAppConfigDialog: React.FC<WhatsAppConfigDialogProps> = ({ children }) => {
  const { config, loading, updateConfig, testConnection } = useWhatsApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
    phoneNumber: config.phoneNumber,
    webhookUrl: config.webhookUrl
  });
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    try {
      await updateConfig({
        ...formData,
        isConfigured: Boolean(formData.apiUrl && formData.apiKey && formData.phoneNumber)
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do WhatsApp foram atualizadas com sucesso.",
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const success = await testConnection();
      if (success) {
        toast({
          title: "Conexão bem-sucedida",
          description: "A API do WhatsApp está respondendo corretamente.",
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: "Verifique suas configurações de API.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar com a API do WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração da API WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Integração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {config.isConfigured ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600">Configurado</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-600">Não Configurado</span>
                    </>
                  )}
                </div>
                <Badge className={config.isConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {config.isConfigured ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiUrl">URL da API</Label>
              <Input
                id="apiUrl"
                placeholder="https://api.whatsapp.business.com"
                value={formData.apiUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="apiKey">Chave da API</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Sua chave de API do WhatsApp Business"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Número do WhatsApp Business</Label>
              <Input
                id="phoneNumber"
                placeholder="+55 11 99999-9999"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="webhookUrl">URL do Webhook (Opcional)</Label>
              <Input
                id="webhookUrl"
                placeholder="https://seuapp.com/webhook/whatsapp"
                value={formData.webhookUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
              />
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm text-blue-800">Como Configurar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>Crie uma conta no WhatsApp Business API</li>
                <li>Obtenha sua chave de API no painel de controle</li>
                <li>Configure o número do WhatsApp Business</li>
                <li>Configure o webhook para receber atualizações (opcional)</li>
                <li>Teste a conexão antes de salvar</li>
              </ol>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!formData.apiUrl || !formData.apiKey || testing}
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
