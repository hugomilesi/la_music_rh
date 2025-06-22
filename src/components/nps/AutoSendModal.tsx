
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Clock, Users, MessageSquare, Settings } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface AutoSendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AutoSendModal: React.FC<AutoSendModalProps> = ({
  open,
  onOpenChange
}) => {
  const { surveys } = useNPS();
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [sendFrequency, setSendFrequency] = useState('monthly');
  const [sendTime, setSendTime] = useState('09:00');
  const [sendDay, setSendDay] = useState('1');

  const handleSaveConfiguration = () => {
    const config = {
      enabled: autoSendEnabled,
      surveyId: selectedSurvey,
      frequency: sendFrequency,
      time: sendTime,
      day: sendDay
    };

    console.log('Configuração de envio automático salva:', config);
    alert('Configuração salva com sucesso! As pesquisas serão enviadas automaticamente conforme configurado.');
    onOpenChange(false);
  };

  const handleTestSend = async () => {
    if (!selectedSurvey) {
      alert('Selecione uma pesquisa primeiro');
      return;
    }

    console.log('Enviando pesquisa de teste via WhatsApp...');
    alert('Pesquisa de teste enviada! Verifique seu WhatsApp.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Envio Automático WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Status do Envio Automático */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Status do Envio Automático
                <Switch
                  checked={autoSendEnabled}
                  onCheckedChange={setAutoSendEnabled}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={autoSendEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {autoSendEnabled ? 'Ativo' : 'Inativo'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {autoSendEnabled ? 'Pesquisas serão enviadas automaticamente' : 'Envio manual apenas'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Envio */}
          {autoSendEnabled && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações de Envio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="survey">Pesquisa Padrão</Label>
                    <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma pesquisa" />
                      </SelectTrigger>
                      <SelectContent>
                        {surveys.map((survey) => (
                          <SelectItem key={survey.id} value={survey.id}>
                            {survey.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequência</Label>
                      <Select value={sendFrequency} onValueChange={setSendFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="time">Horário de Envio</Label>
                      <Input
                        id="time"
                        type="time"
                        value={sendTime}
                        onChange={(e) => setSendTime(e.target.value)}
                      />
                    </div>
                  </div>

                  {sendFrequency === 'monthly' && (
                    <div>
                      <Label htmlFor="day">Dia do Mês</Label>
                      <Select value={sendDay} onValueChange={setSendDay}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              Dia {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Próximo Envio */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Próximo Envio Programado</p>
                      <p className="text-sm text-gray-600">
                        {sendFrequency === 'monthly' ? `Todo dia ${sendDay}` : 
                         sendFrequency === 'weekly' ? 'Toda segunda-feira' : 'Todo 1º dia do trimestre'} às {sendTime}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Estatísticas de Envio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas de Envio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">27</p>
                  <p className="text-sm text-gray-600">Colaboradores Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">85%</p>
                  <p className="text-sm text-gray-600">Taxa de Entrega</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">23</p>
                  <p className="text-sm text-gray-600">Respostas Últimos 30d</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleTestSend}
              disabled={!selectedSurvey}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar Teste
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveConfiguration}>
                <Settings className="w-4 h-4 mr-2" />
                Salvar Configuração
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
