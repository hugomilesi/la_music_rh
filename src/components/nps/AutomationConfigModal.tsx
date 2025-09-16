import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NPSAutomationConfig } from '@/types/nps';
import { NPSService } from '@/services/npsService';
import { Clock, Calendar, Settings } from 'lucide-react';

interface AutomationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
  config?: NPSAutomationConfig;
  onSave: (config: NPSAutomationConfig) => void;
}

export const AutomationConfigModal: React.FC<AutomationConfigModalProps> = ({
  isOpen,
  onClose,
  surveyId,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    is_active: false,
    frequency_type: 'monthly' as 'daily' | 'weekly' | 'monthly',
    frequency_value: 1,
    send_time: '09:00',
    target_day_of_week: 1, // Segunda-feira
    target_day_of_month: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        is_active: config.is_active,
        frequency_type: config.frequency_type,
        frequency_value: config.frequency_value,
        send_time: config.send_time,
        target_day_of_week: config.target_day_of_week || 1,
        target_day_of_month: config.target_day_of_month || 1,
      });
    }
  }, [config]);

  const calculateNextExecutionDate = () => {
    const now = new Date();
    const nextDate = new Date();

    switch (formData.frequency_type) {
      case 'daily':
        nextDate.setDate(now.getDate() + formData.frequency_value);
        break;
      case 'weekly':
        const daysUntilTarget = (formData.target_day_of_week - now.getDay() + 7) % 7;
        nextDate.setDate(now.getDate() + daysUntilTarget + (formData.frequency_value - 1) * 7);
        break;
      case 'monthly':
        nextDate.setMonth(now.getMonth() + formData.frequency_value);
        nextDate.setDate(formData.target_day_of_month);
        break;
    }

    return nextDate.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const nextExecutionDate = calculateNextExecutionDate();
      
      const configData = {
        survey_id: surveyId,
        ...formData,
        next_execution_date: nextExecutionDate,
      };

      let savedConfig;
      if (config) {
        savedConfig = await NPSService.updateAutomationConfig(config.id, configData);
      } else {
        savedConfig = await NPSService.createAutomationConfig(configData);
      }

      if (savedConfig) {
        onSave(savedConfig);
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração de Automação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status da Automação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status da Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>
                  {formData.is_active ? 'Automação Ativa' : 'Automação Inativa'}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Frequência */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Frequência de Envio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency_type">Tipo de Frequência</Label>
                  <Select
                    value={formData.frequency_type}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                      setFormData({ ...formData, frequency_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="frequency_value">Intervalo</Label>
                  <Input
                    id="frequency_value"
                    type="number"
                    min="1"
                    value={formData.frequency_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequency_value: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.frequency_type === 'daily' && 'A cada X dias'}
                    {formData.frequency_type === 'weekly' && 'A cada X semanas'}
                    {formData.frequency_type === 'monthly' && 'A cada X meses'}
                  </p>
                </div>
              </div>

              {/* Configurações específicas por tipo */}
              {formData.frequency_type === 'weekly' && (
                <div>
                  <Label htmlFor="target_day_of_week">Dia da Semana</Label>
                  <Select
                    value={formData.target_day_of_week.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        target_day_of_week: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {getDayName(day)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.frequency_type === 'monthly' && (
                <div>
                  <Label htmlFor="target_day_of_month">Dia do Mês</Label>
                  <Input
                    id="target_day_of_month"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.target_day_of_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_day_of_month: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Horário de Envio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário de Envio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="send_time">Horário</Label>
                <Input
                  id="send_time"
                  type="time"
                  value={formData.send_time}
                  onChange={(e) =>
                    setFormData({ ...formData, send_time: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview da Próxima Execução */}
          {formData.is_active && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  <strong>Próxima execução:</strong> {calculateNextExecutionDate()} às {formData.send_time}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};