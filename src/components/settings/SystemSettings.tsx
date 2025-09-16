import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, RefreshCw } from 'lucide-react';

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  updated_at: string;
}

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_system_settings');
      
      if (error) throw error;
      
      setSettings(data || []);
      
      // Encontrar a URL base atual
      const baseUrlSetting = data?.find((s: SystemSetting) => s.key === 'app_base_url');
      if (baseUrlSetting) {
        setAppUrl(baseUrlSetting.value);
      }
    } catch (error) {
      toast.error('Erro ao carregar configurações do sistema');
    } finally {
      setLoading(false);
    }
  };

  const updateAppUrl = async () => {
    if (!appUrl.trim()) {
      toast({
        title: 'Erro',
        description: 'A URL não pode estar vazia.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.rpc('update_app_base_url', {
        new_url: appUrl.trim()
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'URL base atualizada com sucesso!',
      });
      
      // Recarregar configurações
      await loadSettings();
    } catch (error) {
      toast.error('Erro ao atualizar URL da Evolution API');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Configurações do Sistema
            <Button
              variant="outline"
              size="sm"
              onClick={loadSettings}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
          <CardDescription>
            Gerencie as configurações globais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuração da URL Base */}
          <div className="space-y-2">
            <Label htmlFor="app-url">URL Base da Aplicação</Label>
            <div className="flex gap-2">
              <Input
                id="app-url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://exemplo.com ou http://localhost:8080"
                className="flex-1"
              />
              <Button
                onClick={updateAppUrl}
                disabled={saving || !appUrl.trim()}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Esta URL será usada para gerar links em mensagens WhatsApp e emails.
              Para desenvolvimento local, use: http://localhost:8080
            </p>
          </div>

          {/* Lista de todas as configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Todas as Configurações</h3>
            <div className="grid gap-4">
              {settings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{setting.key}</p>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Categoria: {setting.category} | Atualizado: {new Date(setting.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {setting.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}