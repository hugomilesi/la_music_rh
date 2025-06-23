
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { Notification } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';

interface NotificationDetailsModalProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (notification: Notification) => void;
  onDelete?: (id: string) => void;
}

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  notification,
  open,
  onOpenChange,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();

  if (!notification) return null;

  const getTypeBadge = (type: string) => {
    const variants = {
      'lembrete': 'bg-blue-100 text-blue-800',
      'aniversario': 'bg-pink-100 text-pink-800',
      'aviso': 'bg-yellow-100 text-yellow-800',
      'comunicado': 'bg-purple-100 text-purple-800',
      'personalizada': 'bg-gray-100 text-gray-800'
    };
    return variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'enviado': 'bg-green-100 text-green-800',
      'programado': 'bg-blue-100 text-blue-800',
      'rascunho': 'bg-gray-100 text-gray-800',
      'entregue': 'bg-green-100 text-green-800',
      'lido': 'bg-blue-100 text-blue-800',
      'falhado': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'ambos':
        return <Send className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
      case 'entregue':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'lido':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'programado':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'rascunho':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'falhado':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {getChannelIcon(notification.channel)}
            Detalhes da Notificação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{notification.title}</h3>
                <Badge className={getTypeBadge(notification.type)}>
                  {notification.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(notification.status)}
                <Badge className={getStatusBadge(notification.status)}>
                  {notification.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message Content */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Mensagem</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border relative">
                <p className="text-gray-900 whitespace-pre-wrap">{notification.message}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(notification.message)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <label className="text-sm font-medium text-gray-700">Destinatários ({notification.recipients.length})</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {notification.recipientNames.map((name, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Channel */}
            <div>
              <label className="text-sm font-medium text-gray-700">Canal de Envio</label>
              <div className="mt-1 flex items-center gap-2">
                {getChannelIcon(notification.channel)}
                <span className="capitalize">{notification.channel}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Criado em</label>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {formatDate(notification.createdAt)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Por: {notification.createdBy}</p>
            </div>

            {notification.scheduledFor && (
              <div>
                <label className="text-sm font-medium text-gray-700">Programado para</label>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {formatDate(notification.scheduledFor)}
                </div>
              </div>
            )}

            {notification.sentAt && (
              <div>
                <label className="text-sm font-medium text-gray-700">Enviado em</label>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Send className="w-4 h-4" />
                  {formatDate(notification.sentAt)}
                </div>
              </div>
            )}
          </div>

          {/* Metadata/Statistics */}
          {notification.metadata && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-700">Estatísticas de Entrega</label>
                <div className="mt-1 grid grid-cols-3 gap-4">
                  {notification.metadata.deliveredCount !== undefined && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {notification.metadata.deliveredCount}
                      </div>
                      <div className="text-sm text-green-700">Entregues</div>
                    </div>
                  )}
                  
                  {notification.metadata.readCount !== undefined && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {notification.metadata.readCount}
                      </div>
                      <div className="text-sm text-blue-700">Lidas</div>
                    </div>
                  )}
                  
                  {notification.metadata.failedCount !== undefined && (
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {notification.metadata.failedCount}
                      </div>
                      <div className="text-sm text-red-700">Falhas</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              ID: {notification.id}
            </div>
            
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(notification)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
