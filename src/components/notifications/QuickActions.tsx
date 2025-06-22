
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Calendar, Mail, Send } from 'lucide-react';
import { QuickActionModal } from './QuickActionModal';

export const QuickActions: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'birthday' | 'meeting' | 'announcement' | 'notice' | null>(null);

  const handleQuickAction = (type: 'birthday' | 'meeting' | 'announcement' | 'notice') => {
    setActiveModal(type);
  };

  return (
    <>
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

      {/* Quick Action Modals */}
      <QuickActionModal
        open={activeModal === 'birthday'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        actionType="birthday"
      />
      <QuickActionModal
        open={activeModal === 'meeting'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        actionType="meeting"
      />
      <QuickActionModal
        open={activeModal === 'announcement'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        actionType="announcement"
      />
      <QuickActionModal
        open={activeModal === 'notice'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        actionType="notice"
      />
    </>
  );
};
