
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Plus, Clock, Users, FileText, Zap } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { toast } from '@/hooks/use-toast';

interface AutomationManagerProps {
  className?: string;
}

export const AutomationManager: React.FC<AutomationManagerProps> = ({ className }) => {
  const { automations, updateAutomation } = useWhatsApp();
  const [editingAutomation, setEditingAutomation] = useState<string | null>(null);

  const handleToggleAutomation = async (id: string, enabled: boolean) => {
    try {
      await updateAutomation(id, { enabled });
      toast({
        title: enabled ? "Automação ativada" : "Automação desativada",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar a automação.",
        variant: "destructive",
      });
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'birthday':
        return <Users className="w-4 h-4" />;
      case 'evaluation_reminder':
        return <Clock className="w-4 h-4" />;
      case 'document_expiry':
        return <FileText className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      birthday: 'Aniversário',
      evaluation_reminder: 'Lembrete de Avaliação',
      document_expiry: 'Vencimento de Documento',
      custom: 'Personalizado'
    };
    return labels[trigger] || trigger;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Automações do WhatsApp
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Automação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Automação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome da Automação</Label>
                    <Input placeholder="Ex: Lembretes de Reunião" />
                  </div>
                  <div>
                    <Label>Tipo de Gatilho</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gatilho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Aniversário</SelectItem>
                        <SelectItem value="evaluation_reminder">Lembrete de Avaliação</SelectItem>
                        <SelectItem value="document_expiry">Vencimento de Documento</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Modelo de Mensagem</Label>
                    <Textarea placeholder="Digite o modelo da mensagem..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Horário</Label>
                      <Input type="time" defaultValue="09:00" />
                    </div>
                    <div>
                      <Label>Dias de Antecedência</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Criar Automação</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.map((automation) => (
              <div key={automation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTriggerIcon(automation.trigger)}
                    <div>
                      <h3 className="font-medium">{automation.name}</h3>
                      <p className="text-sm text-gray-600">{automation.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {getTriggerLabel(automation.trigger)}
                    </Badge>
                    {automation.schedule && (
                      <>
                        <span>⏰ {automation.schedule.time}</span>
                        {automation.schedule.daysBefore && (
                          <span>📅 {automation.schedule.daysBefore} dias antes</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={automation.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {automation.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  <Switch
                    checked={automation.enabled}
                    onCheckedChange={(enabled) => handleToggleAutomation(automation.id, enabled)}
                  />
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Configurar {automation.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome</Label>
                          <Input defaultValue={automation.name} />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Input defaultValue={automation.description} />
                        </div>
                        <div>
                          <Label>Modelo de Mensagem</Label>
                          <Textarea defaultValue="Mensagem automática configurada" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Horário</Label>
                            <Input type="time" defaultValue={automation.schedule?.time || "09:00"} />
                          </div>
                          <div>
                            <Label>Dias de Antecedência</Label>
                            <Input type="number" defaultValue={automation.schedule?.daysBefore || 0} />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancelar</Button>
                          <Button>Salvar</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
