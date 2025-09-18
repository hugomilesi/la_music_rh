import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface NPSWhatsAppTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NPSWhatsAppTestModal: React.FC<NPSWhatsAppTestModalProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Teste de WhatsApp NPS</DialogTitle>
        </DialogHeader>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            A funcionalidade de teste de WhatsApp foi simplificada. 
            As pesquisas NPS agora são enviadas diretamente através do sistema simplificado.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};