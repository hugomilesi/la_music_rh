import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, TestTube, Loader2, CheckCircle, AlertCircle, Calendar, FileText, Gift } from 'lucide-react';
import { useEmailService } from '@/hooks/useEmailService';
import { toast } from 'sonner';

interface EmailTestDialogProps {
  children: React.ReactNode;
}

export const EmailTestDialog: React.FC<EmailTestDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [emailType, setEmailType] = useState<'general' | 'notification' | 'birthday' | 'ferias' | 'documento'>('general');
  const [to, setTo] = useState('hugogmilesi@gmail.com');
  const [subject, setSubject] = useState('Teste de Email - LA Music RH');
  const [message, setMessage] = useState('Este é um email de teste do sistema LA Music RH.');
  
  const { 
    sendEmail, 
    sendBirthdayNotifications, 
    sendVacationAlerts, 
    sendDocumentEmail,
    isLoading, 
    error, 
    success 
  } = useEmailService();

  const handleSendTestEmail = async () => {
    if (!to || !subject || !message) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    
    // console.log('📧 Tipo:', emailType);
    // console.log('📬 Destinatário:', to);
    // console.log('📝 Assunto:', subject);
    // console.log('💬 Mensagem:', message);
    // console.log('🔑 API Key Resend:', import.meta.env.VITE_RESEND_API_KEY ? 'Configurada' : 'NÃO CONFIGURADA');

    try {
      let result;
      
      switch (emailType) {
        case 'general':
          // console.log('📤 Enviando email geral...');
          result = await sendEmail({
            to: [to],
            subject,
            message
          });
          break;
          
        case 'birthday':
          // console.log('🎂 Enviando notificações de aniversário...');
          result = await sendBirthdayNotifications();
          break;
          
        case 'ferias':
          // console.log('🏖️ Enviando alertas de férias...');
          result = await sendVacationAlerts();
          break;
          
        case 'documento':
          // console.log('📄 Enviando email com documento...');
          result = await sendDocumentEmail({
            to: [to],
            employeeName: 'Colaborador Teste',
            documentType: 'Documento de Teste',
            message
          });
          break;
          
        default:
          // console.log('📤 Enviando email padrão...');
          result = await sendEmail({
            to: [to],
            subject,
            message
          });
      }



      if (result.success) {

        toast.success(`✅ Email ${emailType} enviado com sucesso para ${to}!`, {
          description: 'Verifique sua caixa de entrada e spam.',
          duration: 5000
        });
        if ('sent' in result && result.sent > 0) {
          toast.info(`📊 ${result.sent} email(s) enviado(s).`);
        }
      } else {
        // console.error('❌ Erro ao enviar email:', result.error);
        toast.error(`❌ Falha no envio: ${result.error || 'Erro desconhecido'}`, {
          description: 'Verifique as configurações de email e tente novamente.',
          duration: 7000
        });
      }
    } catch (err) {
      // console.error('💥 Erro inesperado ao enviar email de teste:', err);
      toast.error('💥 Erro inesperado ao enviar email.', {
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        duration: 7000
      });
    }
  };

  const getEmailTypeConfig = () => {
    switch (emailType) {
      case 'general':
        return {
          icon: <Mail className="w-4 h-4" />,
          title: 'Email Geral',
          description: 'Envio de email personalizado',
          color: 'bg-blue-500'
        };
      case 'notification':
        return {
          icon: <TestTube className="w-4 h-4" />,
          title: 'Notificação',
          description: 'Email de notificação do sistema',
          color: 'bg-purple-500'
        };
      case 'birthday':
        return {
          icon: <Gift className="w-4 h-4" />,
          title: 'Aniversários',
          description: 'Envio automático de aniversários do dia',
          color: 'bg-pink-500'
        };
      case 'ferias':
        return {
          icon: <Calendar className="w-4 h-4" />,
          title: 'Alertas de Férias',
          description: 'Alertas de férias próximas (próximos 7 dias)',
          color: 'bg-green-500'
        };
      case 'documento':
        return {
          icon: <FileText className="w-4 h-4" />,
          title: 'Documento',
          description: 'Email com documentos anexos',
          color: 'bg-orange-500'
        };
      default:
        return {
          icon: <Mail className="w-4 h-4" />,
          title: 'Email',
          description: 'Email padrão',
          color: 'bg-gray-500'
        };
    }
  };

  const config = getEmailTypeConfig();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Teste de Envio de Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipo de Email</CardTitle>
              <CardDescription>
                Selecione o tipo de email que deseja testar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={emailType} onValueChange={(value: any) => setEmailType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Geral
                    </div>
                  </SelectItem>
                  <SelectItem value="birthday">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Aniversários do Dia
                    </div>
                  </SelectItem>
                  <SelectItem value="ferias">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Alertas de Férias
                    </div>
                  </SelectItem>
                  <SelectItem value="documento">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Email com Documento
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  <span className="font-medium">{config.title}</span>
                </div>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          {(emailType === 'general' || emailType === 'documento') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuração do Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="to">Destinatário</Label>
                  <Input
                    id="to"
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Assunto do email"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Conteúdo da mensagem"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automatic Email Info */}
          {(emailType === 'birthday' || emailType === 'ferias') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Automático</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emailType === 'birthday' && (
                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-pink-600" />
                        <span className="font-medium text-pink-800">Aniversários do Dia</span>
                      </div>
                      <p className="text-sm text-pink-700">
                        Este teste enviará emails de parabéns para todos os colaboradores que fazem aniversário hoje.
                        Se não houver aniversariantes hoje, nenhum email será enviado.
                      </p>
                    </div>
                  )}
                  
                  {emailType === 'ferias' && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Alertas de Férias</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Este teste enviará alertas para o RH sobre férias que começam nos próximos 7 dias.
                        Se não houver férias programadas, nenhum email será enviado.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status */}
          {(error || success) && (
            <Card>
              <CardContent className="pt-6">
                {error && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Email enviado com sucesso!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Fechar
            </Button>
            <Button 
              onClick={handleSendTestEmail} 
              disabled={isLoading || ((emailType === 'general' || emailType === 'documento') && (!to || !subject || !message))}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Teste
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};