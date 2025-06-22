
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { toast } from '@/hooks/use-toast';

interface SendMessageDialogProps {
  children: React.ReactNode;
}

const mockContacts = [
  { id: '1', name: 'Ana Silva', phone: '+5511999999999' },
  { id: '2', name: 'Carlos Santos', phone: '+5511888888888' },
  { id: '3', name: 'Maria Oliveira', phone: '+5511777777777' },
  { id: '4', name: 'João Costa', phone: '+5511666666666' },
  { id: '5', name: 'Lucia Ferreira', phone: '+5511555555555' }
];

const messageTemplates = [
  { id: 'custom', name: 'Mensagem Personalizada', template: '' },
  { id: 'birthday', name: 'Aniversário', template: 'Parabéns pelo seu aniversário! Desejamos muito sucesso! 🎉' },
  { id: 'reminder', name: 'Lembrete', template: 'Lembrete: {assunto} agendado para {data} às {hora}.' },
  { id: 'welcome', name: 'Boas-vindas', template: 'Bem-vindo(a) à nossa equipe! Estamos felizes em tê-lo(a) conosco.' },
  { id: 'meeting', name: 'Reunião', template: 'Reunião agendada para {data} às {hora}. Local: {local}.' }
];

export const SendMessageDialog: React.FC<SendMessageDialogProps> = ({ children }) => {
  const { sendMessage, loading, config } = useWhatsApp();
  const [open, setOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [message, setMessage] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.template);
    }
  };

  const handleSend = async () => {
    if (!config.isConfigured) {
      toast({
        title: "WhatsApp não configurado",
        description: "Configure a API do WhatsApp antes de enviar mensagens.",
        variant: "destructive",
      });
      return;
    }

    const recipient = selectedContact || customPhone;
    if (!recipient || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um destinatário e digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMessage(recipient, message.trim());
      toast({
        title: "Mensagem enviada",
        description: "A mensagem foi enviada com sucesso.",
      });
      
      // Reset form
      setSelectedContact('');
      setCustomPhone('');
      setMessage('');
      setSelectedTemplate('custom');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Falha ao enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
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
            <MessageSquare className="w-5 h-5" />
            Enviar Mensagem WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!config.isConfigured && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ WhatsApp não configurado. Configure a API antes de enviar mensagens.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recipient Selection */}
          <div className="space-y-4">
            <div>
              <Label>Destinatário</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contato" />
                </SelectTrigger>
                <SelectContent>
                  {mockContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.phone}>
                      {contact.name} - {contact.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customPhone">Ou digite um número</Label>
              <Input
                id="customPhone"
                placeholder="+55 11 99999-9999"
                value={customPhone}
                onChange={(e) => {
                  setCustomPhone(e.target.value);
                  setSelectedContact('');
                }}
              />
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <Label>Modelo de Mensagem</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Content */}
          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-sm text-gray-500 mt-1">
              Caracteres: {message.length}/1000
            </p>
          </div>

          {/* Variables Help */}
          {selectedTemplate !== 'custom' && (
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  Variáveis disponíveis:
                </p>
                <div className="text-blue-700 text-sm space-y-1">
                  <p>• {"{nome}"} - Nome do destinatário</p>
                  <p>• {"{data}"} - Data</p>
                  <p>• {"{hora}"} - Hora</p>
                  <p>• {"{local}"} - Local</p>
                  <p>• {"{assunto}"} - Assunto</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={loading || !config.isConfigured}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
