
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

interface ScheduleSendModalProps {
  children: React.ReactNode;
}

export const ScheduleSendModal: React.FC<ScheduleSendModalProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const { notifications, scheduleNotification } = useNotifications();
  const { toast } = useToast();

  const draftNotifications = notifications.filter(n => n.status === 'rascunho');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedNotification || !date || !time) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    try {
      const scheduledFor = new Date(`${date}T${time}`).toISOString();
      await scheduleNotification(selectedNotification, scheduledFor);

      toast({
        title: "Sucesso",
        description: "Notificação agendada com sucesso!"
      });

      setSelectedNotification('');
      setDate('');
      setTime('');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao agendar notificação",
        variant: "destructive"
      });
    }
  };

  // Get current date and time for minimum values
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Programar Envio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Notificação</label>
            <Select value={selectedNotification} onValueChange={setSelectedNotification}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma notificação..." />
              </SelectTrigger>
              <SelectContent>
                {draftNotifications.length === 0 ? (
                  <SelectItem value="" disabled>
                    Nenhum rascunho disponível
                  </SelectItem>
                ) : (
                  draftNotifications.map(notification => (
                    <SelectItem key={notification.id} value={notification.id}>
                      {notification.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Horário</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                min={date === today ? currentTime : undefined}
                required
              />
            </div>
          </div>

          {/* Quick Schedule Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">Opções Rápidas</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setDate(tomorrow.toISOString().split('T')[0]);
                  setTime('09:00');
                }}
              >
                Amanhã 9h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setDate(nextWeek.toISOString().split('T')[0]);
                  setTime('10:00');
                }}
              >
                Próxima semana
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Clock className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
