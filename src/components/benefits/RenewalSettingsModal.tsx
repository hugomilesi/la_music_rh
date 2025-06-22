
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { RenewalSettings } from '@/types/benefits';

interface RenewalSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefitId: string;
  settings?: RenewalSettings;
  onSaveSettings: (settings: RenewalSettings) => void;
}

export const RenewalSettingsModal: React.FC<RenewalSettingsModalProps> = ({
  open,
  onOpenChange,
  benefitId,
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<Partial<RenewalSettings>>({
    renewalPeriod: settings?.renewalPeriod || 'annual',
    requiresPerformanceReview: settings?.requiresPerformanceReview || false,
    minimumPerformanceScore: settings?.minimumPerformanceScore || 70,
    autoRenewal: settings?.autoRenewal || false,
    reminderDays: settings?.reminderDays || 30,
    gracePeriodDays: settings?.gracePeriodDays || 7
  });

  const handleSave = () => {
    const renewalSettings: RenewalSettings = {
      id: settings?.id || Date.now().toString(),
      renewalPeriod: formData.renewalPeriod!,
      requiresPerformanceReview: formData.requiresPerformanceReview!,
      minimumPerformanceScore: formData.minimumPerformanceScore!,
      autoRenewal: formData.autoRenewal!,
      reminderDays: formData.reminderDays!,
      gracePeriodDays: formData.gracePeriodDays!
    };

    onSaveSettings(renewalSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Configurações de Renovação
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Renewal Period */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Período de Renovação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="renewalPeriod">Frequência de Renovação</Label>
                  <Select
                    value={formData.renewalPeriod}
                    onValueChange={(value) => setFormData({ ...formData, renewalPeriod: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="biannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoRenewal"
                    checked={formData.autoRenewal}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoRenewal: checked })}
                  />
                  <Label htmlFor="autoRenewal">Renovação automática</Label>
                </div>
              </CardContent>
            </Card>

            {/* Performance Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Requisitos de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresPerformanceReview"
                    checked={formData.requiresPerformanceReview}
                    onCheckedChange={(checked) => setFormData({ ...formData, requiresPerformanceReview: checked })}
                  />
                  <Label htmlFor="requiresPerformanceReview">Exigir avaliação de performance para renovação</Label>
                </div>

                {formData.requiresPerformanceReview && (
                  <div className="space-y-2">
                    <Label htmlFor="minimumScore">Pontuação Mínima (%)</Label>
                    <Input
                      id="minimumScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.minimumPerformanceScore}
                      onChange={(e) => setFormData({ ...formData, minimumPerformanceScore: parseInt(e.target.value) })}
                    />
                    <p className="text-sm text-gray-600">
                      Funcionários com pontuação abaixo deste valor não terão o benefício renovado automaticamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notificações e Prazos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Lembrete (dias antes)</Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    min="1"
                    value={formData.reminderDays}
                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-600">
                    Notificar HR quantos dias antes do vencimento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gracePeriodDays">Período de Graça (dias)</Label>
                  <Input
                    id="gracePeriodDays"
                    type="number"
                    min="0"
                    value={formData.gracePeriodDays}
                    onChange={(e) => setFormData({ ...formData, gracePeriodDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-600">
                    Dias após vencimento antes de suspender o benefício
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Resumo da Configuração:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Renovação: {
                    formData.renewalPeriod === 'monthly' ? 'Mensal' :
                    formData.renewalPeriod === 'quarterly' ? 'Trimestral' :
                    formData.renewalPeriod === 'biannual' ? 'Semestral' : 'Anual'
                  }</li>
                  <li>• Modo: {formData.autoRenewal ? 'Automático' : 'Manual'}</li>
                  <li>• Avaliação de performance: {formData.requiresPerformanceReview ? 'Obrigatória' : 'Não obrigatória'}</li>
                  {formData.requiresPerformanceReview && (
                    <li>• Pontuação mínima: {formData.minimumPerformanceScore}%</li>
                  )}
                  <li>• Lembrete: {formData.reminderDays} dias antes</li>
                  <li>• Período de graça: {formData.gracePeriodDays} dias</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
