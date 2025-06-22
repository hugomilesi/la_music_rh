
import React from 'react';
import { Button } from '@/components/ui/button';
import { SendMessageDialog } from './SendMessageDialog';
import { MessageSquare } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

interface QuickSendButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  recipientPhone?: string;
  recipientName?: string;
  prefilledMessage?: string;
  children?: React.ReactNode;
}

export const QuickSendButton: React.FC<QuickSendButtonProps> = ({
  variant = 'outline',
  size = 'sm',
  className = '',
  recipientPhone,
  recipientName,
  prefilledMessage,
  children
}) => {
  const { config } = useWhatsApp();

  return (
    <SendMessageDialog>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        disabled={!config.isConfigured}
        title={!config.isConfigured ? 'Configure o WhatsApp primeiro' : 'Enviar mensagem via WhatsApp'}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        {children || 'WhatsApp'}
      </Button>
    </SendMessageDialog>
  );
};
