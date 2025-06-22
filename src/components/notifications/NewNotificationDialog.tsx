
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, X, MessageSquare, Mail, Users } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationType, NotificationChannel } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';

interface NewNotificationDialogProps {
  children: React.ReactNode;
}

export const NewNotificationDialog: React.FC<NewNotificationDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('personalizada');
  const [channel, setChannel] = useState<NotificationChannel>('whatsapp');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<string>('');
  
  const { createNotification, templates, recipients } = useNotifications();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message || selectedRecipients.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const recipientNames = recipients
        .filter(r => selectedRecipients.includes(r.id))
        .map(r => r.name);

      await createNotification({
        title,
        message,
        type,
        recipients: selectedRecipients,
        recipientNames,
        channel,
        status: 'rascunho',
        createdBy: 'Admin',
        templateId: templateId || undefined
      });

      toast({
        title: "Sucesso",
        description: "Notificação criada com sucesso!"
      });

      // Reset form
      setTitle('');
      setMessage('');
      setType('personalizada');
      setChannel('whatsapp');
      setSelectedRecipients([]);
      setTemplateId('');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar notificação",
        variant: "destructive"
      });
    }
  };

  const handleTemplateChange = (value: string) => {
    setTemplateId(value);
    const template = templates.find(t => t.id === value);
    if (template) {
      setTitle(template.subject);
      setMessage(template.message);
      setType(template.type);
    }
  };

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const selectAllRecipients = () => {
    setSelectedRecipients(recipients.map(r => r.id));
  };

  const clearRecipients = () => {
    setSelectedRecipients([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Notificação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Template (Opcional)</label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Criar do zero</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da notificação"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={type} onValueChange={(value) => setType(value as NotificationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizada">Personalizada</SelectItem>
                  <SelectItem value="lembrete">Lembrete</SelectItem>
                  <SelectItem value="aniversario">Aniversário</SelectItem>
                  <SelectItem value="aviso">Aviso</SelectItem>
                  <SelectItem value="comunicado">Comunicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">Mensagem *</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="min-h-[100px]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use variáveis como {"{name}"}, {"{date}"}, {"{time}"} que serão substituídas automaticamente
            </p>
          </div>

          {/* Channel */}
          <div>
            <label className="text-sm font-medium mb-2 block">Canal de Envio</label>
            <Select value={channel} onValueChange={(value) => setChannel(value as NotificationChannel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    WhatsApp
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </div>
                </SelectItem>
                <SelectItem value="ambos">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    WhatsApp + E-mail
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Destinatários *</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllRecipients}
                >
                  Selecionar Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearRecipients}
                >
                  Limpar
                </Button>
              </div>
            </div>
            
            {selectedRecipients.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">
                  Selecionados ({selectedRecipients.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedRecipients.map(id => {
                    const recipient = recipients.find(r => r.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {recipient?.name}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => toggleRecipient(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
              {recipients.map(recipient => (
                <div key={recipient.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={recipient.id}
                    checked={selectedRecipients.includes(recipient.id)}
                    onCheckedChange={() => toggleRecipient(recipient.id)}
                  />
                  <label htmlFor={recipient.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{recipient.name}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{recipient.role}</span>
                        <span>•</span>
                        <span>{recipient.unit}</span>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Criar Notificação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
