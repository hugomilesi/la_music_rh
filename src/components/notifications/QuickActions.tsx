
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Calendar, Mail, Send } from 'lucide-react';
import { NewNotificationDialog } from './NewNotificationDialog';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

export const QuickActions: React.FC = () => {
  const { createNotification, recipients } = useNotifications();
  const { toast } = useToast();

  const handleQuickAction = async (type: 'birthday' | 'meeting' | 'announcement' | 'notice') => {
    let title = '';
    let message = '';
    let notificationType: any = 'personalizada';

    switch (type) {
      case 'birthday':
        // Find today's birthdays (mock logic)
        title = 'Parabéns pelo Aniversário!';
        message = 'Parabéns pelo seu aniversário! Desejamos muito sucesso e felicidade! 🎉';
        notificationType = 'aniversario';
        break;
      
      case 'meeting':
        title = 'Lembrete de Reunião';
        message = 'Lembrete: Você tem uma reunião agendada. Por favor, confirme sua presença.';
        notificationType = 'lembrete';
        break;
      
      case 'announcement':
        title = 'Comunicado Geral';
        message = 'Prezados colaboradores, informamos sobre uma atualização importante. Mais detalhes em breve.';
        notificationType = 'comunicado';
        break;
      
      case 'notice':
        title = 'Aviso Importante';
        message = 'Atenção: Este é um aviso importante para todos os colaboradores.';
        notificationType = 'aviso';
        break;
    }

    try {
      // For quick actions, we'll select all recipients by default
      const allRecipientIds = recipients.map(r => r.id);
      const allRecipientNames = recipients.map(r => r.name);

      await createNotification({
        title,
        message,
        type: notificationType,
        recipients: allRecipientIds,
        recipientNames: allRecipientNames,
        channel: 'whatsapp',
        status: 'rascunho',
        createdBy: 'Admin'
      });

      toast({
        title: "Sucesso",
        description: `${title} criado como rascunho! Você pode editá-lo antes de enviar.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar notificação",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => handleQuickAction('birthday')}
          >
            <MessageSquare className="w-6 h-6" />
            Aniversário do Dia
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => handleQuickAction('meeting')}
          >
            <Calendar className="w-6 h-6" />
            Lembrete de Reunião
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => handleQuickAction('announcement')}
          >
            <Mail className="w-6 h-6" />
            Comunicado Geral
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => handleQuickAction('notice')}
          >
            <Send className="w-6 h-6" />
            Aviso Importante
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
