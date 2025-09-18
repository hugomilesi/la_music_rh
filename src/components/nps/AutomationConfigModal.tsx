import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AutomationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
  config?: any;
  onSave: (config: any) => void;
}

export const AutomationConfigModal: React.FC<AutomationConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configuração de Automação</DialogTitle>
        </DialogHeader>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            A funcionalidade de automação foi simplificada. 
            As pesquisas NPS agora são enviadas manualmente através da página de gerenciamento.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};