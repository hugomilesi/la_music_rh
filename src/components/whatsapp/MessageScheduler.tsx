
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Calendar as CalendarIcon, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ScheduledMessage {
  id: string;
  recipient: string;
  recipientName: string;
  message: string;
  scheduledFor: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  type: 'text' | 'template';
  templateId?: string;
  createdAt: Date;
}

const mockScheduledMessages: ScheduledMessage[] = [
  {
    id: '1',
    recipient: '+5511999999999',
    recipientName: 'Ana Silva',
    message: 'Lembrete: Reunião de equipe amanhã às 14h',
    scheduledFor: new Date('2024-03-22T13:00:00'),
    status: 'scheduled',
    type: 'text',
    createdAt: new Date('2024-03-21T10:00:00')
  },
  {
    id: '2',
    recipient: '+5511888888888',
    recipientName: 'Carlos Santos',
    message: 'Feliz aniversário! Desejamos muito sucesso! 🎉',
    scheduledFor: new Date('2024-03-25T09:00:00'),
    status: 'scheduled',
    type: 'template',
    templateId: 'birthday',
    createdAt: new Date('2024-03-21T08:00:00')
  }
];

export const MessageScheduler: React.FC = () => {
  const { config } = useWhatsApp();
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(mockScheduledMessages);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    recipientName: '',
    message: '',
    scheduledDate: new Date(),
    scheduledTime: '09:00',
    type: 'text' as 'text' | 'template'
  });

  const handleScheduleMessage = () => {
    if (!formData.recipient || !formData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = formData.scheduledTime.split(':');
    const scheduledDateTime = new Date(formData.scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Data inválida",
        description: "A data e hora devem ser no futuro.",
        variant: "destructive",
      });
      return;
    }

    const newMessage: ScheduledMessage = {
      id: Date.now().toString(),
      recipient: formData.recipient,
      recipientName: formData.recipientName || formData.recipient,
      message: formData.message,
      scheduledFor: scheduledDateTime,
      status: 'scheduled',
      type: formData.type,
      createdAt: new Date()
    };

    setScheduledMessages(prev => [newMessage, ...prev]);
    setFormData({
      recipient: '',
      recipientName: '',
      message: '',
      scheduledDate: new Date(),
      scheduledTime: '09:00',
      type: 'text'
    });
    setShowNewDialog(false);

    toast({
      title: "Mensagem agendada",
      description: "A mensagem foi agendada com sucesso.",
    });
  };

  const handleCancelMessage = (id: string) => {
    setScheduledMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, status: 'cancelled' as const } : msg
      )
    );
    
    toast({
      title: "Mensagem cancelada",
      description: "O agendamento foi cancelado.",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'sent': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'scheduled': 'Agendado',
      'sent': 'Enviado',
      'failed': 'Falhou',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Agendamento de Mensagens
            </CardTitle>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Mensagem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Agendar Nova Mensagem</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Telefone do Destinatário</Label>
                      <Input
                        placeholder="+55 11 99999-9999"
                        value={formData.recipient}
                        onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Nome do Destinatário (Opcional)</Label>
                      <Input
                        placeholder="Nome do contato"
                        value={formData.recipientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tipo de Mensagem</Label>
                    <Select value={formData.type} onValueChange={(value: 'text' | 'template') => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto Personalizado</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Mensagem</Label>
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {format(formData.scheduledDate, 'dd/MM/yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.scheduledDate}
                            onSelect={(date) => date && setFormData(prev => ({ ...prev, scheduledDate: date }))}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Hora</Label>
                      <Input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleScheduleMessage}>
                      Agendar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledMessages.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhuma mensagem agendada</p>
              </div>
            ) : (
              scheduledMessages.map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{message.recipientName}</span>
                        <span className="text-sm text-gray-500">{message.recipient}</span>
                        <Badge variant="outline">{message.type}</Badge>
                        <Badge className={getStatusColor(message.status)}>
                          {getStatusLabel(message.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{message.message}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          Agendado para: {format(message.scheduledFor, 'dd/MM/yyyy HH:mm')}
                        </span>
                        <span>
                          Criado: {format(message.createdAt, 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {message.status === 'scheduled' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelMessage(message.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
