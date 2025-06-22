
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Loader2, MessageSquare, Search, Users, User, X } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { toast } from '@/hooks/use-toast';
import { getContacts, searchContacts, formatPhoneNumber, type Contact } from '@/services/contactsService';

interface SendMessageDialogProps {
  children: React.ReactNode;
}

const messageTemplates = [
  { id: 'custom', name: 'Mensagem Personalizada', template: '' },
  { id: 'birthday', name: 'Aniversário', template: 'Parabéns pelo seu aniversário! Desejamos muito sucesso! 🎉' },
  { id: 'reminder', name: 'Lembrete', template: 'Lembrete: {assunto} agendado para {data} às {hora}.' },
  { id: 'welcome', name: 'Boas-vindas', template: 'Bem-vindo(a) à nossa equipe! Estamos felizes em tê-lo(a) conosco.' },
  { id: 'meeting', name: 'Reunião', template: 'Reunião agendada para {data} às {hora}. Local: {local}.' },
  { id: 'evaluation', name: 'Avaliação', template: 'Lembrete: Sua avaliação está agendada para {data} às {hora}.' },
  { id: 'document', name: 'Documento', template: 'Seu documento {documento} está próximo ao vencimento em {data}.' }
];

export const SendMessageDialog: React.FC<SendMessageDialogProps> = ({ children }) => {
  const { sendMessage, loading, config } = useWhatsApp();
  const [open, setOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [message, setMessage] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendMode, setSendMode] = useState<'single' | 'bulk'>('single');

  const allContacts = getContacts();
  const filteredContacts = useMemo(() => {
    if (!searchTerm) return allContacts;
    return searchContacts(searchTerm);
  }, [searchTerm, allContacts]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.template);
    }
  };

  const handleContactToggle = (contact: Contact, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contact]);
    } else {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    }
  };

  const removeSelectedContact = (contactId: string) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contactId));
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

    if (!message.trim()) {
      toast({
        title: "Mensagem obrigatória",
        description: "Digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    const recipients = sendMode === 'bulk' 
      ? selectedContacts 
      : customPhone 
        ? [{ name: 'Contato personalizado', phone: formatPhoneNumber(customPhone) }] 
        : [];

    if (recipients.length === 0) {
      toast({
        title: "Nenhum destinatário selecionado",
        description: "Selecione ao menos um destinatário para enviar a mensagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send messages to all selected recipients
      const sendPromises = recipients.map(async (recipient) => {
        const phone = 'phone' in recipient ? recipient.phone : recipient.phone;
        return sendMessage(phone, message.trim());
      });

      await Promise.all(sendPromises);

      toast({
        title: "Mensagens enviadas",
        description: `${recipients.length} mensagem(ns) enviada(s) com sucesso.`,
      });
      
      // Reset form
      setSelectedContacts([]);
      setCustomPhone('');
      setMessage('');
      setSelectedTemplate('custom');
      setSearchTerm('');
      setSendMode('single');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Falha ao enviar algumas mensagens. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Enviar Mensagem WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Send Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={sendMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSendMode('single')}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Envio Individual
            </Button>
            <Button
              variant={sendMode === 'bulk' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSendMode('bulk')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Envio em Lote
            </Button>
          </div>

          {/* Single Send Mode */}
          {sendMode === 'single' && (
            <div>
              <Label htmlFor="customPhone">Número do WhatsApp</Label>
              <Input
                id="customPhone"
                placeholder="+55 11 99999-9999"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
              />
            </div>
          )}

          {/* Bulk Send Mode */}
          {sendMode === 'bulk' && (
            <div className="space-y-4">
              <div>
                <Label>Buscar Contatos</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, telefone, unidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Selected Contacts */}
              {selectedContacts.length > 0 && (
                <div>
                  <Label>Contatos Selecionados ({selectedContacts.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedContacts.map((contact) => (
                      <Badge key={contact.id} variant="secondary" className="flex items-center gap-1">
                        {contact.name}
                        <button
                          onClick={() => removeSelectedContact(contact.id)}
                          className="ml-1 hover:bg-gray-300 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact List */}
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-2 p-3 hover:bg-gray-50">
                    <Checkbox
                      checked={selectedContacts.some(c => c.id === contact.id)}
                      onCheckedChange={(checked) => handleContactToggle(contact, checked as boolean)}
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
          )}

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
                  <p>• {"{documento}"} - Nome do documento</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {sendMode === 'bulk' && selectedContacts.length > 0 && (
                <span>{selectedContacts.length} destinatário(s) selecionado(s)</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar {sendMode === 'bulk' && selectedContacts.length > 0 ? `(${selectedContacts.length})` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
