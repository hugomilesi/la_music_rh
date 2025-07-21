
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

interface NewNotificationDialogProps {
  children: React.ReactNode;
}

export const NewNotificationDialog: React.FC<NewNotificationDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [channel, setChannel] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const { recipients, createNotification } = useNotifications();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message || !type || !channel || selectedRecipients.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedRecipientNames = recipients
        .filter(r => selectedRecipients.includes(r.id))
        .map(r => r.name);

      await createNotification({
        title,
        message,
        type: type as any,
        recipients: selectedRecipients,
        recipientNames: selectedRecipientNames,
        channel: channel as any,
        status: 'rascunho',
        createdBy: 'Admin'
      });

      toast({
        title: "Sucesso",
        description: "Notificação criada como rascunho!"
      });

      // Reset form
      setTitle('');
      setMessage('');
      setType('');
      setChannel('');
      setSelectedRecipients([]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar notificação",
        variant: "destructive"
      });
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

  const clearAllRecipients = () => {
    setSelectedRecipients([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Notificação
          </DialogTitle>
          <DialogDescription>
            Crie uma nova notificação para enviar aos funcionários via WhatsApp ou e-mail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da notificação"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo *</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lembrete">Lembrete</SelectItem>
                  <SelectItem value="aniversario">Aniversário</SelectItem>
                  <SelectItem value="aviso">Aviso</SelectItem>
                  <SelectItem value="comunicado">Comunicado</SelectItem>
                  <SelectItem value="personalizada">Personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Mensagem *</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem da notificação"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Canal de Envio *</label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o canal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Destinatários * ({selectedRecipients.length} selecionados)</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllRecipients}
                >
                  Todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearAllRecipients}
                >
                  Limpar
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {recipients.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  Nenhum destinatário disponível
                </div>
              ) : (
                <div className="space-y-3">
                  {recipients.map(recipient => (
                    <div key={recipient.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={recipient.id}
                        checked={selectedRecipients.includes(recipient.id)}
                        onCheckedChange={() => toggleRecipient(recipient.id)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={recipient.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {recipient.name}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {recipient.unit}
                          </Badge>
                          <span className="text-xs text-gray-500">{recipient.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Rascunho
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
