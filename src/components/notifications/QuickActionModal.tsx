
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Send, Calendar, MessageSquare, Mail, Users, User, X, Search } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useToast } from '@/hooks/use-toast';
import { getContacts, searchContacts, type Contact } from '@/services/contactsService';

interface QuickActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'birthday' | 'meeting' | 'announcement' | 'notice';
}

const actionTemplates = {
  birthday: {
    title: 'Parabéns pelo Aniversário!',
    message: 'Parabéns, {nome}! Desejamos muito sucesso e felicidade! 🎉',
    type: 'aniversario' as const,
    icon: '🎂',
    color: 'pink'
  },
  meeting: {
    title: 'Lembrete de Reunião',
    message: 'Lembrete: {nome}, você tem uma reunião agendada para {data} às {hora}. Local: {local}.',
    type: 'lembrete' as const,
    icon: '📅',
    color: 'blue'
  },
  announcement: {
    title: 'Comunicado Geral',
    message: 'Prezados colaboradores, informamos: {mensagem}',
    type: 'comunicado' as const,
    icon: '📢',
    color: 'purple'
  },
  notice: {
    title: 'Aviso Importante',
    message: 'Atenção: {mensagem}',
    type: 'aviso' as const,
    icon: '⚠️',
    color: 'orange'
  }
};

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  open,
  onOpenChange,
  actionType
}) => {
  const { createNotification, recipients } = useNotifications();
  const { sendMessage, config: whatsappConfig } = useWhatsApp();
  const { toast } = useToast();

  const template = actionTemplates[actionType];
  const [title, setTitle] = useState(template.title);
  const [message, setMessage] = useState(template.message);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'ambos'>('whatsapp');
  const [sendMode, setSendMode] = useState<'draft' | 'send' | 'agenda'>('send');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Template variables for different action types
  const [variables, setVariables] = useState<Record<string, string>>({
    nome: '',
    data: '',
    hora: '',
    local: '',
    mensagem: ''
  });

  const allContacts = getContacts();
  const filteredContacts = useMemo(() => {
    if (!searchTerm) return allContacts;
    return searchContacts(searchTerm);
  }, [searchTerm, allContacts]);

  const handleRecipientToggle = (recipientId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients(prev => [...prev, recipientId]);
    } else {
      setSelectedRecipients(prev => prev.filter(id => id !== recipientId));
    }
  };

  const selectAllRecipients = () => {
    setSelectedRecipients(recipients.map(r => r.id));
  };

  const clearAllRecipients = () => {
    setSelectedRecipients([]);
  };

  const replaceVariables = (text: string) => {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      if (value) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      }
    });
    return result;
  };

  const handleSubmit = async () => {
    if (selectedRecipients.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um destinatário",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const finalMessage = replaceVariables(message);
      const selectedRecipientData = recipients.filter(r => selectedRecipients.includes(r.id));
      
      // Create notification
      const notificationData = {
        title: replaceVariables(title),
        message: finalMessage,
        type: template.type,
        recipients: selectedRecipients,
        recipientNames: selectedRecipientData.map(r => r.name),
        channel,
        status: sendMode === 'draft' ? 'rascunho' as const : 
                sendMode === 'agenda' ? 'programado' as const : 'enviado' as const,
        scheduledFor: sendMode === 'agenda' ? scheduledDate : undefined,
        createdBy: 'Admin'
      };

      await createNotification(notificationData);

      // If sending immediately via WhatsApp
      if (sendMode === 'send' && (channel === 'whatsapp' || channel === 'ambos') && whatsappConfig.isConfigured) {
        const sendPromises = selectedRecipientData.map(async (recipient) => {
          if (recipient.phone) {
            return sendMessage(recipient.phone, finalMessage);
          }
        });
        
        await Promise.all(sendPromises.filter(Boolean));
      }

      const actionText = sendMode === 'draft' ? 'salvo como rascunho' : 
                        sendMode === 'agenda' ? 'programado' : 'enviado';

      toast({
        title: "Sucesso",
        description: `${template.title} ${actionText} com sucesso!`
      });

      onOpenChange(false);
      
      // Reset form
      setSelectedRecipients([]);
      setSearchTerm('');
      setVariables({ nome: '', data: '', hora: '', local: '', mensagem: '' });
      setSendMode('send');
      setScheduledDate('');
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar a ação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVariableFields = () => {
    const commonFields = ['nome'];
    
    switch (actionType) {
      case 'meeting':
        return [...commonFields, 'data', 'hora', 'local'];
      case 'announcement':
      case 'notice':
        return ['mensagem'];
      default:
        return commonFields;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{template.icon}</span>
            {template.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Variables */}
          {getVariableFields().length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Personalizar Mensagem</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getVariableFields().map((field) => (
                    <div key={field}>
                      <Label htmlFor={field} className="capitalize">
                        {field === 'nome' ? 'Nome (opcional - será preenchido automaticamente)' : 
                         field === 'data' ? 'Data' :
                         field === 'hora' ? 'Hora' :
                         field === 'local' ? 'Local' :
                         field === 'mensagem' ? 'Mensagem' : field}
                      </Label>
                      <Input
                        id={field}
                        value={variables[field]}
                        onChange={(e) => setVariables(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={
                          field === 'data' ? 'Ex: 15/03/2024' :
                          field === 'hora' ? 'Ex: 14:00' :
                          field === 'local' ? 'Ex: Sala de reuniões' :
                          field === 'mensagem' ? 'Digite sua mensagem...' :
                          'Deixe vazio para preencher automaticamente'
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Preview */}
          <div>
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-2"
            />
            <Label>Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Pré-visualização:</p>
              <p className="text-sm">{replaceVariables(message)}</p>
            </div>
          </div>

          {/* Channel Selection */}
          <div>
            <Label>Canal de Envio</Label>
            <Select value={channel} onValueChange={(value: any) => setChannel(value)}>
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
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="ambos">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    WhatsApp + Email
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Destinatários ({selectedRecipients.length} selecionados)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllRecipients}
                >
                  <Users className="w-4 h-4 mr-1" />
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

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar destinatários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-48 overflow-y-auto border rounded-lg">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2 p-3 hover:bg-gray-50">
                  <Checkbox
                    checked={selectedRecipients.includes(contact.id)}
                    onCheckedChange={(checked) => handleRecipientToggle(contact.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-500">
                      {contact.phone} • {contact.unit} • {contact.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Send Mode */}
          <div>
            <Label>Ação</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={sendMode === 'send' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSendMode('send')}
                disabled={!whatsappConfig.isConfigured && (channel === 'whatsapp' || channel === 'ambos')}
              >
                <Send className="w-4 h-4 mr-1" />
                Enviar Agora
              </Button>
              <Button
                type="button"
                variant={sendMode === 'agenda' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSendMode('agenda')}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Programar
              </Button>
              <Button
                type="button"
                variant={sendMode === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSendMode('draft')}
              >
                Salvar Rascunho
              </Button>
            </div>

            {sendMode === 'agenda' && (
              <div className="mt-3">
                <Label>Data e Hora</Label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            )}

            {!whatsappConfig.isConfigured && (channel === 'whatsapp' || channel === 'ambos') && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ WhatsApp não configurado. Configure a API do WhatsApp para enviar mensagens.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedRecipients.length === 0}
              className="min-w-[120px]"
            >
              {isLoading ? 'Processando...' : 
               (sendMode === 'send' ? 'Enviar' :
               sendMode === 'agenda' ? 'Programar' : 'Salvar')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickActionModal;
